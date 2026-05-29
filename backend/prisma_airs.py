import os
from typing import Any, Dict, Optional
import httpx
from dotenv import load_dotenv

# Ensure environment is loaded from .env
load_dotenv()

_last_prisma_airs_result: Optional[Dict[str, Any]] = None
_last_prisma_airs_request: Optional[Dict[str, Any]] = None


async def check_interaction(
    prompt: str,
    response_text: Optional[str] = None,
    session_id: Optional[str] = None,
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    api_base: Optional[str] = None,
    profile_name: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    global _last_prisma_airs_result, _last_prisma_airs_request

    # Prioritize database credentials, fallback to environment variables
    api_key = api_key or os.environ.get("PANW_PRISMA_AIRS_API_KEY")
    api_base = api_base or os.environ.get("PANW_PRISMA_AIRS_API_BASE", "https://service-sg.api.aisecurity.paloaltonetworks.com")
    profile_name = profile_name or os.environ.get("PANW_PRISMA_AIRS_PROFILE_NAME", "ai-security-profile")
    app_name = os.environ.get("PANW_PRISMA_AIRS_APP_NAME", "aisecapps")


    if not api_key:
        print("⚠️ PANW_PRISMA_AIRS_API_KEY not configured in environment")
        return None

    url = f"{api_base.rstrip('/')}/v1/scan/sync/request"
    
    headers = {
        "x-pan-token": api_key,
        "Content-Type": "application/json"
    }

    # Construct the content payload to be scanned
    content_item = {"prompt": prompt}
    if response_text is not None:
        content_item["response"] = response_text

    payload = {
        "tr_id": session_id or "default-session",
        "ai_profile": { "profile_name": profile_name },
        "metadata": { "app_user": "admin", "ai_model": model_name or "gpt-4o-mini" },
        "contents": [content_item]
    }

    # Store last request for telemetry (excluding api key)
    _last_prisma_airs_request = {
        "url": url,
        "payload": payload
    }

    try:
        print(f"🛡️ Calling Prisma AIRS Scan API: {url}...")
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            # Store last result
            _last_prisma_airs_result = result
            print(f"✅ Prisma AIRS response received: {result}")
            return result
    except Exception as e:
        print(f"❌ Prisma AIRS API error: {e}")
        # Return fallback error structure so agent doesn't crash but logs
        err_result = {
            "error": str(e),
            "status": "error",
            "action": "allow",  # Fail-open if the API fails
            "verdict": "Allow"
        }
        _last_prisma_airs_result = err_result
        return err_result


def get_last_result() -> Optional[Dict[str, Any]]:
    """Get the last stored Prisma AIRS API response for telemetry polling."""
    return _last_prisma_airs_result


def set_last_result(result: Optional[Dict[str, Any]]) -> None:
    """Explicitly override the last result cache."""
    global _last_prisma_airs_result
    _last_prisma_airs_result = result


def get_last_request() -> Optional[Dict[str, Any]]:
    """Get the last stored Prisma AIRS API request payload for telemetry polling."""
    return _last_prisma_airs_request
