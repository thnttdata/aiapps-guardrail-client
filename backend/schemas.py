from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


# Config schemas
class AppConfigBase(BaseModel):
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    hero_text: Optional[str] = None
    hero_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    lakera_enabled: bool = True
    lakera_blocking_mode: bool = False
    prisma_airs_enabled: bool = False
    prisma_airs_blocking_mode: bool = False
    bedrock_enabled: bool = False
    bedrock_blocking_mode: bool = False
    nemo_enabled: bool = False
    nemo_blocking_mode: bool = False
    use_litellm: bool = False
    litellm_base_url: Optional[str] = None
    litellm_guardrail_name: Optional[str] = None
    litellm_guardrail_monitor_name: Optional[str] = None
    rag_content_scanning: bool = False
    rag_lakera_project_id: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    temperature: int = 7
    system_prompt: Optional[str] = None
    # UI theme: e.g. "blue", "emerald", "purple", "amber"
    theme: Optional[str] = "blue"
    active_llm_provider: Optional[str] = "openai"
    active_preset: Optional[str] = "DEFAULT-PRESET"

    # Dynamic Guardrail Engine Credentials
    prisma_airs_api_key: Optional[str] = None
    prisma_airs_api_base: Optional[str] = None
    prisma_airs_profile_name: Optional[str] = None

    bedrock_access_key_id: Optional[str] = None
    bedrock_secret_access_key: Optional[str] = None
    bedrock_region: Optional[str] = None
    bedrock_guardrail_id: Optional[str] = None
    bedrock_guardrail_version: Optional[str] = None

    nemo_api_key: Optional[str] = None
    nemo_api_base: Optional[str] = None
    nemo_config_profile: Optional[str] = None



class AppConfigResponse(AppConfigBase):
    id: int
    openai_api_key: Optional[str] = None
    litellm_virtual_key: Optional[str] = None
    lakera_api_key: Optional[str] = None
    lakera_project_id: Optional[str] = None
    rag_lakera_project_id: Optional[str] = None
    prisma_airs_env_configured: bool = False
    created_at: datetime
    updated_at: datetime


class AppConfigUpdate(AppConfigBase):
    openai_api_key: Optional[str] = None
    litellm_virtual_key: Optional[str] = None
    lakera_api_key: Optional[str] = None
    lakera_project_id: Optional[str] = None
    rag_lakera_project_id: Optional[str] = None
    use_litellm: Optional[bool] = None
    litellm_base_url: Optional[str] = None


class LLMIntegrationBase(BaseModel):
    provider: str
    enabled: bool = False
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    model_name: Optional[str] = None
    config_json: Dict[str, Any] = {}


class LLMIntegrationResponse(LLMIntegrationBase):
    id: int
    created_at: datetime
    updated_at: datetime


class LLMIntegrationUpdate(BaseModel):
    enabled: Optional[bool] = None
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    model_name: Optional[str] = None
    config_json: Optional[Dict[str, Any]] = None


# Chat schemas
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    prompt_id: Optional[int] = None


class PlaygroundChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    system_prompt: Optional[str] = None
    active_llm_provider: Optional[str] = None
    openai_model: Optional[str] = None
    temperature: Optional[int] = None
    lakera_enabled: Optional[bool] = None
    lakera_blocking_mode: Optional[bool] = None
    use_litellm: Optional[bool] = None
    enabled_detectors: Optional[List[str]] = None



class ChatResponse(BaseModel):
    response: str
    lakera: Optional[Dict[str, Any]] = None
    tool_traces: Optional[List[Dict[str, Any]]] = None
    citations: Optional[List[Dict[str, Any]]] = None


# RAG schemas
class RagGenerateRequest(BaseModel):
    industry: str
    seed_prompt: str
    preview_only: bool = False


class RagGenerateResponse(BaseModel):
    markdown: str
    ingested: bool = False


class RagSearchResponse(BaseModel):
    chunks: List[Dict[str, Any]]


# Tool schemas
class ToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    endpoint: Optional[str] = None
    type: str = "mcp"
    enabled: bool = True
    config_json: Optional[Dict[str, Any]] = None


class ToolResponse(ToolBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ToolCreate(ToolBase):
    pass


class ToolUpdate(ToolBase):
    pass


# MCP Tool Use Case schemas
class MCPToolUseCaseBase(BaseModel):
    tool_id: int
    mcp_tool_name: str
    title: str
    description: Optional[str] = None
    sample_prompt: str
    expected_outcome: Optional[str] = None


class MCPToolUseCaseResponse(MCPToolUseCaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class MCPToolUseCaseCreate(BaseModel):
    mcp_tool_name: str
    title: str
    description: Optional[str] = None
    sample_prompt: str
    expected_outcome: Optional[str] = None


class MCPToolUseCaseUpdate(BaseModel):
    mcp_tool_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    sample_prompt: Optional[str] = None
    expected_outcome: Optional[str] = None


# Lakera schemas
class LakeraResult(BaseModel):
    result: Dict[str, Any]
    timestamp: datetime


# Demo Prompt schemas
class DemoPromptBase(BaseModel):
    title: str
    content: str
    category: str = "general"
    tags: List[str] = []
    is_malicious: bool = False
    preferred_llm: Optional[str] = None


class DemoPromptResponse(DemoPromptBase):
    id: int
    usage_count: int
    created_at: datetime
    updated_at: datetime


class DemoPromptCreate(DemoPromptBase):
    pass


class DemoPromptUpdate(DemoPromptBase):
    pass


class DemoPromptSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    limit: int = 10


# Preset schemas
class PresetCreate(BaseModel):
    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[str] = "blue"


class PresetClone(BaseModel):
    target_name: str
    target_title: Optional[str] = None
    target_description: Optional[str] = None

