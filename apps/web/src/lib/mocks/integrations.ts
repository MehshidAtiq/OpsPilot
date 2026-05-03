import type { Integration } from "@/types/models";

export const integrations: Integration[] = [
  {
    kind: "gmail",
    label: "Gmail",
    description: "Inbox sync for emails and threads.",
    status: "mocked",
    connectedAt: "2026-04-15T09:00:00+02:00",
    itemCount: 247,
  },
  {
    kind: "calendar",
    label: "Google Calendar",
    description: "Meetings and availability.",
    status: "mocked",
    connectedAt: "2026-04-15T09:00:00+02:00",
    itemCount: 38,
  },
  {
    kind: "drive",
    label: "Google Drive",
    description: "Document sync for the knowledge base.",
    status: "mocked",
    connectedAt: "2026-04-22T11:30:00+02:00",
    itemCount: 6,
  },
  {
    kind: "slack",
    label: "Slack",
    description: "Notifications and commands from the workspace.",
    status: "disconnected",
  },
  {
    kind: "notion",
    label: "Notion",
    description: "Wiki sync (read-only).",
    status: "disconnected",
  },
  {
    kind: "clickup",
    label: "ClickUp",
    description: "Task sync (bidirectional, planned).",
    status: "disconnected",
  },
];
