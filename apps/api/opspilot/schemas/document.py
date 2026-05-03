import uuid
from datetime import datetime
from typing import Any, Optional

from .common import OrmModel


class DocumentResponse(OrmModel):
    id: uuid.UUID
    title: str
    source: str
    storage_key: str
    mime: str
    size_bytes: int
    status: str
    metadata_: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    uploader_id: Optional[uuid.UUID] = None

