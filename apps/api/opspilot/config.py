from functools import lru_cache
from pathlib import Path
from typing import Annotated, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "OpsPilot API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = (
        "postgresql+asyncpg://opspilot:opspilot@localhost:55432/opspilot"
    )
    sync_database_url: str = (
        "postgresql://opspilot:opspilot@localhost:55432/opspilot"
    )
    auth_secret: str = "dev-change-me"
    auth_cookie_name: str = "opspilot_session"
    auth_token_ttl_seconds: int = 60 * 60 * 24 * 7
    # NoDecode disables pydantic-settings' default JSON parse for List, so
    # the env var can stay as a comma-separated string.
    cors_origins: Annotated[List[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "opspilot"
    minio_secret_key: str = "opspilot-secret"
    minio_bucket: str = "opspilot-documents"
    minio_secure: bool = False
    use_minio: bool = False
    local_storage_dir: Path = Path(".storage/documents")

    # --- LLM (Phase 3) ---
    # Provider for chat/completion calls. "mock" runs deterministic fixtures
    # (used in tests and when no API key is set). "openrouter" uses the
    # OpenRouter HTTP API (OpenAI-compatible). Future values: "anthropic",
    # "openai", "gemini" — compared once we lock production-quality behaviour.
    llm_provider: str = "mock"
    openrouter_api_key: str | None = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "qwen/qwen3-coder:free"
    # Optional headers OpenRouter recommends for analytics/rate-limit tiers.
    openrouter_referer: str | None = None
    openrouter_app_title: str = "OpsPilot"
    llm_timeout_seconds: float = 60.0

    # --- Embeddings (Phase 3) ---
    # Kept separate from llm_provider on purpose — embedding quality matters
    # for retrieval and isn't worth swapping out casually.
    embeddings_provider: str = "openai"
    embeddings_model: str = "text-embedding-3-small"
    openai_api_key: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
