import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Languages, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { getServerI18n } from "@/lib/i18n/server";
import {
  approvals,
  clientById,
  messagesByThread,
  threadById,
} from "@/lib/mocks";
import { formatDateTime } from "@/lib/utils";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale, t } = await getServerI18n();
  const { id } = await params;
  const thread = threadById(id);
  if (!thread) notFound();
  const client = clientById(thread.clientId);
  const msgs = messagesByThread(thread.id);
  const linkedApproval = approvals.find(
    (a) =>
      (a.actionType === "email_send" || a.actionType === "follow_up_send") &&
      a.clientId === thread.clientId &&
      a.status === "pending",
  );

  return (
    <div>
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> {t("inbox.title")}
      </Link>
      <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {thread.subject}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{client?.name}</span>
            <span>·</span>
            <span>{client?.contactEmail}</span>
            <span>·</span>
            <Languages className="h-3 w-3" />
            <span>
              {thread.detectedLanguage === "de"
                ? t("common.german")
                : t("common.english")}
            </span>
            {thread.urgency === "high" && (
              <Badge variant="destructive">{t("inbox.urgent")}</Badge>
            )}
          </div>
        </div>
        <Link
          href={
            linkedApproval
              ? `/approvals/${linkedApproval.id}`
              : "/approvals"
          }
        >
          <Button variant="primary">
            <Wand2 className="h-4 w-4" />
            {linkedApproval ? t("inbox.checkDraft") : t("inbox.draftReply")}
          </Button>
        </Link>
      </div>

      {/* AI summary panel */}
      <Card className="mb-4 border-blue-200/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("inbox.aiSummary")}
          </CardTitle>
          <Badge variant="primary">summarize_thread</Badge>
        </CardHeader>
        <CardContent className="text-sm text-foreground/90">
          <p>{thread.aiSummary}</p>
          {thread.suggestedAction && (
            <div className="mt-3 rounded-md bg-accent/60 border border-blue-200 px-3 py-2 text-xs">
              <span className="font-semibold text-primary">
                {t("inbox.suggestedAction")}
              </span>{" "}
              {thread.suggestedAction}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex flex-col gap-3">
        {msgs.map((m) => (
          <Card key={m.id} className={m.direction === "outbound" ? "bg-muted/30" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  name={m.sender}
                  color={
                    m.direction === "outbound"
                      ? "bg-amber-200"
                      : "bg-slate-200"
                  }
                  size={28}
                />
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-xs font-medium truncate">
                    {m.sender}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {t("inbox.to")} {m.recipients.join(", ")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {m.direction === "outbound" && (
                  <Badge variant="outline">{t("inbox.sent")}</Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {formatDateTime(m.receivedAt, locale)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {m.body}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
