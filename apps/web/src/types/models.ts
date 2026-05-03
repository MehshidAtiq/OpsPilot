// Domain types — mirror the data model in PLAN.md §5.
// Used by the mock layer in Phase 1; will be regenerated from API in Phase 2.

export type ID = string;

export type Formality = "sie" | "du";
export type Language = "de" | "en";

export interface Company {
  id: ID;
  name: string;
  industry: string;
  services: string[];
  targetClients: string;
  primaryLanguage: Language;
  defaultFormality: Formality;
  toneSummary: string;
}

export type UserRole = "owner" | "member";

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string; // tailwind bg class
}

export interface Client {
  id: ID;
  name: string;
  contactEmail: string;
  language: Language;
  formality: Formality;
  notes?: string;
}

export interface ProjectRef {
  id: ID;
  clientId: ID;
  name: string;
  status: "active" | "paused" | "done";
}

export interface Document {
  id: ID;
  title: string;
  source: "upload" | "drive_mock" | "email_mock";
  mime: "application/pdf" | "application/msword" | "text/markdown" | "text/plain";
  sizeBytes: number;
  status: "pending" | "indexed" | "failed";
  uploadedAt: string;
  uploaderId: ID;
  chunkCount?: number;
  summary?: string;
}

export type Channel = "email" | "chat";
export type Direction = "inbound" | "outbound";
export type Urgency = "low" | "normal" | "high";

export interface Message {
  id: ID;
  threadId: ID;
  channel: Channel;
  direction: Direction;
  clientId?: ID;
  projectId?: ID;
  subject: string;
  body: string;
  snippet: string;
  sender: string;
  recipients: string[];
  receivedAt: string;
  isRead: boolean;
  urgency: Urgency;
  aiSummary?: string;
  language?: Language;
}

export interface Thread {
  id: ID;
  clientId: ID;
  subject: string;
  lastMessageAt: string;
  messageCount: number;
  hasUnread: boolean;
  urgency: Urgency;
  aiSummary: string;
  detectedLanguage: Language;
  suggestedAction?: string;
  messageIds: ID[];
}

export interface ActionItem {
  text: string;
  ownerId?: ID;
  dueDate?: string;
}

export interface Meeting {
  id: ID;
  title: string;
  clientId?: ID;
  scheduledAt: string;
  durationMin: number;
  attendees: string[];
  status: "upcoming" | "in_progress" | "done";
  transcript?: string;
  aiSummary?: string;
  decisions?: string[];
  actionItems?: ActionItem[];
  source: "calendar_mock" | "manual";
}

export type TaskStatus = "proposed" | "approved" | "in_progress" | "done" | "rejected";
export type TaskPriority = "low" | "med" | "high";

export interface Task {
  id: ID;
  title: string;
  description?: string;
  ownerId?: ID;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  clientId?: ID;
  sourceType?: "email" | "meeting" | "manual";
  sourceId?: ID;
  createdAt: string;
}

export type ApprovalActionType =
  | "email_send"
  | "task_create"
  | "doc_update"
  | "calendar_create"
  | "follow_up_send";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "edited"
  | "rejected"
  | "regenerated";

export interface ApprovalSource {
  documentId?: ID;
  documentTitle?: string;
  chunkIndex?: number;
  threadId?: ID;
  meetingId?: ID;
  label: string;
}

export interface EmailPayload {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  language: Language;
  formality: Formality;
}

export interface TaskPayload {
  title: string;
  description?: string;
  ownerName?: string;
  dueDate?: string;
  priority: TaskPriority;
}

export interface CalendarPayload {
  title: string;
  attendees: string[];
  startsAt: string;
  durationMin: number;
  agenda: string;
}

export interface DocPayload {
  documentTitle: string;
  diffSummary: string;
}

export interface Approval {
  id: ID;
  actionType: ApprovalActionType;
  title: string;
  rationale: string;
  sources: ApprovalSource[];
  payload: EmailPayload | TaskPayload | CalendarPayload | DocPayload;
  status: ApprovalStatus;
  skillKey: string;
  skillRunId: ID;
  clientId?: ID;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface SkillField {
  name: string;
  type: string;
  description?: string;
}

export interface Skill {
  key: string;
  name: string;
  description: string;
  trigger: string;
  inputs: SkillField[];
  output: SkillField[];
  approvalRequired: boolean;
  enabled: boolean;
  status: "active" | "coming_soon";
  category: "triage" | "drafting" | "extraction" | "tracking" | "reporting";
}

export type AuditAction =
  | "read_doc"
  | "search_kb"
  | "generate_draft"
  | "summarize_thread"
  | "extract_tasks"
  | "approval_created"
  | "approval_approved"
  | "approval_edited"
  | "approval_rejected"
  | "email_sent_mock"
  | "task_created"
  | "doc_indexed"
  | "user_login";

export interface AuditLog {
  id: ID;
  createdAt: string;
  userId?: ID;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId?: ID;
  entityLabel?: string;
  sources?: ApprovalSource[];
  metadata?: Record<string, string | number | boolean>;
  skillKey?: string;
}

export interface Integration {
  kind: "gmail" | "calendar" | "drive" | "slack" | "notion" | "clickup";
  label: string;
  description: string;
  status: "mocked" | "connected" | "disconnected";
  connectedAt?: string;
  itemCount?: number;
}

export interface DailyPriority {
  rank: 1 | 2 | 3;
  title: string;
  rationale: string;
  ctaLabel: string;
  ctaHref: string;
  sources: ApprovalSource[];
}
