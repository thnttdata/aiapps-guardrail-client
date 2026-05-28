"""
Unified LLM client that routes to OpenAI or LiteLLM proxy based on config.
Exposes chat_completion, get_embeddings, get_models with same signatures as openai_client.
"""
import ast
import copy
import openai
import httpx
from typing import List, Dict, Any, Optional, Union

from .database import get_db
from .models import AppConfig, LLMIntegration

# Timeout for LiteLLM /v1/models request (seconds)
LITELLM_MODELS_TIMEOUT = 10.0

STATIC_MODELS = [
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
    "anthropic-claude",
    "ollama-llama",
    "ollama-mistral",
]


def _supports_custom_temperature(model: str) -> bool:
    """
    GPT-5 family currently rejects non-default temperature values on chat completions.
    """
    name = (model or "").strip().lower()
    return not name.startswith("gpt-5")


class LiteLLMGuardrailError(Exception):
    """Raised when LiteLLM guardrails block a response and return detector details."""

    def __init__(self, message: str, lakera_status: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.lakera_status = lakera_status or {}


def _normalize_litellm_lakera_message_ids(status: Dict[str, Any]) -> Dict[str, Any]:
    """
    LiteLLM Lakera payloads can be offset by +1 vs direct Lakera indexing expected by UI.
    Shift message_id >= 1 down by one.
    """
    out = copy.deepcopy(status)

    def shift_entry(entry: Any) -> None:
        if not isinstance(entry, dict):
            return
        mid = entry.get("message_id")
        if isinstance(mid, int) and mid >= 1:
            entry["message_id"] = mid - 1

    for item in out.get("breakdown") or []:
        shift_entry(item)
    for item in out.get("payload") or []:
        shift_entry(item)
    return out


def _extract_litellm_guardrail_status(e: openai.APIStatusError) -> Optional[Dict[str, Any]]:
    """
    Parse LiteLLM 400 guardrail error payload into a Lakera-shaped status object.
    """
    try:
        payload = e.response.json() if e.response is not None else {}
    except Exception:
        payload = {}

    error_obj = payload.get("error") if isinstance(payload, dict) else None
    if not isinstance(error_obj, dict):
        return None

    # Preferred shape
    direct = error_obj.get("lakera_guard_response")
    if isinstance(direct, dict):
        return _normalize_litellm_lakera_message_ids(direct)

    # Some LiteLLM errors embed a Python-dict-like string in error.message
    raw_message = error_obj.get("message")
    if not isinstance(raw_message, str) or not raw_message.strip():
        return None
    try:
        parsed_obj = ast.literal_eval(raw_message.strip())
    except Exception:
        return None
    if not isinstance(parsed_obj, dict):
        return None
    nested = parsed_obj.get("lakera_guardrail_response")
    if isinstance(nested, dict):
        return _normalize_litellm_lakera_message_ids(nested)
    return None


def effective_llm_api_key(cfg: Optional[AppConfig]) -> Optional[str]:
    """
    Bearer / API key for the current mode: direct OpenAI uses openai_api_key;
    LiteLLM proxy uses litellm_virtual_key (may be empty string if unset).
    """
    if not cfg:
        return None
    if getattr(cfg, "use_litellm", False):
        return getattr(cfg, "litellm_virtual_key", None) or ""
    return cfg.openai_api_key


def llm_credentials_configured(cfg: Optional[AppConfig]) -> bool:
    """OpenAI direct mode requires an API key; LiteLLM mode allows an empty virtual key."""
    if not cfg:
        return False
    if getattr(cfg, "use_litellm", False):
        return True
    return bool(cfg.openai_api_key)


def _get_config() -> Optional[AppConfig]:
    """Load config from database"""
    db = next(get_db())
    try:
        return db.query(AppConfig).first()
    finally:
        db.close()


def _call_openai_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    api_key: str,
    tools: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Call OpenAI API directly for chat completion"""
    client = openai.OpenAI(api_key=api_key)
    effective_temperature = temperature if _supports_custom_temperature(model) else None
    params = {
        "model": model,
        "messages": messages,
        "temperature": effective_temperature,
        "tools": tools,
        "tool_choice": "auto" if tools else None,
    }
    params = {k: v for k, v in params.items() if v is not None}
    response = client.chat.completions.create(**params)
    return response.model_dump()


def _call_gateway_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    api_key: str,
    base_url: str,
    tools: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Call a generic AI Gateway or custom OpenAI-compatible endpoint"""
    client = openai.OpenAI(api_key=api_key, base_url=base_url.rstrip('/'))
    effective_temperature = temperature if _supports_custom_temperature(model) else None
    params = {
        "model": model,
        "messages": messages,
        "temperature": effective_temperature,
        "tools": tools,
        "tool_choice": "auto" if tools else None,
    }
    params = {k: v for k, v in params.items() if v is not None}
    response = client.chat.completions.create(**params)
    return response.model_dump()



def _call_litellm_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    api_key: str,
    base_url: str,
    tools: Optional[List[Dict[str, Any]]] = None,
    litellm_guardrail_name: Optional[str] = None,
    litellm_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Call LiteLLM proxy for chat completion (OpenAI-compatible API)"""
    client = openai.OpenAI(api_key=api_key, base_url=f"{base_url.rstrip('/')}/v1")
    effective_temperature = temperature if _supports_custom_temperature(model) else None
    extra_body: Dict[str, Any] = {}
    if litellm_guardrail_name:
        # LiteLLM expects guardrails as a list; singular guardrail_name can be forwarded upstream.
        extra_body["guardrails"] = [litellm_guardrail_name]
    if litellm_metadata:
        extra_body["metadata"] = litellm_metadata
    params = {
        "model": model,
        "messages": messages,
        "temperature": effective_temperature,
        "tools": tools,
        "tool_choice": "auto" if tools else None,
        "extra_body": extra_body if extra_body else None,
    }
    params = {k: v for k, v in params.items() if v is not None}
    response = client.chat.completions.create(**params)
    return response.model_dump()


def _get_embeddings_openai(texts: List[str], api_key: str) -> List[List[float]]:
    """Get embeddings from OpenAI directly"""
    client = openai.OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=texts,
    )
    return [embedding.embedding for embedding in response.data]


def _get_embeddings_litellm(
    texts: List[str], api_key: str, base_url: str
) -> List[List[float]]:
    """Get embeddings from LiteLLM proxy"""
    client = openai.OpenAI(api_key=api_key, base_url=f"{base_url.rstrip('/')}/v1")
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=texts,
    )
    return [embedding.embedding for embedding in response.data]


def _get_integration(provider: str) -> Optional[LLMIntegration]:
    """Load integration from database"""
    db = next(get_db())
    try:
        return db.query(LLMIntegration).filter(LLMIntegration.provider == provider).first()
    finally:
        db.close()


def _call_claude_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    api_key: str,
    api_version: Optional[str] = "2023-06-01",
) -> Dict[str, Any]:
    """Call Anthropic Claude API for chat completion"""
    system_content = []
    non_system_messages = []
    for msg in messages:
        role = msg.get("role") or "user"
        content = msg.get("content") or ""
        if role == "system":
            system_content.append(content)
        else:
            # Claude role must be "user" or "assistant"
            non_system_messages.append({"role": role, "content": content})

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": api_version or "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": model,
        "messages": non_system_messages,
        "max_tokens": 4096,
        "temperature": temperature,
    }
    if system_content:
        payload["system"] = "\n\n".join(system_content)

    with httpx.Client() as client:
        resp = client.post(url, headers=headers, json=payload, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()

    content_text = ""
    if "content" in data and isinstance(data["content"], list):
        content_text = "".join([c.get("text", "") for c in data["content"] if c.get("type") == "text"])

    return {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content_text,
                    "tool_calls": None,
                }
            }
        ],
        "model": model,
    }


def _call_minimax_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    api_key: str,
    config_json: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Call Minimax V2 API for chat completion"""
    config_json = config_json or {}
    group_id = config_json.get("group_id")
    url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    if group_id:
        url += f"?GroupId={group_id}"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }

    with httpx.Client() as client:
        resp = client.post(url, headers=headers, json=payload, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()

    # Extract choices
    choices = data.get("choices", [])
    content_text = ""
    if choices and isinstance(choices, list):
        choice = choices[0]
        message = choice.get("message", {})
        content_text = message.get("content") or ""

    return {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content_text,
                    "tool_calls": None,
                }
            }
        ],
        "model": model,
    }


def _get_vertex_access_token(credentials_json_str: str) -> str:
    """Generate OAuth2 Access Token for Vertex AI using service account key"""
    import json
    import time
    from jose import jwt

    credentials = json.loads(credentials_json_str)
    private_key = credentials["private_key"]
    private_key_id = credentials.get("private_key_id")
    client_email = credentials["client_email"]
    token_uri = credentials.get("token_uri", "https://oauth2.googleapis.com/token")

    now = int(time.time())
    claims = {
        "iss": client_email,
        "sub": client_email,
        "aud": token_uri,
        "iat": now,
        "exp": now + 3600,
        "scope": "https://www.googleapis.com/auth/cloud-platform",
    }

    headers = {}
    if private_key_id:
        headers["kid"] = private_key_id

    signed_jwt = jwt.encode(claims, private_key, algorithm="RS256", headers=headers)

    with httpx.Client() as client:
        resp = client.post(
            token_uri,
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": signed_jwt,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        token_data = resp.json()
        return token_data["access_token"]


def _call_gemini_studio_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    api_key: str,
) -> Dict[str, Any]:
    """Call Google AI Studio (Gemini Developer API) for chat completion"""
    system_parts = []
    contents = []

    for msg in messages:
        role = msg.get("role") or "user"
        content = msg.get("content") or ""

        if role == "system":
            system_parts.append({"text": content})
        else:
            gemini_role = "model" if role == "assistant" else "user"
            contents.append({"role": gemini_role, "parts": [{"text": content}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 4096,
        },
    }

    if system_parts:
        payload["systemInstruction"] = {"parts": system_parts}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json",
    }

    with httpx.Client() as client:
        resp = client.post(url, headers=headers, json=payload, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()

    content_text = ""
    candidates = data.get("candidates", [])
    if candidates and isinstance(candidates, list):
        candidate = candidates[0]
        content_dict = candidate.get("content", {})
        parts = content_dict.get("parts", [])
        if parts and isinstance(parts, list):
            content_text = "".join([part.get("text", "") for part in parts if part.get("text")])

    return {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content_text,
                    "tool_calls": None,
                }
            }
        ],
        "model": model,
    }


def _call_vertex_ai_chat(
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    credentials_json: str,
    project_id: str,
    location: str = "us-central1",
) -> Dict[str, Any]:
    """Call Vertex AI Gemini API for chat completion"""
    access_token = _get_vertex_access_token(credentials_json)

    system_parts = []
    contents = []

    for msg in messages:
        role = msg.get("role") or "user"
        content = msg.get("content") or ""

        if role == "system":
            system_parts.append({"text": content})
        else:
            gemini_role = "model" if role == "assistant" else "user"
            contents.append({"role": gemini_role, "parts": [{"text": content}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 4096,
        },
    }

    if system_parts:
        payload["systemInstruction"] = {"parts": system_parts}

    url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model}:generateContent"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    with httpx.Client() as client:
        resp = client.post(url, headers=headers, json=payload, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()

    content_text = ""
    candidates = data.get("candidates", [])
    if candidates and isinstance(candidates, list):
        candidate = candidates[0]
        content_dict = candidate.get("content", {})
        parts = content_dict.get("parts", [])
        if parts and isinstance(parts, list):
            content_text = "".join([part.get("text", "") for part in parts if part.get("text")])

    return {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content_text,
                    "tool_calls": None,
                }
            }
        ],
        "model": model,
    }


async def test_provider_connection(integration) -> tuple[bool, str]:
    """Test connection to the specified LLM integration."""
    provider = integration.provider
    api_key = integration.api_key
    model_name = integration.model_name
    config_json = integration.config_json or {}

    test_messages = [{"role": "user", "content": "Hello, respond with 1 word."}]

    try:
        if provider == "openai":
            if not api_key:
                return False, "API key is required for OpenAI"
            _call_openai_chat(
                messages=test_messages,
                model=model_name or "gpt-4o-mini",
                temperature=0.7,
                api_key=api_key,
            )
            return True, "Successfully connected to OpenAI."

        elif provider == "claude":
            if not api_key:
                return False, "API key is required for Claude"
            _call_claude_chat(
                messages=test_messages,
                model=model_name or "claude-3-5-sonnet-20241022",
                temperature=0.7,
                api_key=api_key,
                api_version=config_json.get("api_version"),
            )
            return True, "Successfully connected to Claude."

        elif provider == "minimax":
            if not api_key:
                return False, "API key is required for Minimax"
            _call_minimax_chat(
                messages=test_messages,
                model=model_name or "abab6.5-chat",
                temperature=0.7,
                api_key=api_key,
                config_json=config_json,
            )
            return True, "Successfully connected to Minimax."

        elif provider == "vertex_ai":
            credentials_json = config_json.get("credentials_json")
            if not credentials_json:
                return False, "Credentials JSON is required for Vertex AI"
            project_id = config_json.get("project_id")
            location = config_json.get("location", "us-central1")
            if not project_id:
                return False, "Project ID is required for Vertex AI"

            _call_vertex_ai_chat(
                messages=test_messages,
                model=model_name or "gemini-1.5-flash",
                temperature=0.7,
                credentials_json=credentials_json,
                project_id=project_id,
                location=location,
            )
            return True, "Successfully connected to Vertex AI."

        elif provider == "gemini":
            if not api_key:
                return False, "API key is required for Gemini (Google AI Studio)"
            _call_gemini_studio_chat(
                messages=test_messages,
                model=model_name or "gemini-1.5-flash",
                temperature=0.7,
                api_key=api_key,
            )
            return True, "Successfully connected to Google AI Studio Gemini."

        elif provider == "ai_gateway":
            if not api_key:
                return False, "API key is required for AI Gateway"
            api_base = getattr(integration, "api_base", None)
            if not api_base:
                return False, "API Base URL is required for AI Gateway"
            _call_gateway_chat(
                messages=test_messages,
                model=model_name or "gpt-4o-mini",
                temperature=0.7,
                api_key=api_key,
                base_url=api_base,
            )
            return True, "Successfully connected to AI Gateway."


        else:
            return False, f"Unknown provider: {provider}"
    except Exception as e:
        return False, f"Connection failed: {str(e)}"


def chat_completion(
    messages: List[Dict[str, str]],
    model: str = "gpt-4o",
    temperature: Union[float, str, int, None] = 0.7,
    tools: Optional[List[Dict[str, Any]]] = None,
    config: Optional[AppConfig] = None,
    litellm_guardrail_name: Optional[str] = None,
    litellm_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Send chat completion request. Routes to active LLM provider (OpenAI, Claude, Minimax, Vertex AI).
    temperature: 0-10 scale (converted to 0-1 internally), or float 0-1.
    """
    cfg = config or _get_config()
    if not cfg:
        raise Exception("Configure LLM settings in Admin → Security")

    active_provider = getattr(cfg, "active_llm_provider", "openai") or "openai"
    integration = _get_integration(active_provider)

    # Resolve the model: prefer integration specific model name
    resolved_model = model
    if integration and integration.model_name:
        resolved_model = integration.model_name

    try:
        temp_float = float(temperature) if temperature is not None else 0.7
    except (ValueError, TypeError):
        temp_float = 0.7
    # Convert 0-10 scale to 0-1
    if temp_float > 1.0:
        temp_float = temp_float / 10.0

    if active_provider == "openai":
        use_litellm = getattr(cfg, "use_litellm", False)
        if use_litellm:
            api_key = effective_llm_api_key(cfg) or ""
        else:
            if integration and integration.api_key:
                api_key = integration.api_key
            else:
                api_key = cfg.openai_api_key or ""

        if not use_litellm and not api_key:
            raise Exception("Configure OpenAI API key in Admin → Security or LLM Integration Settings")

        litellm_base_url = getattr(cfg, "litellm_base_url", None) or "http://localhost:4000"

        try:
            if use_litellm:
                return _call_litellm_chat(
                    messages=messages,
                    model=resolved_model,
                    temperature=temp_float,
                    api_key=api_key,
                    base_url=litellm_base_url,
                    tools=tools,
                    litellm_guardrail_name=litellm_guardrail_name,
                    litellm_metadata=litellm_metadata,
                )
            else:
                return _call_openai_chat(
                    messages=messages,
                    model=resolved_model,
                    temperature=temp_float,
                    api_key=api_key,
                    tools=tools,
                )
        except openai.APIConnectionError as e:
            if use_litellm:
                raise Exception(
                    f"LiteLLM proxy unreachable: {e}. Is LiteLLM running on {litellm_base_url}?"
                ) from e
            raise
        except openai.APIStatusError as e:
            if use_litellm and getattr(e, "status_code", None) == 400:
                lakera_status = _extract_litellm_guardrail_status(e)
                if lakera_status:
                    raise LiteLLMGuardrailError("LiteLLM guardrail blocked this response.", lakera_status) from e
            raise Exception(f"LLM API error: {e}") from e

    elif active_provider == "claude":
        if not integration or not integration.api_key:
            raise Exception("Claude integration is not configured. Please set an API key in Admin.")
        config_json = integration.config_json or {}
        return _call_claude_chat(
            messages=messages,
            model=resolved_model or "claude-3-5-sonnet-20241022",
            temperature=temp_float,
            api_key=integration.api_key,
            api_version=config_json.get("api_version"),
        )

    elif active_provider == "minimax":
        if not integration or not integration.api_key:
            raise Exception("Minimax integration is not configured. Please set an API key in Admin.")
        return _call_minimax_chat(
            messages=messages,
            model=resolved_model or "abab6.5-chat",
            temperature=temp_float,
            api_key=integration.api_key,
            config_json=integration.config_json,
        )

    elif active_provider == "vertex_ai":
        if not integration:
            raise Exception("Vertex AI integration is not configured.")
        config_json = integration.config_json or {}
        credentials_json = config_json.get("credentials_json")
        project_id = config_json.get("project_id")
        location = config_json.get("location", "us-central1")
        if not credentials_json or not project_id:
            raise Exception("Vertex AI integration is not configured with Credentials JSON and Project ID.")
        return _call_vertex_ai_chat(
            messages=messages,
            model=resolved_model or "gemini-1.5-flash",
            temperature=temp_float,
            credentials_json=credentials_json,
            project_id=project_id,
            location=location,
        )

    elif active_provider == "gemini":
        if not integration or not integration.api_key:
            raise Exception("Gemini integration is not configured. Please set an API key in Admin.")
        return _call_gemini_studio_chat(
            messages=messages,
            model=resolved_model or "gemini-1.5-flash",
            temperature=temp_float,
            api_key=integration.api_key,
        )

    elif active_provider == "ai_gateway":
        if not integration or not integration.api_key:
            raise Exception("AI Gateway integration is not configured. Please set an API key in Admin.")
        api_base = getattr(integration, "api_base", None)
        if not api_base:
            raise Exception("AI Gateway integration is not configured. Please set an API Base URL in Admin.")
        return _call_gateway_chat(
            messages=messages,
            model=resolved_model or "gpt-4o-mini",
            temperature=temp_float,
            api_key=integration.api_key,
            base_url=api_base,
            tools=tools,
        )

    else:
        raise Exception(f"Unknown active LLM provider: {active_provider}")


def get_embeddings(texts: List[str], config: Optional[AppConfig] = None) -> List[List[float]]:
    """Get embeddings for text chunks. Routes to OpenAI or LiteLLM based on config."""
    cfg = config or _get_config()
    if not cfg:
        raise Exception("Configure LLM API key in Admin → Security")

    use_litellm = getattr(cfg, "use_litellm", False)
    if not use_litellm and not cfg.openai_api_key:
        raise Exception("Configure LLM API key in Admin → Security")

    api_key = effective_llm_api_key(cfg) or ""

    litellm_base_url = getattr(cfg, "litellm_base_url", None) or "http://localhost:4000"

    try:
        if use_litellm:
            return _get_embeddings_litellm(
                texts=texts,
                api_key=api_key,
                base_url=litellm_base_url,
            )
        else:
            return _get_embeddings_openai(texts=texts, api_key=api_key)
    except openai.APIConnectionError as e:
        if use_litellm:
            raise Exception(
                f"LiteLLM proxy unreachable: {e}. Is LiteLLM running on {litellm_base_url}?"
            ) from e
        raise
    except openai.APIStatusError as e:
        raise Exception(f"LLM API error: {e}") from e


def _get_models_litellm(api_key: str, base_url: str) -> Optional[List[str]]:
    """
    Fetch key-specific models from LiteLLM proxy.
    Returns list of model ids on success, None on failure (malformed response, timeout, 401, etc).
    """
    url = f"{base_url.rstrip('/')}/v1/models"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        with httpx.Client(timeout=LITELLM_MODELS_TIMEOUT) as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.TimeoutException, httpx.ConnectError, httpx.HTTPStatusError, ValueError):
        return None
    data_list = data.get("data")
    if not isinstance(data_list, list):
        return None
    result = []
    for m in data_list:
        if isinstance(m, dict) and m.get("id"):
            result.append(str(m["id"]))
    return result if result else None


def _get_models_gateway(api_key: str, base_url: str) -> Optional[List[str]]:
    """
    Fetch models from a generic OpenAI-compatible gateway.
    """
    url = f"{base_url.rstrip('/')}/models"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return None
    data_list = data.get("data")
    if not isinstance(data_list, list):
        return None
    result = []
    for m in data_list:
        if isinstance(m, dict) and m.get("id"):
            result.append(str(m["id"]))
    return result if result else None


def get_models(config: Optional[AppConfig] = None) -> List[str]:
    """
    Get available models. Routes based on active LLM provider.
    For OpenAI with LiteLLM, returns key-specific models from proxy.
    """
    cfg = config or _get_config()
    if not cfg:
        return STATIC_MODELS

    active_provider = getattr(cfg, "active_llm_provider", "openai") or "openai"

    if active_provider == "claude":
        return ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
    elif active_provider == "minimax":
        return ["abab6.5-chat", "abab6.5s-chat", "abab7-chat"]
    elif active_provider == "vertex_ai":
        return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]
    elif active_provider == "gemini":
        return [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash-exp",
            "gemini-2.0-pro-exp",
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-3.0-flash",
            "gemini-3.0-pro",
            "gemini-3.5-flash",
            "gemini-3.5-pro",
            "gemini-1.0-pro"
        ]
    elif active_provider == "ai_gateway":
        integration = _get_integration("ai_gateway")
        if integration and integration.api_key and integration.api_base:
            models = _get_models_gateway(api_key=integration.api_key, base_url=integration.api_base)
            if models:
                return models
        return STATIC_MODELS

    # Default to OpenAI models list or LiteLLM
    use_litellm = getattr(cfg, "use_litellm", False)
    api_key = effective_llm_api_key(cfg)
    if not use_litellm or not api_key:
        return STATIC_MODELS
    litellm_base_url = getattr(cfg, "litellm_base_url", None) or "http://localhost:4000"
    models = _get_models_litellm(api_key=api_key, base_url=litellm_base_url)
    if models:
        return models
    return STATIC_MODELS
