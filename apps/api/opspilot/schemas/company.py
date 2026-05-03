import uuid
from datetime import datetime
from typing import Any, List

from pydantic import BaseModel, Field

from .common import OrmModel


class CompanyResponse(OrmModel):
    id: uuid.UUID
    name: str
    industry: str
    services: List[str]
    target_clients: str
    tone_profile: dict[str, Any]
    primary_language: str
    default_formality: str
    settings: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class OnboardingRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    industry: str = ""
    services: List[str] = Field(default_factory=list)
    target_clients: str = ""
    primary_language: str = "en"
    default_formality: str = "sie"
    tone_summary: str = ""
    settings: dict[str, Any] = Field(default_factory=dict)

