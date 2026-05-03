import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .common import OrmModel


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=255)
    company_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(OrmModel):
    id: uuid.UUID
    company_id: uuid.UUID
    email: EmailStr
    name: str
    role: str
    locale: str
    last_login_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    user: UserResponse
