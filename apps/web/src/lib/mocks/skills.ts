import type { Skill } from "@/types/models";

export const skills: Skill[] = [
  {
    key: "daily_briefing",
    name: "Daily briefing",
    description:
      "Collects the day's meetings, urgent threads, and open tasks. Ranks the top three priorities with rationale.",
    trigger: "Cron 07:00 + on-demand",
    inputs: [
      { name: "user_id", type: "ID", description: "Who receives the briefing" },
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
      "Writes a reply draft in the detected language and formality. Uses RAG over the knowledge base and thread history.",
    trigger: "User clicks \"Draft reply\"",
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
      "Extracts summary, decisions, and action items. Suggests a follow-up email and tasks.",
    trigger: "User submits transcript",
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
      "Turns free text (email or meeting note) into structured tasks. Called internally by other skills.",
    trigger: "Internal (from other skills)",
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
      "Finds outbound threads without a response (> N days), proposals with no reaction, and missing meeting follow-ups. Drafts a reminder.",
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
      "Creates a proposal draft from discovery call notes and the service knowledge base. Includes phases, effort, and price range.",
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
      "Weekly review: what happened, what is open, and forecast. Per person and aggregate.",
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
      "Suggests time slots, drafts the scheduling email, and creates a calendar event proposal.",
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
