import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Inbox as InboxIcon,
  Mail,
  Sparkles,
} from "lucide-react";
import { SessionFirstName } from "@/components/auth/session-first-name";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceChip } from "@/components/ui/source-chip";
import { getServerI18n } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  approvals,
  auditLogs,
  clientById,
  currentUser,
  dailyPriorities,
  meetings,
  threads,
  userById,
} from "@/lib/mocks";
import { cn, formatDateTime, relativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const { locale, t } = await getServerI18n();
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const todaysMeetings = meetings.filter(
    (m) => m.scheduledAt.startsWith("2026-05-04") && m.status === "upcoming",
  );
  const urgentThreads = threads
    .filter((thread) => thread.urgency === "high" && thread.hasUnread)
    .slice(0, 3);
  const recentAudit = auditLogs.slice(-6).reverse();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t("dashboard.briefing")} · {t("dashboard.generatedAt")} ·{" "}
          <SessionFirstName fallback={currentUser.name} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
          {t("dashboard.greeting")}, <SessionFirstName fallback={currentUser.name} />.
        </h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-xl">
          {t("dashboard.intro")}
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {dailyPriorities.map((priority) => (
            <Card
              key={priority.rank}
              className="relative flex flex-col overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1",
                  priority.rank === 1
                    ? "bg-primary"
                    : priority.rank === 2
                      ? "bg-info"
                      : "bg-warning",
                )}
              />
              <CardContent className="flex flex-col gap-3 pl-6 py-5 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboard.priority")} {priority.rank}
                </div>
                <h3 className="text-sm font-semibold leading-snug">
                  {priority.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {priority.rationale}
                </p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {priority.sources.map((source, index) => (
                    <SourceChip key={index} source={source} />
                  ))}
                </div>
                <Link
                  href={priority.ctaHref}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {priority.ctaLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.today")}
            </CardTitle>
            <Badge variant="outline">{todaysMeetings.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {todaysMeetings.map((meeting) => {
              const client = meeting.clientId
                ? clientById(meeting.clientId)
                : null;
              return (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="flex items-start gap-3 px-2 py-3 hover:bg-muted/60 rounded-md"
                >
                  <span className="flex h-9 w-9 flex-col items-center justify-center rounded-md border border-border bg-muted text-[10px] leading-none">
                    <span className="font-semibold">
                      {new Date(meeting.scheduledAt).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-muted-foreground mt-0.5">
                      {meeting.durationMin}m
                    </span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-tight truncate">
                      {meeting.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {client ? (
                        <span>{client.name}</span>
                      ) : (
                        <span>{t("common.internal")}</span>
                      )}
                      <span>·</span>
                      <span>
                        {meeting.attendees.length} {t("common.participants")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {todaysMeetings.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                {t("dashboard.noMeetings")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InboxIcon className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.urgentEmails")}
            </CardTitle>
            <Badge variant="destructive">{urgentThreads.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {urgentThreads.map((thread) => {
              const client = clientById(thread.clientId);
              return (
                <Link
                  key={thread.id}
                  href={`/inbox/${thread.id}`}
                  className="flex items-start gap-3 px-2 py-3 hover:bg-muted/60 rounded-md"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">
                        {client?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {relativeTime(thread.lastMessageAt, locale)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-foreground/80 line-clamp-1">
                      {thread.subject}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      {thread.aiSummary}
                    </div>
                  </div>
                </Link>
              );
            })}
            {urgentThreads.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                {t("dashboard.noUrgentEmails")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.openApprovals")}
            </CardTitle>
            <Badge variant="primary">{pendingApprovals.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {pendingApprovals.slice(0, 4).map((approval) => {
              const client = approval.clientId
                ? clientById(approval.clientId)
                : null;
              return (
                <Link
                  key={approval.id}
                  href={`/approvals/${approval.id}`}
                  className="flex flex-col gap-1 px-2 py-3 hover:bg-muted/60 rounded-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {approval.title}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {approval.actionType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{client?.name ?? t("common.internal")}</span>
                    <span>·</span>
                    <span>{relativeTime(approval.createdAt, locale)}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.aiActivity")}
            </CardTitle>
            <Link
              href="/audit"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {t("dashboard.openAuditLog")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {recentAudit.map((log) => {
              const user = log.userId ? userById(log.userId) : null;
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-2 py-2.5"
                >
                  {user ? (
                    <Avatar name={user.name} color={user.avatarColor} size={24} />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                      AI
                    </span>
                  )}
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-medium">{log.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {humanAction(log.action, t)}
                    </span>{" "}
                    {log.entityLabel && (
                      <span className="text-foreground/80">
                        — {log.entityLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDateTime(log.createdAt, locale)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function humanAction(action: string, t: (key: TranslationKey) => string) {
  const map: Record<string, TranslationKey> = {
    search_kb: "dashboard.action.search_kb",
    read_doc: "dashboard.action.read_doc",
    generate_draft: "dashboard.action.generate_draft",
    summarize_thread: "dashboard.action.summarize_thread",
    extract_tasks: "dashboard.action.extract_tasks",
    approval_created: "dashboard.action.approval_created",
    approval_approved: "dashboard.action.approval_approved",
    approval_edited: "dashboard.action.approval_edited",
    approval_rejected: "dashboard.action.approval_rejected",
    email_sent_mock: "dashboard.action.email_sent_mock",
    task_created: "dashboard.action.task_created",
    doc_indexed: "dashboard.action.doc_indexed",
    user_login: "dashboard.action.user_login",
  };
  return map[action] ? t(map[action]) : action;
}
