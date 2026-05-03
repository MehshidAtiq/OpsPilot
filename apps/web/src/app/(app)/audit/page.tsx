"use client";

import { useState, useMemo } from "react";
import {
  ScrollText,
  Download,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auditLogs, users } from "@/lib/mocks";
import { formatDateTime, cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  search_kb: "search_kb",
  read_doc: "read_doc",
  generate_draft: "generate_draft",
  summarize_thread: "summarize_thread",
  extract_tasks: "extract_tasks",
  approval_created: "approval_created",
  approval_approved: "approval_approved",
  approval_edited: "approval_edited",
  approval_rejected: "approval_rejected",
  email_sent_mock: "email_sent (mock)",
  task_created: "task_created",
  doc_indexed: "doc_indexed",
  user_login: "user_login",
};

const ACTION_TONE: Record<string, "neutral" | "primary" | "success" | "warning" | "destructive"> = {
  search_kb: "neutral",
  read_doc: "neutral",
  generate_draft: "primary",
  summarize_thread: "primary",
  extract_tasks: "primary",
  approval_created: "warning",
  approval_approved: "success",
  approval_edited: "success",
  approval_rejected: "destructive",
  email_sent_mock: "success",
  task_created: "success",
  doc_indexed: "neutral",
  user_login: "neutral",
};

export default function AuditPage() {
  const [user, setUser] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return [...auditLogs]
      .reverse()
      .filter((l) => (user ? l.userName === user : true))
      .filter((l) => (action ? l.action === action : true))
      .filter((l) =>
        query
          ? (l.entityLabel ?? "").toLowerCase().includes(query.toLowerCase()) ||
            (l.userName ?? "").toLowerCase().includes(query.toLowerCase())
          : true,
      );
  }, [user, action, query]);

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Alles, was die KI gelesen, generiert oder geschrieben hat — und wer es freigegeben hat. Append-only."
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> CSV exportieren
          </Button>
        }
      />

      <div className="mb-3 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-900">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>
          GDPR / DSGVO: Quellen werden bei jedem Generierungs-Schritt mitgeloggt.
          Export jederzeit, Löschung auf Anfrage.
        </span>
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-3 mb-3">
        <select
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-2 text-sm"
        >
          <option value="">Alle Nutzer</option>
          <option value="system">system</option>
          {users.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-2 text-sm"
        >
          <option value="">Alle Aktionen</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Input
          placeholder="Suche nach Entität…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[160px_120px_1fr_1fr_30px] items-center gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
          <span>Zeitpunkt</span>
          <span>Akteur</span>
          <span>Aktion</span>
          <span>Entität</span>
          <span></span>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((log) => {
            const isOpen = openId === log.id;
            return (
              <div key={log.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : log.id)}
                  className={cn(
                    "grid w-full grid-cols-[160px_120px_1fr_1fr_30px] items-center gap-3 px-4 py-2 text-left text-xs hover:bg-muted/40",
                    isOpen && "bg-muted/40",
                  )}
                >
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {formatDateTime(log.createdAt)}
                  </span>
                  <span className="truncate">
                    {log.userName === "system" ? (
                      <Badge variant="neutral">AI</Badge>
                    ) : (
                      <span className="font-medium">{log.userName}</span>
                    )}
                  </span>
                  <span>
                    <Badge variant={ACTION_TONE[log.action]}>
                      {ACTION_LABELS[log.action]}
                    </Badge>
                  </span>
                  <span className="truncate text-foreground/80">
                    {log.entityLabel ?? `${log.entityType}:${log.entityId ?? "—"}`}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-border">
                    <pre className="whitespace-pre-wrap text-[11px] leading-relaxed font-mono text-slate-700">
                      {JSON.stringify(
                        {
                          id: log.id,
                          createdAt: log.createdAt,
                          userId: log.userId,
                          userName: log.userName,
                          action: log.action,
                          entityType: log.entityType,
                          entityId: log.entityId,
                          entityLabel: log.entityLabel,
                          skillKey: log.skillKey,
                          sources: log.sources,
                          metadata: log.metadata,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              <ScrollText className="mx-auto mb-2 h-5 w-5 opacity-50" />
              Keine Einträge passen zu den Filtern.
            </div>
          )}
        </div>
      </Card>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {filtered.length} von {auditLogs.length} Einträgen ·
        Append-only · Hashing pro Eintrag (geplant) · 7-Jahre-Retention konfigurierbar
      </p>
    </div>
  );
}
