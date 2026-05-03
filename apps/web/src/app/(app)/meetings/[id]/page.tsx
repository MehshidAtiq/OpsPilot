import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerI18n } from "@/lib/i18n/server";
import { clientById, meetingById, userById } from "@/lib/mocks";
import { formatDateTime } from "@/lib/utils";

export default async function MeetingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale, t } = await getServerI18n();
  const { id } = await params;
  const m = meetingById(id);
  if (!m) notFound();
  const client = m.clientId ? clientById(m.clientId) : null;

  return (
    <div>
      <Link
        href="/meetings"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> {t("meetings.back")}
      </Link>
      <PageHeader
        title={m.title}
        description={`${formatDateTime(m.scheduledAt, locale)} · ${m.durationMin} min · ${m.attendees.length} ${t("common.participants")}${client ? ` · ${client.name}` : ""}`}
        actions={
          m.status === "upcoming" ? (
            <Button variant="primary">
              <Wand2 className="h-4 w-4" /> {t("meetings.draftAgenda")}
            </Button>
          ) : (
            <Button variant="outline">{t("meetings.draftFollowUp")}</Button>
          )
        }
      />

      {m.status === "upcoming" && (
        <Card className="border-blue-200/80 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("meetings.preBriefing")}
            </CardTitle>
            <Badge variant="primary">daily_briefing</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            {client ? (
              <p>
                <span className="font-medium">{client.name}</span> —{" "}
                {client.notes}
              </p>
            ) : (
              <p>{t("meetings.internalNoClient")}</p>
            )}
            <ul className="mt-3 list-disc list-inside text-xs text-foreground/80 space-y-1">
              <li>{t("meetings.lastEmail")}</li>
              <li>{t("meetings.openTask")}</li>
              <li>{t("meetings.relevantDocs")}</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {m.aiSummary && (
        <Card className="border-blue-200/80 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("meetings.aiSummary")}
            </CardTitle>
            <Badge variant="primary">meeting_summary</Badge>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/90">
            {m.aiSummary}
          </CardContent>
        </Card>
      )}

      {m.decisions && m.decisions.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t("meetings.decisions")}</CardTitle>
            <Badge variant="success">{m.decisions.length}</Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {m.decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {m.actionItems && m.actionItems.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t("meetings.actionItems")}</CardTitle>
            <Badge variant="warning">
              {m.actionItems.length} → {t("meetings.proposed")}
            </Badge>
          </CardHeader>
          <CardContent className="-mx-2 -my-1 divide-y divide-border">
            {m.actionItems.map((a, i) => {
              const owner = a.ownerId ? userById(a.ownerId) : null;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <span className="flex-1">{a.text}</span>
                  {owner && (
                    <Badge variant="neutral">{owner.name.split(" ")[0]}</Badge>
                  )}
                  {a.dueDate && (
                    <Badge variant="outline">
                      {t("common.due")} {a.dueDate}
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    {t("common.toApproval")}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {m.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {t("meetings.transcriptSource")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-foreground/80">
              {m.transcript}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
