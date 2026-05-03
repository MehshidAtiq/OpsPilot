import uuid
from pathlib import Path

from fastapi import UploadFile

from ..config import settings


class DocumentStorage:
    async def save(self, company_id: uuid.UUID, file: UploadFile) -> tuple[str, int]:
        storage_key = f"{company_id}/{uuid.uuid4()}-{file.filename}"

        if settings.use_minio:
            return await self._save_minio(storage_key, file)
        return await self._save_local(storage_key, file)

    async def _save_local(self, storage_key: str, file: UploadFile) -> tuple[str, int]:
        target = settings.local_storage_dir / Path(storage_key)
        target.parent.mkdir(parents=True, exist_ok=True)
        size = 0
        with target.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                output.write(chunk)
        return storage_key, size

    async def _save_minio(self, storage_key: str, file: UploadFile) -> tuple[str, int]:
        from minio import Minio

        client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )
        if not client.bucket_exists(settings.minio_bucket):
            client.make_bucket(settings.minio_bucket)

        data = await file.read()
        from io import BytesIO

        client.put_object(
            settings.minio_bucket,
            storage_key,
            BytesIO(data),
            length=len(data),
            content_type=file.content_type or "application/octet-stream",
        )
        return storage_key, len(data)


document_storage = DocumentStorage()

