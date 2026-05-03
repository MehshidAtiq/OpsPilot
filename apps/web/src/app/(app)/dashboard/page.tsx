import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox as InboxIcon,
  Mail,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceChip } from "@/components/ui/source-chip";
import { Avatar } from "@/components/ui/avatar";
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

export default function DashboardPage() {
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const todaysMeetings = meetings.filter(
    (m) => m.scheduledAt.startsWith("2026-05-04") && m.status === "upcoming",
  );
  const urgentThreads = threads
    .filter((t) => t.urgency === "high" && t.hasUnread)
    .slice(0, 3);
  const recentAudit = auditLogs.slice(-6).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + 3 priorities hero */}
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Daily briefing · generiert um 07:00 · {currentUser.name.split(" ")[0]}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
          Guten Morgen, {currentUser.name.split(" ")[0]}.
        </h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-xl">
          Drei Dinge, die heute Aufmerksamkeit brauchen — und warum OpsPilot sie
          ausgewählt hat.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {dailyPriorities.map((p) => (
            <Card
              key={p.rank}
              className="relative flex flex-col overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1",
                  p.rank === 1
                    ? "bg-primary"
                    : p.rank === 2
                      ? "bg-info"
                      : "bg-warning",
                )}
              />
              <CardContent className="flex flex-col gap-3 pl-6 py-5 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Priorität {p.rank}
                </div>
                <h3 className="text-sm font-semibold leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.rationale}
                </p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {p.sources.map((s, i) => (
                    <SourceChip key={i} source={s} />
                  ))}
                </div>
                <Link
                  href={p.ctaHref}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {p.ctaLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Three column row */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Today's meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Heute
            </CardTitle>
            <Badge variant="outline">{todaysMeetings.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {todaysMeetings.map((m) => {
              const client = m.clientId ? clientById(m.clientId) : null;
              return (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="flex items-start gap-3 px-2 py-3 hover:bg-muted/60 rounded-md"
                >
                  <span className="flex h-9 w-9 flex-col items-center justify-center rounded-md border border-border bg-muted text-[10px] leading-none">
                    <span className="font-semibold">
                      {new Date(m.scheduledAt).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-muted-foreground mt-0.5">
                      {m.durationMin}m
                    </span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-tight truncate">
                      {m.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {client ? <span>{client.name}</span> : <span>Intern</span>}
                      <span>·</span>
                      <span>{m.attendees.length} Teilnehmer</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {todaysMeetings.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                Keine Termine heute.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent inbox */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InboxIcon className="h-4 w-4 text-muted-foreground" />
              Dringende E-Mails
            </CardTitle>
            <Badge variant="destructive">{urgentThreads.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {urgentThreads.map((t) => {
              const client = clientById(t.clientId);
              return (
                <Link
                  key={t.id}
                  href={`/inbox/${t.id}`}
                  className="flex items-start gap-3 px-2 py-3 hover:bg-muted/60 rounded-md"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">
                        {client?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {relativeTime(t.lastMessageAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-foreground/80 line-clamp-1">
                      {t.subject}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      {t.aiSummary}
                    </div>
                  </div>
                </Link>
              );
            })}
            {urgentThreads.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                Keine dringenden Mails.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approvals queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Freigaben offen
            </CardTitle>
            <Badge variant="primary">{pendingApprovals.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border -mx-2">
            {pendingApprovals.slice(0, 4).map((a) => {
              const client = a.clientId ? clientById(a.clientId) : null;
              return (
                <Link
                  key={a.id}
                  href={`/approvals/${a.id}`}
                  className="flex flex-col gap-1 px-2 py-3 hover:bg-muted/60 rounded-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {a.title}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {a.actionType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{client?.name ?? "intern"}</span>
                    <span>·</span>
                    <span>{relativeTime(a.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Recent AI activity */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              KI-Aktivität heute
            </CardTitle>
            <Link
              href="/audit"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Audit-Log öffnen
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
                      {humanAction(log.action)}
                    </span>{" "}
                    {log.entityLabel && (
                      <span className="text-foreground/80">
                        — {log.entityLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDateTime(log.createdAt)}
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

function humanAction(a: string) {
  const map: Record<string, string> = {
    search_kb: "durchsuchte die Wissensdatenbank",
    read_doc: "las ein Dokument",
    generate_draft: "erstellte einen Entwurf",
    summarize_thread: "fasste einen E-Mail-Thread zusammen",
    extract_tasks: "extrahierte Aufgaben",
    approval_created: "legte eine Freigabe an",
    approval_approved: "gab frei:",
    approval_edited: "bearbeitete + gab frei",
    approval_rejected: "lehnte ab",
    email_sent_mock: "verschickte (Mock):",
    task_created: "erstellte Aufgabe",
    doc_indexed: "indexierte Dokument",
    user_login: "meldete sich an",
  };
  return map[a] ?? a;
}
