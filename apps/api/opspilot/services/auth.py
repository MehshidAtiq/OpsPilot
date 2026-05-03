import base64
import hashlib
import hmac
import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from ..config import settings


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 390_000
    ).hex()
    return f"pbkdf2_sha256${salt}${digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt, expected = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    actual = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 390_000
    ).hex()
    return hmac.compare_digest(actual, expected)


def _b64encode(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).rstrip(b"=").decode("ascii")


def _b64decode(payload: str) -> bytes:
    padded = payload + ("=" * (-len(payload) % 4))
    return base64.urlsafe_b64decode(padded.encode("ascii"))


def _sign(message: str) -> str:
    signature = hmac.new(
        settings.auth_secret.encode("utf-8"), message.encode("ascii"), hashlib.sha256
    ).digest()
    return _b64encode(signature)


def create_access_token(user_id: uuid.UUID) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=settings.auth_token_ttl_seconds)).timestamp()),
    }
    encoded_header = _b64encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    message = f"{encoded_header}.{encoded_payload}"
    return f"{message}.{_sign(message)}"


def decode_access_token(token: str) -> uuid.UUID:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session",
    )
    try:
        encoded_header, encoded_payload, signature = token.split(".", 2)
    except ValueError as exc:
        raise credentials_error from exc
    message = f"{encoded_header}.{encoded_payload}"
    if not hmac.compare_digest(signature, _sign(message)):
        raise credentials_error
    try:
        payload = json.loads(_b64decode(encoded_payload))
        expires_at = int(payload["exp"])
        subject = uuid.UUID(str(payload["sub"]))
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise credentials_error from exc
    if expires_at < int(datetime.now(timezone.utc).timestamp()):
        raise credentials_error
    return subject

