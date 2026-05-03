import type { Integration } from "@/types/models";

export const integrations: Integration[] = [
  {
    kind: "gmail",
    label: "Gmail",
    description: "Inbox-Sync für E-Mails und Threads.",
    status: "mocked",
    connectedAt: "2026-04-15T09:00:00+02:00",
    itemCount: 247,
  },
  {
    kind: "calendar",
    label: "Google Calendar",
    description: "Termine und Verfügbarkeiten.",
    status: "mocked",
    connectedAt: "2026-04-15T09:00:00+02:00",
    itemCount: 38,
  },
  {
    kind: "drive",
    label: "Google Drive",
    description: "Dokumenten-Sync für die Wissensdatenbank.",
    status: "mocked",
    connectedAt: "2026-04-22T11:30:00+02:00",
    itemCount: 6,
  },
  {
    kind: "slack",
    label: "Slack",
    description: "Benachrichtigungen + Befehle aus dem Workspace.",
    status: "disconnected",
  },
  {
    kind: "notion",
    label: "Notion",
    description: "Wiki-Sync (read-only).",
    status: "disconnected",
  },
  {
    kind: "clickup",
    label: "ClickUp",
    description: "Task-Sync (bidirektional, geplant).",
    status: "disconnected",
  },
];
