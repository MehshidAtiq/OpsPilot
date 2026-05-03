from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db import get_session
from ..deps import get_current_user
from ..models import Company, User
from ..schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserResponse
from ..services.audit import write_audit_log
from ..services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_session_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        settings.auth_cookie_name,
        create_access_token(user.id),
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        max_age=settings.auth_token_ttl_seconds,
        path="/",
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: SignupRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    company = Company(
        name=payload.company_name,
        primary_language="en",
        default_formality="sie",
        tone_profile={"summary": "Polite, factual, no marketing fluff."},
    )
    user = User(
        company=company,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        name=payload.name,
        role="owner",
        locale="en-US",
        last_login_at=datetime.now(timezone.utc),
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from exc
    await session.refresh(user)
    _set_session_cookie(response, user)
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="user_login",
        entity_type="user",
        entity_id=str(user.id),
        metadata={"method": "signup"},
    )
    await session.commit()
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    result = await session.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user.last_login_at = datetime.now(timezone.utc)
    _set_session_cookie(response, user)
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="user_login",
        entity_type="user",
        entity_id=str(user.id),
        metadata={"method": "password"},
    )
    await session.commit()
    await session.refresh(user)
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    response.delete_cookie(settings.auth_cookie_name, path="/")
    return response


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)

