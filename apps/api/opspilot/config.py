from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    cors_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "opspilot"
    minio_secret_key: str = "opspilot-secret"
    minio_bucket: str = "opspilot-documents"
    minio_secure: bool = False
    use_minio: bool = False
    local_storage_dir: Path = Path(".storage/documents")

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
