"use client";

import { useState } from "react";
import {
  Mail,
  Kanban,
  CalendarPlus,
  FileEdit,
  Bell,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SourceChip } from "@/components/ui/source-chip";
import type {
  Approval,
  CalendarPayload,
  DocPayload,
  EmailPayload,
  TaskPayload,
} from "@/types/models";
import { cn, relativeTime } from "@/lib/utils";

const ACTION_ICONS = {
  email_send: Mail,
  follow_up_send: Bell,
  task_create: Kanban,
  doc_update: FileEdit,
  calendar_create: CalendarPlus,
};

const ACTION_LABELS = {
  email_send: "E-Mail",
  follow_up_send: "Follow-up",
  task_create: "Aufgabe",
  doc_update: "Dokument",
  calendar_create: "Termin",
};

type Decision = "approved" | "edited" | "rejected" | null;

export function ApprovalCard({
  approval,
  defaultExpanded = false,
}: {
  approval: Approval;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [decision, setDecision] = useState<Decision>(null);
  const [editing, setEditing] = useState(false);
  const Icon = ACTION_ICONS[approval.actionType];

  if (decision === "approved") {
    return (
      <DecidedBanner
        title={approval.title}
        verdict="approved"
        sub="Versendet (Mock) · Audit-Log aktualisiert"
      />
    );
  }
  if (decision === "edited") {
    return (
      <DecidedBanner
        title={approval.title}
        verdict="edited"
        sub="Bearbeitet + freigegeben · Versendet (Mock)"
      />
    );
  }
  if (decision === "rejected") {
    return (
      <DecidedBanner
        title={approval.title}
        verdict="rejected"
        sub="Abgelehnt · Wird nicht versendet"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
              "bg-accent text-accent-foreground border-blue-200",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold leading-tight truncate">
                {approval.title}
              </h3>
              <Badge variant="primary">{ACTION_LABELS[approval.actionType]}</Badge>
              <Badge variant="outline">via {approval.skillKey}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <Sparkles className="inline h-3 w-3 mr-0.5 -mt-0.5" />
              {approval.rationale}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {approval.sources.map((s, i) => (
                <SourceChip key={i} source={s} />
              ))}
            </div>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {relativeTime(approval.createdAt)}
        </span>
      </CardHeader>

      <CardContent
        className={cn(
          "bg-muted/40",
          !expanded && approval.actionType !== "task_create" ? "py-3" : "py-4",
        )}
      >
        {approval.actionType === "email_send" ||
        approval.actionType === "follow_up_send" ? (
          <EmailPayloadView
            payload={approval.payload as EmailPayload}
            editing={editing}
            collapsed={!expanded}
          />
        ) : approval.actionType === "task_create" ? (
          <TaskPayloadView payload={approval.payload as TaskPayload} />
        ) : approval.actionType === "calendar_create" ? (
          <CalendarPayloadView payload={approval.payload as CalendarPayload} />
        ) : (
          <DocPayloadView payload={approval.payload as DocPayload} />
        )}

        {(approval.actionType === "email_send" ||
          approval.actionType === "follow_up_send") && (
          <button
            type="button"
            className="mt-3 text-[11px] font-medium text-primary hover:underline"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Einklappen" : "Vollständigen Entwurf anzeigen"}
          </button>
        )}
      </CardContent>

      <CardFooter className="justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="success"
            size="sm"
            onClick={() => setDecision(editing ? "edited" : "approved")}
          >
            <CheckCircle2 className="h-4 w-4" />
            {editing ? "Bearbeitet & freigeben" : "Freigeben"}
          </Button>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(true);
                setExpanded(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Bearbeiten
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDecision("rejected")}>
            <X className="h-4 w-4" />
            Ablehnen
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
          Neu generieren
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmailPayloadView({
  payload,
  editing,
  collapsed,
}: {
  payload: EmailPayload;
  editing: boolean;
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">An</span>
        <span className="font-medium">{payload.to.join(", ")}</span>
        <span className="text-muted-foreground">Betreff</span>
        {editing ? (
          <Input defaultValue={payload.subject} className="h-7 text-xs" />
        ) : (
          <span className="font-medium">{payload.subject}</span>
        )}
        <span className="text-muted-foreground">Sprache</span>
        <span className="flex items-center gap-1.5">
          <Badge variant="neutral">
            {payload.language === "de" ? "Deutsch" : "English"}
          </Badge>
          <Badge variant="neutral">
            {payload.formality === "sie" ? "Sie · formal" : "Du · informal"}
          </Badge>
        </span>
      </div>
      {editing ? (
        <Textarea
          defaultValue={payload.body}
          className="text-xs font-mono min-h-[180px]"
        />
      ) : (
        <pre
          className={cn(
            "whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 font-sans bg-card border border-border rounded-md p-3",
            collapsed && "max-h-32 overflow-hidden relative",
          )}
        >
          {payload.body}
          {collapsed && (
            <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
          )}
        </pre>
      )}
    </div>
  );
}

function TaskPayloadView({ payload }: { payload: TaskPayload }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">Titel</span>
      <span className="font-medium">{payload.title}</span>
      {payload.description && (
        <>
          <span className="text-muted-foreground">Beschreibung</span>
          <span>{payload.description}</span>
        </>
      )}
      <span className="text-muted-foreground">Owner</span>
      <span>{payload.ownerName ?? "—"}</span>
      <span className="text-muted-foreground">Fällig</span>
      <span>{payload.dueDate ?? "—"}</span>
      <span className="text-muted-foreground">Priorität</span>
      <span>
        <Badge
          variant={
            payload.priority === "high"
              ? "destructive"
              : payload.priority === "med"
                ? "warning"
                : "neutral"
          }
        >
          {payload.priority}
        </Badge>
      </span>
    </div>
  );
}

function CalendarPayloadView({ payload }: { payload: CalendarPayload }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">Titel</span>
      <span className="font-medium">{payload.title}</span>
      <span className="text-muted-foreground">Start</span>
      <span>{payload.startsAt}</span>
      <span className="text-muted-foreground">Dauer</span>
      <span>{payload.durationMin} Min.</span>
      <span className="text-muted-foreground">Teilnehmer</span>
      <span>{payload.attendees.join(", ")}</span>
      <span className="text-muted-foreground">Agenda</span>
      <span className="whitespace-pre-wrap">{payload.agenda}</span>
    </div>
  );
}

function DocPayloadView({ payload }: { payload: DocPayload }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">Dokument</span>
      <span className="font-medium">{payload.documentTitle}</span>
      <span className="text-muted-foreground">Änderung</span>
      <span>{payload.diffSummary}</span>
    </div>
  );
}

function DecidedBanner({
  title,
  verdict,
  sub,
}: {
  title: string;
  verdict: "approved" | "edited" | "rejected";
  sub: string;
}) {
  const config = {
    approved: {
      bg: "bg-green-50",
      ring: "ring-green-200",
      text: "text-green-800",
      label: "Freigegeben",
      Icon: CheckCircle2,
    },
    edited: {
      bg: "bg-blue-50",
      ring: "ring-blue-200",
      text: "text-blue-800",
      label: "Bearbeitet & freigegeben",
      Icon: Pencil,
    },
    rejected: {
      bg: "bg-slate-50",
      ring: "ring-slate-200",
      text: "text-slate-700",
      label: "Abgelehnt",
      Icon: X,
    },
  }[verdict];
  const Icon = config.Icon;
  return (
    <div
      className={cn(
        "rounded-lg p-4 ring-1 ring-inset",
        config.bg,
        config.ring,
        config.text,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Icon className="h-4 w-4" />
        {config.label}: {title}
      </div>
      <div className="mt-1 text-[11px] opacity-80">{sub}</div>
    </div>
  );
}
