from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import (
    approvals,
    audit,
    auth,
    documents,
    health,
    meetings,
    messages,
    onboarding,
    skills,
    tasks,
)
# Import side-effect: populate SKILL_REGISTRY before any /skills request.
from . import skills as _skill_pkg  # noqa: F401


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(onboarding.router, prefix=settings.api_prefix)
    app.include_router(documents.router, prefix=settings.api_prefix)
    app.include_router(tasks.router, prefix=settings.api_prefix)
    app.include_router(approvals.router, prefix=settings.api_prefix)
    app.include_router(skills.router, prefix=settings.api_prefix)
    app.include_router(messages.router, prefix=settings.api_prefix)
    app.include_router(meetings.router, prefix=settings.api_prefix)
    app.include_router(audit.router, prefix=settings.api_prefix)
    return app


app = create_app()
