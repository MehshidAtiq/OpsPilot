from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import settings


class Base(DeclarativeBase):
    pass


# NOTE: ``pool_pre_ping=True`` interacts badly with the asyncpg dialect when
# a connection is checked out from the pool during a multi-commit request
# (the ping path runs ``await`` outside the request greenlet). The pool's
# default recycle behaviour is sufficient for dev; if a stale connection
# slips through, the request fails once and the pool drops it.
engine = create_async_engine(settings.database_url)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

