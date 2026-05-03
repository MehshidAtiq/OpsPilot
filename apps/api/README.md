# OpsPilot API

FastAPI backend for Phase 2: real persistence, auth, onboarding, document upload,
and task CRUD. AI workflows are intentionally left for Phase 3.

## Run locally

```bash
cd /Users/mehshidatiq/Documents/GitHub/OpsPilot
docker compose -f infra/docker/docker-compose.phase2.yml up -d db redis minio

cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e .
alembic upgrade head
uvicorn opspilot.main:app --reload --host localhost --port 8000
```

The API is available at `http://localhost:8000`.

## Frontend feature flag

Set these in `apps/web/.env.local` to point the web app at the API for the
Phase 2 flows:

```bash
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_URL=http://localhost:8000
```

