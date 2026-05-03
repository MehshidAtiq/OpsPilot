import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class IdResponse(BaseModel):
    id: uuid.UUID


class HealthResponse(BaseModel):
    status: str
    version: str = "0.1.0"


class Timestamped(OrmModel):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

