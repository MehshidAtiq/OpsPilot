"""Pydantic schemas for the /approvals endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from .common import OrmModel


class ApprovalResponse(OrmModel):
    id: uuid.UUID
    company_id: uuid.UUID
    requester: str
    action_type: str
    payload: dict[str, Any]
    rationale: str
    sources: list[dict[str, Any]]
    status: str
    decided_by_user_id: Optional[uuid.UUID] = None
    decided_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    skill_run_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime


class ApprovalDecideRequest(BaseModel):
    decision: Literal["approve", "edit_and_approve", "reject"]
    edited_payload: Optional[dict[str, Any]] = Field(default=None)
