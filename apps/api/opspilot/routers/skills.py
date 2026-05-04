"""/skills — list registered skills, run one, view past runs."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import Skill, SkillRun, User
from ..schemas.skill import SkillResponse, SkillRunRequest, SkillRunResponse
from ..services.skill_runner import SkillRunFailed, run_skill
from ..skills import SKILL_REGISTRY  # ensures registry is populated

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillResponse])
async def list_skills(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),  # noqa: ARG001 (auth gate only)
) -> list[SkillResponse]:
    """List all registered skills.

    The DB ``skills`` table is updated lazily on first run; until then the
    in-memory registry is the source of truth. We merge both so the UI sees
    every skill the moment the API boots, even if it's never been executed.
    """
    db_rows = (await session.execute(select(Skill))).scalars()
    by_key = {row.key: row for row in db_rows}

    out: list[SkillResponse] = []
    for definition in SKILL_REGISTRY.values():
        existing = by_key.get(definition.key)
        if existing is not None:
            out.append(SkillResponse.model_validate(existing))
        else:
            # Synthesise a SkillResponse from the registry definition.
            out.append(
                SkillResponse(
                    id=uuid.UUID(int=0),
                    key=definition.key,
                    name=definition.name,
                    description=definition.description,
                    version="1.0.0",
                    input_schema=definition.input_schema,
                    output_schema=definition.output_schema,
                    approval_required=definition.approval_required,
                    enabled=True,
                )
            )
    return out


@router.post("/run", response_model=SkillRunResponse)
async def run_endpoint(
    payload: SkillRunRequest,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> SkillRunResponse:
    if payload.skill_key not in SKILL_REGISTRY:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown skill {payload.skill_key!r}",
        )
    try:
        run = await run_skill(
            session,
            skill_key=payload.skill_key,
            input_payload=payload.input,
            company_id=user.company_id,
            user_id=user.id,
            triggered_by="user",
        )
    except SkillRunFailed as exc:
        # The runner has already persisted the failed SkillRun row + audit.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"run_id": str(exc.run_id), "error": str(exc)},
        ) from exc
    return SkillRunResponse.model_validate(run)


@router.get("/runs", response_model=list[SkillRunResponse])
async def list_runs(
    skill_key: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[SkillRunResponse]:
    query = select(SkillRun).where(SkillRun.company_id == user.company_id)
    if skill_key:
        skill = (
            await session.execute(select(Skill).where(Skill.key == skill_key))
        ).scalar_one_or_none()
        if skill is None:
            return []
        query = query.where(SkillRun.skill_id == skill.id)
    query = query.order_by(SkillRun.started_at.desc()).limit(limit)
    rows = (await session.execute(query)).scalars()
    return [SkillRunResponse.model_validate(row) for row in rows]


@router.get("/runs/{run_id}", response_model=SkillRunResponse)
async def get_run(
    run_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> SkillRunResponse:
    row = (
        await session.execute(
            select(SkillRun).where(
                SkillRun.id == run_id, SkillRun.company_id == user.company_id
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Skill run not found"
        )
    return SkillRunResponse.model_validate(row)
