import type { Skill } from "@/types/models";

export const skills: Skill[] = [
  {
    key: "daily_briefing",
    name: "Daily briefing",
    description:
      "Sammelt Termine, dringende Threads und offene Aufgaben des Tages. Bewertet drei Top-Prioritäten mit Begründung.",
    trigger: "Cron 07:00 + on-demand",
    inputs: [
      { name: "user_id", type: "ID", description: "Wer bekommt das Briefing" },
      { name: "date", type: "ISO date" },
    ],
    output: [
      { name: "priorities", type: "Priority[3]" },
      { name: "todays_meetings", type: "Meeting[]" },
      { name: "urgent_threads", type: "Thread[]" },
      { name: "due_tasks", type: "Task[]" },
    ],
    approvalRequired: false,
    enabled: true,
    status: "active",
    category: "triage",
  },
  {
    key: "email_reply",
    name: "Email reply",
    description:
      "Schreibt einen Antwortentwurf in der erkannten Sprache und Formalität. Nutzt RAG über Knowledge Base + Threadverlauf.",
    trigger: "User-Klick «Antwort entwerfen»",
    inputs: [
      { name: "message_id", type: "ID" },
      { name: "tone_override", type: "string?", description: "Optional" },
    ],
    output: [
      { name: "draft_email", type: "EmailPayload" },
      { name: "sources", type: "Source[]" },
    ],
    approvalRequired: true,
    enabled: true,
    status: "active",
    category: "drafting",
  },
  {
    key: "meeting_summary",
    name: "Meeting summary",
    description:
      "Extrahiert Zusammenfassung, Entscheidungen, Action Items. Schlägt Follow-up-Mail und Aufgaben vor.",
    trigger: "User reicht Transkript ein",
    inputs: [
      { name: "meeting_id", type: "ID" },
      { name: "transcript", type: "string" },
    ],
    output: [
      { name: "summary", type: "string" },
      { name: "decisions", type: "string[]" },
      { name: "action_items", type: "Task[]" },
      { name: "follow_up_email", type: "EmailPayload" },
    ],
    approvalRequired: true,
    enabled: true,
    status: "active",
    category: "extraction",
  },
  {
    key: "task_extraction",
    name: "Task extraction",
    description:
      "Wandelt freien Text (E-Mail, Meetingnotiz) in strukturierte Aufgaben. Wird intern von anderen Skills aufgerufen.",
    trigger: "Intern (von anderen Skills)",
    inputs: [
      { name: "text", type: "string" },
      { name: "context", type: "string" },
    ],
    output: [{ name: "tasks", type: "Task[]" }],
    approvalRequired: true,
    enabled: true,
    status: "active",
    category: "extraction",
  },
  {
    key: "follow_up_detector",
    name: "Follow-up detector",
    description:
      "Findet ausgehende Threads ohne Antwort (> N Tage), Angebote ohne Reaktion, fehlende Meeting-Follow-ups. Entwirft Erinnerung.",
    trigger: "Cron 08:00",
    inputs: [
      { name: "company_id", type: "ID" },
      { name: "min_days", type: "int", description: "default 5" },
    ],
    output: [{ name: "follow_ups", type: "FollowUp[]" }],
    approvalRequired: true,
    enabled: true,
    status: "active",
    category: "tracking",
  },
  {
    key: "proposal_draft",
    name: "Proposal draft",
    description:
      "Erstellt Angebotsentwurf aus Discovery-Call-Notizen + Service-KB. Phasen, Aufwand, Preis-Bandbreite.",
    trigger: "—",
    inputs: [
      { name: "client_id", type: "ID" },
      { name: "scope", type: "string" },
    ],
    output: [{ name: "proposal_doc", type: "DocPayload" }],
    approvalRequired: true,
    enabled: false,
    status: "coming_soon",
    category: "drafting",
  },
  {
    key: "weekly_report",
    name: "Weekly report",
    description:
      "Wochenrückblick: Was lief, was offen ist, Forecast. Pro Person + Aggregat.",
    trigger: "—",
    inputs: [{ name: "week_iso", type: "string" }],
    output: [{ name: "report", type: "DocPayload" }],
    approvalRequired: false,
    enabled: false,
    status: "coming_soon",
    category: "reporting",
  },
  {
    key: "meeting_scheduler",
    name: "Meeting scheduler",
    description:
      "Schlägt Slots vor, entwirft Termin-Mail, erstellt Kalender-Event-Vorschlag.",
    trigger: "—",
    inputs: [
      { name: "attendees", type: "string[]" },
      { name: "duration_min", type: "int" },
    ],
    output: [{ name: "event_draft", type: "CalendarPayload" }],
    approvalRequired: true,
    enabled: false,
    status: "coming_soon",
    category: "drafting",
  },
];

export function skillByKey(key: string) {
  return skills.find((s) => s.key === key);
}
