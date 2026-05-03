"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { clients, meetingById } from "@/lib/mocks";

const SAMPLE = meetingById("mtg_kraftstrom_disc")!;

export default function NewMeetingPage() {
  const { t } = useI18n();
  const [transcript, setTranscript] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function loadSample() {
    setTranscript(SAMPLE.transcript ?? "");
  }

  function run() {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDone(true);
    }, 1100);
  }

  return (
    <div>
      <Link
        href="/meetings"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> {t("meetings.back")}
      </Link>
      <PageHeader
        title={t("meetings.newTitle")}
        description={t("meetings.newDescription")}
      />

      {!done ? (
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("meetings.clientOptional")}
                </label>
                <select className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm">
                  <option>—</option>
                  {clients.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("meetings.formTitle")}
                </label>
                <Input defaultValue="KraftStrom Discovery Call" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium">
                  {t("meetings.notes")}
                </label>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-[11px] text-primary hover:underline"
                >
                  {t("meetings.loadSample")}
                </button>
              </div>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={t("meetings.notesPlaceholder")}
                className="min-h-[260px] font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={run}
                disabled={!transcript.trim() || running}
              >
                <Wand2 className="h-4 w-4" />
                {running ? t("meetings.processing") : t("meetings.runSkill")}
              </Button>
              <span className="text-[11px] text-muted-foreground">
                {t("meetings.skillApproval")}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ResultView />
      )}
    </div>
  );
}

function ResultView() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <Card className="border-blue-200/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("meetings.aiSummary")}
          </CardTitle>
          <Badge variant="primary">meeting_summary</Badge>
        </CardHeader>
        <CardContent className="text-sm">
          {SAMPLE.aiSummary}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("meetings.decisions")}</CardTitle>
          <Badge variant="success">{SAMPLE.decisions?.length}</Badge>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {SAMPLE.decisions?.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("meetings.suggestedTasks")}</CardTitle>
          <Badge variant="warning">
            {SAMPLE.actionItems?.length} → {t("meetings.approvalPerTask")}
          </Badge>
        </CardHeader>
        <CardContent className="-mx-2 -my-1 divide-y divide-border">
          {SAMPLE.actionItems?.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="flex-1">{a.text}</span>
              {a.dueDate && (
                <Badge variant="outline">
                  {t("common.due")} {a.dueDate}
                </Badge>
              )}
              <Button size="sm" variant="outline">
                {t("common.toApproval")}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
