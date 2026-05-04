"""Pydantic schemas for /messages and /meetings."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from .common import OrmModel


class MessageResponse(OrmModel):
    id: uuid.UUID
    company_id: uuid.UUID
    client_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    channel: str
    direction: str
    thread_id: str
    subject: str
    body: str
    snippet: str
    sender: str
    recipients: list[str]
    received_at: datetime
    is_read: bool
    urgency: dict[str, Any]
    ai_summary: Optional[str] = None
    source: str
    created_at: datetime
    updated_at: datetime


class MeetingResponse(OrmModel):
    id: uuid.UUID
    company_id: uuid.UUID
    client_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    title: str
    scheduled_at: datetime
    duration_min: int
    attendees: list[str]
    transcript: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_decisions: list[dict[str, Any]]
    ai_action_items: list[dict[str, Any]]
    source: str
    created_at: datetime
    updated_at: datetime
