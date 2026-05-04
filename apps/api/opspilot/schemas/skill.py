"""Pydantic schemas for the /skills + /skill_runs endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from .common import OrmModel


class SkillResponse(OrmModel):
    id: uuid.UUID
    key: str
    name: str
    description: str
    version: str
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    approval_required: bool
    enabled: bool


class SkillRunRequest(BaseModel):
    skill_key: str = Field(min_length=1, max_length=128)
    input: dict[str, Any] = Field(default_factory=dict)


class SkillRunResponse(OrmModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    triggered_by: str
    trigger_user_id: Optional[uuid.UUID] = None
    input: dict[str, Any]
    output: dict[str, Any]
    status: str
    error: Optional[str] = None
    started_at: datetime
    finished_at: Optional[datetime] = None
    tokens_in: int
    tokens_out: int
