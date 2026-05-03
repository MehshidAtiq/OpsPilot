import Link from "next/link";
import { Inbox as InboxIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { clientById, threads } from "@/lib/mocks";
import { cn, relativeTime } from "@/lib/utils";

export default function InboxPage() {
  const sorted = [...threads].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
  return (
    <div>
      <PageHeader
        title="Inbox"
        description="E-Mail-Threads, mit KI-Zusammenfassung und Vorschlag pro Thread."
        actions={
          <Badge variant="outline">
            <InboxIcon className="h-3 w-3" />
            {threads.filter((t) => t.hasUnread).length} ungelesen
          </Badge>
        }
      />
      <Card>
        <CardContent className="-mx-2 -my-1 divide-y divide-border">
          {sorted.map((t) => {
            const client = clientById(t.clientId);
            return (
              <Link
                key={t.id}
                href={`/inbox/${t.id}`}
                className={cn(
                  "flex items-start gap-3 px-3 py-3 hover:bg-muted/50 rounded-md",
                  t.hasUnread && "bg-blue-50/30",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    t.hasUnread ? "bg-primary" : "bg-transparent",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {client?.name}
                    </span>
                    {t.urgency === "high" && (
                      <Badge variant="destructive">dringend</Badge>
                    )}
                    {t.detectedLanguage === "en" && (
                      <Badge variant="neutral">EN</Badge>
                    )}
                    <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
                      {relativeTime(t.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-foreground/80 truncate">
                    {t.subject}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                    {t.aiSummary}
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
