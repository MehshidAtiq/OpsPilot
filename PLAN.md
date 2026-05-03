# OpsPilot — Product & Architecture Plan

> Living document. Source of truth for MVP scope, architecture, and roadmap.
> Keep changes here in sync with code; revisit at the end of every phase.

---

## 0. Guiding principles (non-negotiable)

1. **Human approval is the product.** Every external-facing AI action lands in the Approval Inbox first. There is no "auto-send" toggle in MVP.
2. **Small surface, deep demo.** Better to have 4 features that feel real than 12 that feel like wireframes.
3. **Every workflow is a Skill** with an explicit `trigger → inputs → steps → output → approval rule`. No magic.
4. **Auditable & GDPR-aware by default.** The audit log is a first-class feature, not a footnote.
5. **Mocks are fine, fakes are not.** Mocked Gmail is OK; fake-looking UIs are not. Use realistic German SME data.

---

## 1. MVP scope

### 1.1 Must-have for the konaktiva demo (Phase 1–5)

These are the features the 3–5 minute demo *cannot work without*:

| # | Feature | Why it's must-have |
|---|---|---|
| 1 | **Company onboarding** (one-shot wizard) | Sets the stage; shows product thinking; produces the system-prompt context |
| 2 | **Knowledge base** (upload + RAG retrieval) | Demonstrates AI/ML competence (embeddings, vector search, RAG) |
| 3 | **Daily briefing dashboard** | The "wow" landing screen; one place that ties everything together |
| 4 | **Email assistant** (summarize + draft reply, DE↔EN) | The most relatable workflow for a recruiter |
| 5 | **Approval inbox** | The differentiator vs. ChatGPT; the trust story |
| 6 | **Skills library** (read-only view of the 4–5 active skills) | Makes the "agentic but controlled" architecture visible |
| 7 | **Task board** (proposed → approved → done) | Closes the loop from email/meeting → action |
| 8 | **Audit log** | The GDPR/trust story; recruiter-bait |
| 9 | **Mocked Gmail + Calendar integration** | Lets the demo run without OAuth headaches |

### 1.2 Nice-to-have (build if Phase 1–3 finish ahead of schedule)

- **Meeting assistant** — paste-in transcript → summary + action items + draft follow-up. (High demo value; medium effort. Stretch goal.)
- **Follow-up tracker** — surfaces stale threads. (Medium demo value; can be faked from seeded data.)
- **Automation opportunity audit** — single AI call over usage data; high "product thinking" signal.

### 1.3 Later / explicitly cut from MVP

Cut for scope. Mention in the demo as "roadmap" only.

- Real OAuth Gmail/Calendar/Drive integrations (mock them)
- Real-time meeting transcription (paste transcript instead)
- Multi-tenant billing, team roles beyond owner/member
- Notion/ClickUp/Slack/CRM connectors
- Mobile app
- Weekly report skill (mention it in the Skills library, don't build)
- Meeting *scheduler* (the back-and-forth time negotiation) — too much UI for too little demo payoff. Keep meeting *assistant* (post-meeting), drop scheduler from MVP.

> **Scope challenge applied:** the original brief listed both meeting scheduler *and* meeting assistant. Scheduler is a deep rabbit hole (availability, time zones, back-and-forth email parsing). The post-meeting summarizer is 10× the demo value for 1/5 the work. **Recommendation: drop scheduler from MVP.**

---

## 2. Personas (3)

### Persona A — Anna, the Founder/Managing Director (primary buyer)
- 42, runs a 12-person IT consultancy in Munich. Background in business, not tech.
- Spends 90 min/day on email, another 60 min in meetings.
- Pain: drowning in client follow-ups, losing deals because nobody chases proposals.
- Wants: "What do I need to do today?" answered in 30 seconds; trust that nothing got missed.
- **What she uses in OpsPilot:** Daily briefing, Approval inbox, Automation audit.

### Persona B — Tobias, the Senior Consultant / Project Manager (primary daily user)
- 34, leads 3–4 client projects in parallel. Deeply technical, wary of AI hype.
- Pain: context-switching between clients; rewriting the same status update three ways.
- Wants: drafts he can edit in 10 seconds, never anything sent without his click.
- **What he uses in OpsPilot:** Email assistant, Meeting assistant, Task board, Knowledge base.

### Persona C — Lena, the Operations / Office Manager (admin enabler)
- 29, handles scheduling, document org, and client onboarding paperwork.
- Pain: "Where's that proposal?", "Did we send the follow-up to Müller GmbH?"
- Wants: searchable company memory; clear status of every external thread.
- **What she uses in OpsPilot:** Knowledge base upload, Follow-up tracker, Audit log.

> **Demo hint:** the 3–5 minute demo follows **Anna** logging in, but the *value* shown is what she delegated to Tobias and Lena. This is how you sell to SME owners.

---

## 3. Main user journeys

Each journey is one screen flow, named so we can reference it from tickets.

### J1 — Onboard the company *(Anna, day 0, ~5 min)*
1. Land on `/onboarding/start` after signup.
2. 4-step wizard: company basics → services & target clients → tone & language (DE/EN, Sie/Du) → tools & priorities.
3. Optional: drag in 1–3 documents (services PDF, sample proposal).
4. Land on dashboard with seeded sample data + a "Try the email assistant" CTA.

### J2 — Read the daily briefing *(Anna or Tobias, every morning, 30s)*
1. Login → `/dashboard`.
2. See: "Today's 3 priorities", today's meetings, urgent unread threads, open approvals count.
3. Click a priority → deep-link into the relevant approval/task/thread.

### J3 — Draft a client reply *(Tobias, ~3 min)*
1. From dashboard or `/inbox`, click an unread thread.
2. See AI summary + detected urgency + suggested action.
3. Click "Draft reply" → AI generates draft using KB + thread context.
4. Edit inline → "Send to approval" (or send directly if it's their own action).
5. Approval inbox reflects it; on approve, it's "sent" (mock: marks as sent, logs audit).

### J4 — Summarize a meeting *(Tobias, ~2 min)*
1. `/meetings/new` → paste transcript or notes + select client/project.
2. AI returns: summary, decisions, action items, draft follow-up email.
3. Each action item → "Create task" button (sends to approval).
4. Draft follow-up → "Send to approval".

### J5 — Approve AI actions *(Anna or Tobias, ad hoc, ~1 min per item)*
1. `/approvals` shows queue grouped by type (email, task, doc update).
2. Each card: what the AI proposes, *why* (sources cited), and the diff if it's an edit.
3. Approve / Edit / Reject / Regenerate. Every choice is logged.

### J6 — Check the audit log *(Lena or Anna, weekly or on-demand)*
1. `/audit` filterable by user, action type, date, client.
2. Each row: who/what/when/sources/approver. Click to expand to full payload.
3. Export to CSV (GDPR signal — implement the button even if minimal).

> **Cut from MVP journeys:** scheduling a meeting (J: cut), running an automation audit (mention in roadmap, don't build flow).

---

## 4. Screens

12 screens total — flat IA, no nested settings mazes.

| Route | Screen | Notes |
|---|---|---|
| `/login` | Login / Signup | Email + password; OAuth-ready |
| `/onboarding/*` | Onboarding wizard | 4 steps, can skip & resume |
| `/dashboard` | Daily briefing | Landing page post-login |
| `/inbox` | Email/message assistant | List of threads + detail pane |
| `/meetings` | Meeting assistant | List + paste-transcript flow |
| `/follow-ups` | Follow-up tracker | Stale-thread queue (nice-to-have) |
| `/approvals` | Approval inbox | The differentiator screen |
| `/tasks` | Task board | Kanban: Proposed / Approved / In progress / Done |
| `/skills` | Skills library | Read-only cards; click to see I/O schema |
| `/knowledge` | Knowledge base | Upload + list + search |
| `/audit` | Audit log | Filterable table |
| `/settings/integrations` | Integrations | Toggle mocks: Gmail/Calendar/Drive |

> **Scope discipline:** no per-client/per-project detail pages in MVP. Clients/projects are entities in the data model and shown as filters/badges, but they don't get their own screens. Add later.

---

## 5. Data model

PostgreSQL with `pgvector` extension. Snake_case, UUID PKs, `created_at`/`updated_at` everywhere. Multi-tenant via `company_id` on every row.

### Core tables

```text
companies
  id, name, industry, services[], target_clients, tone_profile (jsonb),
  primary_language, default_formality (sie|du), settings (jsonb), created_at

users
  id, company_id, email, password_hash, name, role (owner|member),
  locale, last_login_at, created_at

clients
  id, company_id, name, contact_email, language, formality_override,
  notes, created_at

projects
  id, company_id, client_id, name, status, summary, created_at

documents
  id, company_id, uploader_id, title, source (upload|drive_mock|email_mock),
  storage_key, mime, size_bytes, status (pending|indexed|failed),
  metadata (jsonb), created_at

document_chunks
  id, document_id, chunk_index, text, embedding (vector(1536)),
  token_count, created_at

messages                        # emails + chat-like client messages
  id, company_id, client_id, project_id, channel (email|chat),
  direction (inbound|outbound), thread_id, subject, body, snippet,
  sender, recipients[], received_at, is_read, urgency (jsonb),
  ai_summary, source (gmail_mock|manual), created_at

meetings
  id, company_id, client_id, project_id, title, scheduled_at,
  duration_min, attendees[], transcript, ai_summary, ai_decisions (jsonb),
  ai_action_items (jsonb), source (calendar_mock|manual), created_at

tasks
  id, company_id, project_id, client_id, title, description,
  owner_user_id, due_date, priority (low|med|high), status
  (proposed|approved|in_progress|done|rejected),
  source_type (email|meeting|manual), source_id, created_by_skill_run_id,
  created_at

approvals                       # the approval inbox queue
  id, company_id, requester (system|user_id), action_type
  (email_send|task_create|doc_update|calendar_create|crm_update),
  payload (jsonb),                # what would be done if approved
  rationale, sources (jsonb),      # citations for trust
  status (pending|approved|edited|rejected|regenerated),
  decided_by_user_id, decided_at, executed_at, skill_run_id, created_at

skills                          # static catalogue, seeded
  id, key (e.g. 'email_reply'), name, description, version,
  input_schema (jsonb), output_schema (jsonb), approval_required (bool),
  enabled (bool)

skill_runs                      # one execution
  id, company_id, skill_id, triggered_by (user|cron|event),
  trigger_user_id, input (jsonb), output (jsonb), status
  (running|succeeded|failed|awaiting_approval),
  error, started_at, finished_at, tokens_in, tokens_out, cost_usd

audit_logs                      # append-only
  id, company_id, user_id, action (read_doc|generate_draft|send_email|
  approve|reject|...), entity_type, entity_id, sources (jsonb),
  metadata (jsonb), created_at

integrations
  id, company_id, kind (gmail|calendar|drive|slack|...),
  status (mocked|connected|disconnected), config (jsonb), connected_at
```

### Key relationships

- `companies` 1—N `users` / `clients` / `projects` / everything (tenant root)
- `messages` and `meetings` reference `clients`/`projects` (nullable)
- `tasks.source_*` is a polymorphic pointer to `messages` or `meetings`
- `approvals.skill_run_id` ties every queued action back to the skill that produced it
- `audit_logs.entity_*` is polymorphic; `sources` lists `document_chunks` cited

### Why this shape

- **`skill_runs` + `approvals` are separate** so that an approval can have multiple revisions ("regenerate" creates a new `skill_run`, not a new `approval`).
- **`document_chunks` separate from `documents`** for clean RAG: chunks have embeddings, documents don't.
- **`audit_logs` polymorphic** so every entity type can be audited without N tables.
- **No per-row encryption fields** in MVP — handle PII at the column level later; for now, document the intent in `docs/security.md`.

---

## 6. AI architecture

### 6.1 Layers

```
┌─────────────────────────────────────────────────────────┐
│ UI (Next.js)                                            │
└──────────────────────┬──────────────────────────────────┘
                       │ REST/JSON
┌──────────────────────▼──────────────────────────────────┐
│ FastAPI: /skills/{key}/run, /approvals, /messages, ...  │
├─────────────────────────────────────────────────────────┤
│ Skill Runner                                            │
│  ├── load skill definition (input/output schema)        │
│  ├── build context (company profile + RAG + entities)   │
│  ├── call LLM with tools (read-only by default)         │
│  ├── validate output against schema                     │
│  ├── if approval_required → enqueue approval            │
│  └── log every step to audit_logs                       │
├─────────────────────────────────────────────────────────┤
│ Tools (read-only in MVP)                                │
│  search_kb, get_thread, get_meeting, list_tasks,        │
│  get_client, translate, draft_email                     │
├─────────────────────────────────────────────────────────┤
│ Effectors (only run on approval)                        │
│  send_email_mock, create_task, update_doc,              │
│  create_calendar_event_mock                             │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Context management

For every skill run, build a structured prompt:

1. **System block** — role, company profile (name, services, tone, language preferences), and the global rule: *"Never invent client facts. Cite sources from KB or thread. Never claim an action was performed."*
2. **Skill block** — skill description, input schema, output schema, approval rule.
3. **Inputs block** — typed data the caller passed (thread, meeting, etc.).
4. **Retrieved context block** — top-K RAG chunks (k=5, similarity threshold), each tagged with `document_id` and `chunk_index` for citation.
5. **Output contract** — strict JSON schema; reject and retry once on parse failure.

### 6.3 RAG / knowledge retrieval

- **Chunking:** ~800-token semantic chunks with 100-token overlap. Markdownify PDFs/DOCX first.
- **Embeddings:** `text-embedding-3-small` (1536d) — cheap, good enough. Store in `document_chunks.embedding`.
- **Retrieval:** `pgvector` cosine similarity, k=8, then re-rank to k=5 by metadata filters (`company_id`, optionally `client_id`).
- **Citation contract:** every AI output that uses retrieved context must include a `sources: [{document_id, chunk_index}]` array. The UI renders these as clickable chips.

### 6.4 Skill catalogue (MVP — 5 skills)

Each skill follows `Input → Process → Output` and has an explicit approval rule.

| Skill | Trigger | Input | Process | Output | Approval |
|---|---|---|---|---|---|
| `daily_briefing` | Cron 07:00 + on-demand | `user_id`, `date` | Pull today's meetings, urgent threads, due tasks; rank top-3 priorities via LLM | Briefing JSON | **No** (read-only summary) |
| `email_reply` | User clicks "Draft reply" | `message_id` | RAG over KB + thread; LLM drafts in detected language/tone; translate if needed | Draft email | **Yes** → approval inbox |
| `meeting_summary` | User submits transcript | `meeting_id` | LLM extracts summary, decisions, action items; proposes follow-up email | Summary + tasks + draft email | **Yes** for each task & email |
| `task_extraction` | Called inside other skills | `text`, `context` | LLM proposes tasks with title/owner/due/priority | Task list | **Yes** per task |
| `follow_up_detector` | Cron 08:00 | `company_id` | Find outbound threads with no inbound reply > N days; for each, draft nudge | Approval items | **Yes** |

> Skills *not* in MVP catalogue but listed in `/skills` UI as "coming soon": `proposal_draft`, `weekly_report`, `meeting_scheduler`. Keeps the surface honest.

### 6.5 Tool calls — read vs. write split

- **Read tools** the LLM can call freely: `search_kb`, `get_thread`, `get_meeting`, `get_client`, `list_tasks`. Logged to audit.
- **Write effectors** the LLM **cannot** call. Only the Skill Runner can enqueue an `approval` row; only the approval-execution endpoint, triggered by a human click, calls effectors.

This is the key safety property: **the LLM never has a tool that mutates external state.** It can only produce a *proposal* serialized as JSON.

### 6.6 Guardrails

- **Output schema validation** (pydantic). Hard-fail and one retry on bad JSON.
- **PII redaction** before logging full prompts to audit (mask emails/phones in the *log*, not the prompt itself).
- **Rate & cost caps** per company per day (hard ceiling on `tokens_in + tokens_out`).
- **Refusal rules** in the system prompt: no legal/financial advice; no actions affecting >5 recipients; no DE→EN translation of legally-binding text without flag.
- **Drafts marked clearly** in UI: "AI draft — not sent" badge until approved.

### 6.7 Model choices

- **Claude Sonnet 4.6** for drafting (email, summary, task extraction) — quality matters here.
- **Claude Haiku 4.5** for triage/urgency classification and routing — cheap, fast.
- **`text-embedding-3-small`** for embeddings.
- All routed through a single `LLMClient` abstraction so the demo can swap providers.

---

## 7. Backend design

### 7.1 Stack

- Python 3.12, FastAPI, uvicorn
- SQLAlchemy 2.0 (async), Alembic for migrations
- PostgreSQL 16 + `pgvector`
- Redis 7 (cache + RQ broker)
- RQ (or Celery) for: embedding jobs, cron skills (daily briefing, follow-up detector)
- MinIO (S3-compat) for documents
- Pydantic v2 throughout for schemas

### 7.2 Service layout (modular monolith — *not* microservices)

```
apps/api/
├─ opspilot/
│  ├─ main.py                  # FastAPI app
│  ├─ config.py                # Settings via pydantic-settings
│  ├─ db.py                    # Async session, base
│  ├─ deps.py                  # Auth, current_user, current_company
│  ├─ models/                  # SQLAlchemy models (one file per aggregate)
│  ├─ schemas/                 # Pydantic request/response
│  ├─ routers/
│  │   ├─ auth.py
│  │   ├─ onboarding.py
│  │   ├─ knowledge.py
│  │   ├─ messages.py
│  │   ├─ meetings.py
│  │   ├─ tasks.py
│  │   ├─ approvals.py
│  │   ├─ skills.py            # GET /skills, POST /skills/{key}/run
│  │   ├─ audit.py
│  │   └─ integrations.py
│  ├─ services/
│  │   ├─ rag.py               # chunking, embedding, retrieval
│  │   ├─ skill_runner.py      # the orchestrator
│  │   ├─ approvals.py         # enqueue/decide/execute
│  │   ├─ effectors.py         # mocked send_email, create_task, ...
│  │   └─ audit.py             # write-only audit helper
│  ├─ skills/
│  │   ├─ base.py              # Skill ABC, schema, registry
│  │   ├─ daily_briefing.py
│  │   ├─ email_reply.py
│  │   ├─ meeting_summary.py
│  │   ├─ task_extraction.py
│  │   └─ follow_up_detector.py
│  ├─ ai/
│  │   ├─ llm.py               # provider abstraction
│  │   ├─ prompts/             # versioned .md prompt templates
│  │   └─ guards.py            # validation, redaction
│  └─ workers/
│      └─ jobs.py              # RQ job entrypoints
├─ migrations/
└─ tests/
```

### 7.3 Endpoints (MVP cut)

- `POST /auth/signup`, `POST /auth/login`
- `POST /onboarding` (single submit) / `GET /companies/me`
- `POST /documents` (multipart) / `GET /documents` / `GET /documents/{id}` / `DELETE /documents/{id}`
- `GET /messages?status=unread&urgency=high` / `GET /messages/{id}` / `POST /messages/{id}/mark_read`
- `POST /meetings` (paste transcript) / `GET /meetings/{id}`
- `GET /tasks` / `POST /tasks` / `PATCH /tasks/{id}`
- `GET /approvals?status=pending` / `POST /approvals/{id}/decide` (approve/edit/reject/regenerate)
- `GET /skills` / `POST /skills/{key}/run`
- `GET /audit?from=&to=&user=&action=`
- `GET /integrations` / `POST /integrations/{kind}/toggle`

### 7.4 Background jobs

- `embed_document(document_id)` — fired on upload
- `cron_daily_briefing()` — 07:00 per company TZ
- `cron_follow_up_detector()` — 08:00 per company TZ
- All jobs idempotent; tracked in `skill_runs`.

---

## 8. Frontend design

### 8.1 Stack

- Next.js 15 (App Router), TypeScript, React Server Components where useful
- Tailwind + shadcn/ui (radix under the hood)
- TanStack Query for server state; Zustand for tiny UI state
- Forms: react-hook-form + zod
- Auth: NextAuth (or simple JWT cookie from FastAPI — pick one early)

### 8.2 Layout pattern

- Persistent left rail with the 12 routes from §4, grouped:
  - **Today**: Dashboard, Approvals (with pending count badge), Inbox
  - **Work**: Meetings, Tasks, Follow-ups
  - **Knowledge**: Knowledge base, Skills
  - **Trust**: Audit log, Integrations
- Top bar: company switcher (future), user menu, "+" quick-action.

### 8.3 Screens — design notes

- **Dashboard:** 3-priority hero card with AI rationale + source chips; below: today's meetings, urgent inbox, approvals queue summary, "AI activity today" mini audit feed.
- **Approval inbox:** card per pending approval. Header shows action type icon, target (e.g. "Reply to Müller GmbH"), and the *rationale* one-liner. Body shows the proposed payload (rendered email, task fields, etc.) in editable form. Footer: Approve · Edit & approve · Reject · Regenerate. Source chips link to KB doc viewer.
- **Skills library:** card per skill with input/output schema rendered as a small table — makes the architecture legible to recruiters.
- **Audit log:** dense table, virtualized; row expand shows full JSON; CSV export.
- **Knowledge base:** drag-and-drop upload zone, list with status (pending → indexed), search bar that hits `/knowledge/search` (semantic).

### 8.4 Design language

- Light, high-contrast, slightly-Linear-flavored. No purple gradients, no emoji-as-icons.
- German screenshots in the demo (helps konaktiva story); EN as default in code.
- One illustration max — keep it boring and credible.

---

## 9. Demo plan — 4 minutes for konaktiva

Target: a recruiter who has 4 minutes and wants to see (a) AI competence, (b) software engineering, (c) product thinking, (d) GDPR awareness.

### Beat sheet

| Time | Beat | What you say | What you show |
|---|---|---|---|
| 0:00–0:20 | **Hook** | "German IT/consulting SMEs lose 5+ hours a week to email triage and follow-ups. OpsPilot turns that into a daily plan — but never sends anything without you." | Dashboard with 3 priorities |
| 0:20–0:50 | **Onboarding (skip live)** | "On signup, OpsPilot learns the company: services, clients, tone — then ingests their docs." | Knowledge base screen with 4 indexed docs |
| 0:50–1:40 | **Email assistant + RAG** | "Here's an unread thread from Müller GmbH. The AI summarized it and proposes a reply in German — and you can see it cited the service-catalogue document." | Click thread → summary → "Draft reply" → see citations |
| 1:40–2:20 | **Approval inbox (the differentiator)** | "Nothing is sent automatically. Every external action lands here with a *why* and editable payload. Approve, edit, reject, or regenerate." | `/approvals` with 3 pending items, approve one |
| 2:20–2:55 | **Meeting → tasks** | "Paste a meeting transcript: OpsPilot extracts decisions, action items, and a follow-up draft — each task is *proposed*, not auto-created." | Paste transcript → see structured output → approve 2 tasks |
| 2:55–3:25 | **Audit log + GDPR** | "Every read, draft, and approval is logged with sources. We can export this for any client. The LLM has no write tools — it can only propose." | `/audit` filtered by today, expand a row, export CSV |
| 3:25–4:00 | **Skills + roadmap close** | "Each workflow is a Skill with a typed input/output. Adding a new one — say, proposal drafts — is one file." | `/skills` showing 5 active + 3 "coming soon" |

### What you're *not* showing
- Login/signup screens (boring)
- Settings screens (boring)
- Task board CRUD (mention it exists, don't dwell)
- Mocked Gmail integration page (mention "we mock for the demo; real OAuth is wired in the API layer")

---

## 10. Implementation roadmap

### Phase 1 — Clickable UI with mock data (frontend-only)
**Goal:** the entire demo flow runs against fixtures. No backend yet.
- Next.js scaffold, layout, routing for all 12 screens
- Mock API in `app/_mocks/` returning realistic German SME data
- Dashboard, Approvals, Inbox, Knowledge, Audit screens fully clickable
- Tailwind/shadcn theme locked

**Done when:** you can record the demo using only the frontend.

### Phase 2 — Backend & database
**Goal:** real persistence, real auth, no AI yet.
- FastAPI app, Postgres + pgvector, Alembic baseline migration
- All models from §5
- Auth (signup/login), onboarding submit, CRUD endpoints
- Document upload to MinIO (no embedding yet)
- Wire frontend to real API behind a feature flag

**Done when:** you can sign up, onboard, upload docs, see them in the list, and CRUD tasks.

### Phase 3 — AI workflows
**Goal:** the 5 MVP skills work end-to-end.
- LLM client abstraction (Claude Sonnet 4.6 / Haiku 4.5)
- Embedding pipeline + RAG retrieval
- Skill runner + approval enqueue + audit logging
- Implement skills in this order: `email_reply` → `task_extraction` → `meeting_summary` → `daily_briefing` → `follow_up_detector`
- Approval execute path with mocked effectors

**Done when:** drafting a reply, summarizing a meeting, and approving a task all work end-to-end and are audited.

### Phase 4 — Mocked integrations
**Goal:** the integrations page looks real and seeds plausible data.
- "Connect Gmail" button → 2-second fake OAuth → toggles status to `mocked`, seeds 8 threads
- Same for Calendar (seeds 3 meetings) and Drive (seeds 4 documents)
- Real Gmail OAuth code path scaffolded behind a flag — explainable in demo, not run

**Done when:** the demo runs against seeded "integrated" data.

### Phase 5 — Demo polish
**Goal:** ready to record and show live.
- Seed a believable German SME ("Sturm & Drang Consulting GmbH") with 4 clients, 8 threads, 3 meetings, 5 docs
- Empty states, loading skeletons, error toasts
- Audit log CSV export
- README, architecture diagram, 30-second loom, 4-minute demo recording
- Deploy to Fly.io / Railway with a public URL behind basic auth

**Done when:** you can send a recruiter one URL and one PDF and feel proud.

---

## 11. Open questions to decide before Phase 2

These are the ambiguous calls — answer them now, not in the middle of coding.

1. **Auth:** NextAuth on the frontend, or JWT cookie minted by FastAPI? *(Recommendation: FastAPI-issued JWT in httpOnly cookie. One source of truth.)*
2. **Tenancy:** is multi-company per user in scope? *(Recommendation: no — one user, one company in MVP. `users.company_id` is non-null.)*
3. **Embeddings provider:** OpenAI vs. local (`bge-small`)? *(Recommendation: OpenAI for quality, document the local fallback.)*
4. **Hosting story for the demo:** Fly.io (Frankfurt region) tells a better DE/GDPR story than Vercel+Render. *(Recommendation: Fly.io fra region for the API, Vercel for the Next.js frontend, with a note in the demo about EU data residency.)*
5. **Language detection:** library (`langdetect`) vs. LLM call? *(Recommendation: library — cheaper, deterministic.)*

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Scope creep — meetings scheduler, real Gmail OAuth, etc. | This document is the contract. Anything not in §1.1 is §1.3. |
| LLM output not parseable as JSON | Pydantic validation + 1 retry + fall back to "AI failed — try again" UI state |
| Demo runs against live LLM and fails on stage | Pre-record the 4-minute demo as backup; have it ready in a browser tab |
| Recruiter asks "is this really GDPR-compliant?" | Have `docs/security.md` ready: data residency, audit log, no LLM training, deletion endpoint |
| Time pressure | Cut nice-to-haves (§1.2) before cutting must-haves; cut polish before cutting the approval inbox |

---

*Last updated: 2026-05-03 — initial plan.*
