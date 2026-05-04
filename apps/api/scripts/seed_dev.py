"""Idempotent dev seed for OpsPilot.

Running this multiple times must not duplicate companies, threads, meetings,
documents, approvals, or tasks. Every entity has a stable natural key:

  - company   → name
  - user      → email
  - client    → (company_id, name)
  - message   → (company_id, thread_id, sender, received_at)
  - meeting   → (company_id, title, scheduled_at)
  - document  → (company_id, title)
  - task      → (company_id, title)
  - approval  → seeded only when missing for a fresh demo

We anchor everything around 2026-05-04 09:30 CET (Mon morning) so the demo
"daily briefing" pulls a coherent view.

Usage:
    cd apps/api
    .venv/bin/python -m scripts.seed_dev

The script uses the standard ``DATABASE_URL`` from .env. Schema must already
exist (run ``alembic upgrade head`` first).
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from opspilot.ai.embeddings import MockEmbeddings, embeddings_client
from opspilot.db import AsyncSessionLocal
from opspilot.models import (
    Approval,
    Client,
    Company,
    Document,
    Meeting,
    Message,
    Task,
    User,
)
from opspilot.services.auth import hash_password
from opspilot.services.rag import embed_and_upsert_document

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("seed")

# Anchor: Monday 2026-05-04 09:30 UTC (≈ 11:30 CET). Stable across runs.
NOW = datetime(2026, 5, 4, 9, 30, tzinfo=timezone.utc)

COMPANY_NAME = "Sturm & Drang Consulting GmbH"
OWNER_EMAIL = "demo@sturm-drang.example"
OWNER_PASSWORD = "demo-password-123"  # dev-only fixture, never production


async def get_or_create_company(session: AsyncSession) -> Company:
    existing = (
        await session.execute(select(Company).where(Company.name == COMPANY_NAME))
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    company = Company(
        name=COMPANY_NAME,
        industry="IT consulting",
        services=["Microsoft 365 rollouts", "Azure migrations", "GDPR audits"],
        target_clients="German Mittelstand: 50–500 employees, IT-light operations",
        tone_profile={
            "voice": "polite, factual, no marketing fluff",
            "style_notes": ["short paragraphs", "no exclamation marks"],
        },
        primary_language="de",
        default_formality="sie",
        settings={"timezone": "Europe/Berlin"},
    )
    session.add(company)
    await session.flush()
    log.info("created company %s", company.name)
    return company


async def get_or_create_owner(session: AsyncSession, company: Company) -> User:
    existing = (
        await session.execute(select(User).where(User.email == OWNER_EMAIL))
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    user = User(
        company_id=company.id,
        email=OWNER_EMAIL,
        password_hash=hash_password(OWNER_PASSWORD),
        name="Anna Schwarz",
        role="owner",
        locale="de-DE",
    )
    session.add(user)
    await session.flush()
    log.info("created owner user %s", user.email)
    return user


async def get_or_create_client(
    session: AsyncSession,
    *,
    company: Company,
    name: str,
    contact_email: str,
    language: str = "de",
    formality: str = "sie",
) -> Client:
    existing = (
        await session.execute(
            select(Client).where(Client.company_id == company.id, Client.name == name)
        )
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    client = Client(
        company_id=company.id,
        name=name,
        contact_email=contact_email,
        language=language,
        formality_override=formality,
    )
    session.add(client)
    await session.flush()
    log.info("created client %s", name)
    return client


async def upsert_message(
    session: AsyncSession,
    *,
    company: Company,
    client: Client | None,
    thread_id: str,
    direction: str,
    subject: str,
    body: str,
    sender: str,
    recipients: list[str],
    received_at: datetime,
    is_read: bool,
) -> Message:
    existing = (
        await session.execute(
            select(Message).where(
                Message.company_id == company.id,
                Message.thread_id == thread_id,
                Message.sender == sender,
                Message.received_at == received_at,
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    msg = Message(
        company_id=company.id,
        client_id=client.id if client else None,
        channel="email",
        direction=direction,
        thread_id=thread_id,
        subject=subject,
        body=body,
        snippet=body[:160],
        sender=sender,
        recipients=recipients,
        received_at=received_at,
        is_read=is_read,
        urgency={"score": 0.7 if direction == "inbound" else 0.2},
        source="gmail_mock",
    )
    session.add(msg)
    await session.flush()
    log.info("created message %s [%s]", thread_id, direction)
    return msg


async def upsert_meeting(
    session: AsyncSession,
    *,
    company: Company,
    title: str,
    scheduled_at: datetime,
    duration_min: int,
    attendees: list[str],
    transcript: str | None,
) -> Meeting:
    existing = (
        await session.execute(
            select(Meeting).where(
                Meeting.company_id == company.id,
                Meeting.title == title,
                Meeting.scheduled_at == scheduled_at,
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    meeting = Meeting(
        company_id=company.id,
        title=title,
        scheduled_at=scheduled_at,
        duration_min=duration_min,
        attendees=attendees,
        transcript=transcript,
        ai_decisions=[],
        ai_action_items=[],
        source="calendar_mock",
    )
    session.add(meeting)
    await session.flush()
    log.info("created meeting %r", title)
    return meeting


async def upsert_document(
    session: AsyncSession,
    *,
    company: Company,
    uploader: User,
    title: str,
    body: str,
) -> tuple[Document, str]:
    """Create or refresh a markdown document and return ``(doc, body)``."""
    existing = (
        await session.execute(
            select(Document).where(
                Document.company_id == company.id, Document.title == title
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        return existing, body
    doc = Document(
        company_id=company.id,
        uploader_id=uploader.id,
        title=title,
        source="seed",
        # We don't actually drop the body in object storage; the seed embeds
        # directly. The storage_key keeps the column non-null.
        storage_key=f"seed/{company.id}/{uuid.uuid4()}.md",
        mime="text/markdown",
        size_bytes=len(body.encode("utf-8")),
        status="pending",
        metadata_={"seed": True},
    )
    session.add(doc)
    await session.flush()
    log.info("created document %r", title)
    return doc, body


async def upsert_task(
    session: AsyncSession,
    *,
    company: Company,
    title: str,
    description: str,
    priority: str,
    status_value: str,
    owner: User | None,
) -> Task:
    existing = (
        await session.execute(
            select(Task).where(Task.company_id == company.id, Task.title == title)
        )
    ).scalar_one_or_none()
    if existing is not None:
        return existing
    task = Task(
        company_id=company.id,
        title=title,
        description=description,
        priority=priority,
        status=status_value,
        owner_user_id=owner.id if owner else None,
    )
    session.add(task)
    await session.flush()
    log.info("created task %r", title)
    return task


async def upsert_approval(
    session: AsyncSession,
    *,
    company: Company,
    action_type: str,
    payload: dict[str, Any],
    rationale: str,
    sources: list[dict[str, Any]],
) -> Approval:
    """Approval idempotency: keyed on (company, action_type, payload['title'|'subject'])."""
    title_key = payload.get("subject") or payload.get("title") or ""
    rows: Iterable[Approval] = (
        await session.execute(
            select(Approval).where(
                Approval.company_id == company.id,
                Approval.action_type == action_type,
            )
        )
    ).scalars()
    for row in rows:
        existing_key = row.payload.get("subject") or row.payload.get("title") or ""
        if existing_key == title_key:
            return row
    approval = Approval(
        company_id=company.id,
        requester="seed",
        action_type=action_type,
        payload=payload,
        rationale=rationale,
        sources=sources,
        status="pending",
    )
    session.add(approval)
    await session.flush()
    log.info("created approval %s [%s]", action_type, title_key[:60])
    return approval


# ----- payloads -------------------------------------------------------------


THREAD_MUELLER_BODY_DE = (
    "Sehr geehrte Damen und Herren,\n\n"
    "wir prüfen aktuell eine Migration unserer 180 Arbeitsplätze auf Microsoft 365 "
    "Business Premium und benötigen ein Angebot inklusive Onboarding und einer "
    "kurzen GDPR-Folgenabschätzung. Können Sie uns bis Ende der Woche eine "
    "Indikation geben?\n\n"
    "Mit freundlichen Grüßen,\n"
    "Stefan Müller\n"
    "Müller GmbH"
)

THREAD_FOLLOWUP_OUTBOUND = (
    "Hallo Frau Becker,\n\n"
    "anbei wie besprochen unser Angebot für die Azure-Migration. Lassen Sie uns "
    "gerne einen kurzen Call vereinbaren, um die Architektur durchzugehen.\n\n"
    "Beste Grüße"
)

DOC_INTRO_BODY_DE = """\
# Sturm & Drang Consulting — Leistungsübersicht

## Microsoft 365 Migrationen
Wir begleiten mittelständische Kunden bei der Einführung von Microsoft 365
Business Premium. Standard-Paket: Tenant-Setup, Identitätsmigration (AD Connect),
Exchange-Migration aus On-Prem oder Google Workspace, Teams-Rollout sowie
SharePoint-Strukturierung. Onboarding-Workshops sind inklusive.

## Azure Migrationen
Wir bewerten bestehende On-Prem-Workloads, definieren eine Zielarchitektur in
Azure (häufig Hub-and-Spoke mit Azure Firewall) und führen die Migration mit
Azure Migrate durch. Schwerpunkt liegt auf Kostenkontrolle und einer sauberen
Landing Zone.

## GDPR und Datenschutz
Vor jeder Cloud-Migration erstellen wir eine kurze GDPR-Folgenabschätzung
(DPIA), prüfen Auftragsverarbeitungsverträge mit Microsoft und dokumentieren
Datenstandorte. Bei sensiblen Branchen (Healthcare, Public Sector) ergänzen wir
Customer Lockbox sowie Microsoft Purview.

## Preise und Vorgehen
Festpreise pro Arbeitsplatz; Erstgespräch kostenfrei. Üblicher Projektzeitrahmen
für 100–200 Arbeitsplätze: 6–10 Wochen.
"""

MEETING_TRANSCRIPT_DE = """\
[Anna] Guten Morgen, danke fürs Kommen. Heute geht es um die Müller-Migration.
[Stefan Müller] Ja, wir sind kurz davor zu unterschreiben, hätten aber noch zwei Fragen.
[Anna] Klar, schießen Sie los.
[Stefan Müller] Erstens: Können wir die GDPR-DPIA vor dem Tenant-Setup bekommen, nicht erst am Ende?
[Anna] Sinnvoll. Wir können die DPIA in den Discovery-Sprint vorziehen, das verlängert die Phase um etwa eine Woche.
[Stefan Müller] Zweitens: Sie hatten Customer Lockbox erwähnt — ist das im Festpreis enthalten?
[Anna] Bei Ihren 180 Arbeitsplätzen kostet die Lizenz extra, die Konfiguration ist im Festpreis. Ich schicke Ihnen heute eine Aufstellung.
[Stefan Müller] Gut. Dann lassen wir das Datum nächste Woche unterschreiben.
[Anna] Perfekt. Ich nehme als To-do mit: DPIA in Discovery vorziehen, Customer-Lockbox-Aufstellung versenden, Vertragsunterschrift kommende Woche koordinieren.
"""


async def seed(session: AsyncSession) -> None:
    company = await get_or_create_company(session)
    owner = await get_or_create_owner(session, company)

    mueller = await get_or_create_client(
        session,
        company=company,
        name="Müller GmbH",
        contact_email="stefan.mueller@mueller.example",
    )
    becker = await get_or_create_client(
        session,
        company=company,
        name="Becker Logistik",
        contact_email="becker@beckerlogistik.example",
    )

    # --- Thread 1: Müller — recent inbound, NOT yet replied (drives email_reply) ---
    await upsert_message(
        session,
        company=company,
        client=mueller,
        thread_id="thread-mueller-m365",
        direction="inbound",
        subject="Angebot Microsoft 365 Migration für 180 Arbeitsplätze",
        body=THREAD_MUELLER_BODY_DE,
        sender="stefan.mueller@mueller.example",
        recipients=[OWNER_EMAIL],
        received_at=NOW - timedelta(hours=18),
        is_read=False,
    )

    # --- Thread 2: Becker — outbound 5 days ago, no reply (drives follow_up_detector) ---
    await upsert_message(
        session,
        company=company,
        client=becker,
        thread_id="thread-becker-azure",
        direction="outbound",
        subject="Angebot Azure-Migration",
        body=THREAD_FOLLOWUP_OUTBOUND,
        sender=OWNER_EMAIL,
        recipients=["becker@beckerlogistik.example"],
        received_at=NOW - timedelta(days=5),
        is_read=True,
    )

    # --- Today's meeting (drives daily_briefing) ---
    await upsert_meeting(
        session,
        company=company,
        title="Müller GmbH — M365 Vertragsabschluss",
        scheduled_at=NOW.replace(hour=14, minute=0, second=0, microsecond=0),
        duration_min=45,
        attendees=[OWNER_EMAIL, "stefan.mueller@mueller.example"],
        transcript=None,  # transcript-less meeting on the calendar
    )

    # --- Past meeting WITH transcript (drives meeting_summary) ---
    past_meeting = await upsert_meeting(
        session,
        company=company,
        title="Müller GmbH — Discovery-Call",
        scheduled_at=NOW - timedelta(days=2, hours=4),
        duration_min=30,
        attendees=[OWNER_EMAIL, "stefan.mueller@mueller.example"],
        transcript=MEETING_TRANSCRIPT_DE,
    )

    # --- Document row (embedding happens AFTER this commit so failures
    #     don't roll back the rest of the seed). ---
    doc, body = await upsert_document(
        session,
        company=company,
        uploader=owner,
        title="Sturm & Drang — Leistungsübersicht",
        body=DOC_INTRO_BODY_DE,
    )

    # --- A few tasks already in flight ---
    await upsert_task(
        session,
        company=company,
        title="DPIA-Vorlage für Müller GmbH aktualisieren",
        description="Vorlage 2025-Q4 anpassen, Customer-Lockbox-Hinweis ergänzen.",
        priority="high",
        status_value="in_progress",
        owner=owner,
    )
    await upsert_task(
        session,
        company=company,
        title="Becker Logistik — Architecture-Diagramm fertigstellen",
        description="Hub-and-Spoke skizzieren, mit Kostenrahmen versenden.",
        priority="med",
        status_value="proposed",
        owner=owner,
    )

    # --- Two seeded approvals so the /approvals UI has something to chew on
    #     even before any skill runs. They're idempotent on (action_type, title|subject). ---
    await upsert_approval(
        session,
        company=company,
        action_type="email_reply",
        payload={
            "to": "stefan.mueller@mueller.example",
            "thread_id": "thread-mueller-m365",
            "subject": "Re: Angebot Microsoft 365 Migration für 180 Arbeitsplätze",
            "body": (
                "Sehr geehrter Herr Müller,\n\n"
                "vielen Dank für Ihre Anfrage. Anbei eine erste Indikation für die "
                "Migration auf Microsoft 365 Business Premium inklusive DPIA. Für "
                "180 Arbeitsplätze rechnen wir mit einem Projektzeitraum von 8–10 "
                "Wochen.\n\nMit freundlichen Grüßen"
            ),
            "language": "de",
            "formality": "sie",
        },
        rationale="Drafted reply to Müller GmbH M365 enquiry using KB Leistungsübersicht.",
        sources=[{"type": "message", "thread_id": "thread-mueller-m365"}],
    )
    await upsert_approval(
        session,
        company=company,
        action_type="task_create",
        payload={
            "title": "Customer-Lockbox-Aufstellung an Müller senden",
            "description": "Aus Discovery-Call: Lizenzkosten + Konfigurationsumfang.",
            "priority": "high",
            "source_type": "meeting",
            "source_id": str(past_meeting.id),
        },
        rationale="Action item from Müller Discovery-Call transcript.",
        sources=[{"type": "meeting", "id": str(past_meeting.id)}],
    )

    doc_id = doc.id
    needs_index = doc.status != "indexed"
    await session.commit()
    log.info("seed entities committed")
    if needs_index:
        global _PENDING_INDEX
        _PENDING_INDEX = (doc_id, body)


async def index_document(doc_id: uuid.UUID, body: str) -> None:
    """Embed the seeded doc in a fresh session.

    Run after the main seed has been committed so an OpenAI 429 / network
    error doesn't roll back any seeded entities. Falls back to
    ``MockEmbeddings`` so the demo pipeline still has retrievable chunks.
    """
    async with AsyncSessionLocal() as session:
        doc = (
            await session.execute(select(Document).where(Document.id == doc_id))
        ).scalar_one()
        if doc.status == "indexed":
            return
        try:
            n = await embed_and_upsert_document(
                session, document=doc, body=body, embeddings=embeddings_client
            )
            await session.commit()
            log.info("indexed %d chunk(s) with real embeddings", n)
            return
        except Exception as exc:
            await session.rollback()
            log.warning(
                "real embeddings failed (%s); falling back to MockEmbeddings",
                str(exc)[:140],
            )

    async with AsyncSessionLocal() as session:
        doc = (
            await session.execute(select(Document).where(Document.id == doc_id))
        ).scalar_one()
        try:
            n = await embed_and_upsert_document(
                session, document=doc, body=body, embeddings=MockEmbeddings()
            )
            await session.commit()
            log.info("indexed %d chunk(s) with MockEmbeddings (fallback)", n)
        except Exception as exc:
            await session.rollback()
            log.error("mock embeddings also failed: %s", exc)
            async with AsyncSessionLocal() as s2:
                d = (
                    await s2.execute(select(Document).where(Document.id == doc_id))
                ).scalar_one()
                d.status = "embed_failed"
                await s2.commit()


async def main() -> None:
    async with AsyncSessionLocal() as session:
        await seed(session)
        # `seed()` set ``doc_id_for_index`` and ``doc_body_for_index`` on the
        # session via attributes — pull them and pass to a fresh session.
    # Doc indexing in a fully separate session, so quota errors can't roll
    # back the rest of the seed.
    if _PENDING_INDEX:
        doc_id, body = _PENDING_INDEX
        await index_document(doc_id, body)
    log.info("seed complete")


# Hand-off slot from seed() → main() so embedding runs in its own session.
_PENDING_INDEX: tuple[uuid.UUID, str] | None = None


if __name__ == "__main__":
    asyncio.run(main())
