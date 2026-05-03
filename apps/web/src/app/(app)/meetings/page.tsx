import Link from "next/link";
import { Calendar, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerI18n } from "@/lib/i18n/server";
import { clientById, meetings } from "@/lib/mocks";
import { formatDateTime, cn } from "@/lib/utils";

export default async function MeetingsPage() {
  const { locale, t } = await getServerI18n();
  const upcoming = meetings.filter((m) => m.status === "upcoming");
  const past = meetings.filter((m) => m.status === "done");

  return (
    <div>
      <PageHeader
        title={t("meetings.title")}
        description={t("meetings.description")}
        actions={
          <Link href="/meetings/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" /> {t("meetings.processTranscript")}
            </Button>
          </Link>
        }
      />

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("meetings.upcoming")}
      </h2>
      <Card className="mb-6">
        <CardContent className="-mx-2 -my-1 divide-y divide-border">
          {upcoming.map((m) => (
            <Link
              key={m.id}
              href={`/meetings/${m.id}`}
              className="flex items-start gap-3 px-3 py-3 hover:bg-muted/40 rounded-md"
            >
              <span className="flex h-10 w-10 flex-col items-center justify-center rounded-md border border-border bg-muted text-[10px] leading-none shrink-0">
                <span className="font-semibold">
                  {new Date(m.scheduledAt).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-muted-foreground mt-0.5">{m.durationMin}m</span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{m.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <Calendar className="h-3 w-3" />
                  {formatDateTime(m.scheduledAt, locale)}
                  <span>·</span>
                  <span>
                    {m.attendees.length} {t("common.participants")}
                  </span>
                  {m.clientId && (
                    <>
                      <span>·</span>
                      <span className="text-foreground/80 font-medium">
                        {clientById(m.clientId)?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("meetings.processed")}
      </h2>
      <Card>
        <CardContent className="-mx-2 -my-1 divide-y divide-border">
          {past.map((m) => (
            <Link
              key={m.id}
              href={`/meetings/${m.id}`}
              className={cn(
                "flex items-start gap-3 px-3 py-3 hover:bg-muted/40 rounded-md",
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary border border-blue-200 shrink-0">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{m.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                  {m.aiSummary}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="success">
                    {m.actionItems?.length ?? 0} {t("meetings.actionItems")}
                  </Badge>
                  <Badge variant="primary">
                    {m.decisions?.length ?? 0} {t("meetings.decisions")}
                  </Badge>
                  <span>· {formatDateTime(m.scheduledAt, locale)}</span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
