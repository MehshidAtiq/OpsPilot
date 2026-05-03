from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Approval


async def enqueue_approval(session: AsyncSession, approval: Approval) -> Approval:
    session.add(approval)
    await session.flush()
    return approval

