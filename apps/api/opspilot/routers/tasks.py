import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import Task, User
from ..schemas.task import TaskCreate, TaskResponse, TaskUpdate
from ..services.audit import write_audit_log

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[TaskResponse]:
    query = select(Task).where(Task.company_id == user.company_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    result = await session.execute(query.order_by(Task.created_at.desc()))
    return [TaskResponse.model_validate(task) for task in result.scalars()]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> TaskResponse:
    task = Task(company_id=user.company_id, **payload.model_dump())
    session.add(task)
    await session.flush()
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="task_created",
        entity_type="task",
        entity_id=str(task.id),
        metadata={"title": task.title, "status": task.status},
    )
    await session.commit()
    await session.refresh(task)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> TaskResponse:
    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.company_id == user.company_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="task_updated",
        entity_type="task",
        entity_id=str(task.id),
        metadata={"title": task.title, "status": task.status},
    )
    await session.commit()
    await session.refresh(task)
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> None:
    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.company_id == user.company_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    await session.delete(task)
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="task_deleted",
        entity_type="task",
        entity_id=str(task_id),
    )
    await session.commit()
