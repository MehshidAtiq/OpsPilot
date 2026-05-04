# OpsPilot API

FastAPI backend. Phases:

- **Phase 2** — persistence, auth, onboarding, document upload, task CRUD.
- **Phase 3** — AI workflows: 5 skills, RAG over uploaded docs, approval-gated
  effectors, full audit trail.

## Run locally

```bash
cd /Users/mehshidatiq/Documents/GitHub/OpsPilot
docker compose -f infra/docker/docker-compose.phase2.yml up -d db redis minio

cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head

# Optional: idempotent seed (1 company, 2 threads, 1 meeting w/ transcript,
# 1 indexed doc, 2 tasks, 2 pending approvals — safe to re-run).
python -m scripts.seed_dev

uvicorn opspilot.main:app --reload --host localhost --port 8000
```

The API is available at `http://localhost:8000`.

## Configuration

Copy `.env.example` to `.env` and fill in:

- `LLM_PROVIDER` — `mock` (default) or `openrouter`.
- `OPENROUTER_API_KEY` — required when provider is `openrouter`. Mock client
  is used otherwise.
- `OPENROUTER_MODEL` — defaults to `qwen/qwen3-coder:free`.
- `EMBEDDINGS_PROVIDER` — `openai` (default) or `mock`.
- `OPENAI_API_KEY` — required for real embeddings; auto-falls back to mock
  embeddings if a call fails (e.g. quota / 429), so the demo stays usable.

## Phase 3 smoke flow (curl)

```bash
# 1. Login as the seeded owner.
curl -s -c /tmp/cookies.txt -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@sturm-drang.example","password":"demo-password-123"}' \
  | jq .user.email

# 2. List registered skills.
curl -s -b /tmp/cookies.txt http://localhost:8000/api/v1/skills | jq '.[].key'

# 3. Run the read-only daily briefing.
curl -s -b /tmp/cookies.txt -X POST http://localhost:8000/api/v1/skills/run \
  -H "Content-Type: application/json" \
  -d '{"skill_key":"daily_briefing","input":{}}' | jq .output.priorities

# 4. Run email_reply on the seeded Müller thread → emits 1 approval.
curl -s -b /tmp/cookies.txt -X POST http://localhost:8000/api/v1/skills/run \
  -H "Content-Type: application/json" \
  -d '{"skill_key":"email_reply","input":{"thread_id":"thread-mueller-m365"}}' \
  | jq '.output | {draft_subject, draft_body, approval_ids}'

# 5. List pending approvals, then approve one (executes the mock effector).
APPROVAL=$(curl -s -b /tmp/cookies.txt 'http://localhost:8000/api/v1/approvals?status=pending' | jq -r '.[0].id')
curl -s -b /tmp/cookies.txt -X POST "http://localhost:8000/api/v1/approvals/$APPROVAL/decide" \
  -H "Content-Type: application/json" \
  -d '{"decision":"approve"}' | jq '{status, executed_at}'

# 6. Audit trail — every skill run, approval, effector call.
curl -s -b /tmp/cookies.txt 'http://localhost:8000/api/v1/audit?limit=10' | jq '.[].action'
```

## Tests

```bash
# Hermetic smoke tests (no DB required).
.venv/bin/python -m pytest tests/

# End-to-end manual smoke: run the curl block above against a freshly seeded DB.
```

## Frontend feature flag

Set these in `apps/web/.env.local` to point the web app at the API:

```bash
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_URL=http://localhost:8000
```
