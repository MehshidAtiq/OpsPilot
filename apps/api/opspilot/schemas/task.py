import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from .common import OrmModel


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    owner_user_id: Optional[uuid.UUID] = None
    due_date: Optional[date] = None
    priority: str = "med"
    status: str = "proposed"
    client_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    source_type: Optional[str] = None
    source_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    owner_user_id: Optional[uuid.UUID] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    client_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    source_type: Optional[str] = None
    source_id: Optional[str] = None


class TaskResponse(OrmModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    owner_user_id: Optional[uuid.UUID] = None
    due_date: Optional[date] = None
    priority: str
    status: str
    client_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    source_type: Optional[str] = None
    source_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

