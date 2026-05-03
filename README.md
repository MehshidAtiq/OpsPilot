# OpsPilot

**Approval-gated AI operations copilot for German IT/consulting SMEs.**

OpsPilot turns emails, meetings, documents, and client follow-ups into daily priorities, drafts, tasks, and scheduled actions — while keeping humans in control.

> Portfolio / demo project for konaktiva and job applications. Built to demonstrate AI workflow design, backend architecture, GDPR/privacy awareness, and product thinking — not a toy chatbot.

---

## Why OpsPilot

German IT/consulting SMEs (5–50 people) lose hours every week to email triage, follow-up chasing, meeting prep, and admin glue work. Generic AI assistants don't know the company, don't connect to its tools, and — most importantly — don't keep a human in the loop. OpsPilot proposes; the human approves.

## Core principles

1. **Human approval is central.** AI drafts, humans send. Every external-facing action passes through an Approval Inbox.
2. **Input → Process → Output workflows.** Every "skill" has a defined trigger, inputs, steps, output, and approval rule.
3. **Auditable by default.** What the AI read, generated, and who approved it is all logged — for trust and GDPR.
4. **Company-aware.** Onboarding builds a profile and knowledge base that grounds every AI response (RAG).

## MVP feature set

- Company onboarding & profile
- Knowledge base (RAG over uploaded docs)
- Daily briefing dashboard
- Email/client message assistant (summarize, draft, translate DE↔EN)
- Meeting scheduler & meeting assistant
- Follow-up tracker
- Approval inbox
- Skills/workflow library
- Task board
- Audit log
- Integrations page (Gmail / Calendar / Drive — mocked for MVP)
- Automation opportunity audit

## Tech stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL + pgvector, Redis, Celery/RQ
- **Frontend:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- **AI:** Anthropic Claude (Sonnet 4.6 for drafting, Haiku 4.5 for triage), OpenAI embeddings (or local), pgvector for retrieval
- **Storage:** S3-compatible object storage (MinIO locally) for documents
- **Auth:** Email/password + OAuth (Google) for integrations

## Status

Phase 2 — backend and database foundation in progress. The frontend mock demo
still works by default; set `NEXT_PUBLIC_DATA_SOURCE=api` to exercise the
Phase 2 API-backed auth, onboarding, documents, and task flows.

## Repo layout (target)

```
opspilot/
├─ apps/
│  ├─ web/        # Next.js frontend
│  └─ api/        # FastAPI backend
├─ packages/
│  └─ shared/     # Shared types/schemas
├─ infra/
│  ├─ docker/
│  └─ migrations/
└─ docs/
```

## Phase 2 local API

```bash
docker compose -f infra/docker/docker-compose.phase2.yml up -d db redis minio

cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e .
alembic upgrade head
uvicorn opspilot.main:app --reload --host localhost --port 8000
```

## License

Proprietary — portfolio project. All rights reserved.
