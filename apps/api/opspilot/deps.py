import uuid
from typing import Optional

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import get_session
from .models import Company, User
from .services.auth import decode_access_token


async def get_current_user(
    session: AsyncSession = Depends(get_session),
    token: Optional[str] = Cookie(default=None, alias=settings.auth_cookie_name),
) -> User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = decode_access_token(token)
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_current_company(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Company:
    result = await session.execute(select(Company).where(Company.id == user.company_id))
    company = result.scalar_one_or_none()
    if company is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Company not found")
    return company


def require_same_company(entity_company_id: uuid.UUID, user: User) -> None:
    if entity_company_id != user.company_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
