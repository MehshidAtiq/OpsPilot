import Link from "next/link";
import { Bell, Clock, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clientById, threads } from "@/lib/mocks";

// Stale outbound threads = follow-up candidates.
// Detected by the `follow_up_detector` skill (read-only — drafts a reminder
// and routes it through Approval Inbox).
type Stale = {
  threadId: string;
  daysSilent: number;
  reason: string;
};

const STALE: Stale[] = [
  {
    threadId: "thr_bayr_wartung",
    daysSilent: 6,
    reason:
      "Wartungsvertrag läuft am 30.06.2026 aus. Vorschlag wurde am 28.04. gesendet, keine Reaktion.",
  },
];

export default function FollowUpsPage() {
  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Threads ohne Reaktion — der Skill follow_up_detector erkennt sie und schlägt eine höfliche Erinnerung vor."
        actions={
          <Badge variant="outline">
            <Bell className="h-3 w-3" /> {STALE.length} offen
          </Badge>
        }
      />

      <Card>
        <CardContent className="-mx-2 -my-1 divide-y divide-border">
          {STALE.map((s) => {
            const t = threads.find((x) => x.id === s.threadId);
            if (!t) return null;
            const client = t.clientId ? clientById(t.clientId) : null;
            return (
              <div key={s.threadId} className="px-3 py-3 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/inbox/${t.id}`}
                      className="text-sm font-medium leading-tight hover:underline"
                    >
                      {t.subject}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      {client && (
                        <span className="font-medium text-foreground/80">
                          {client.name}
                        </span>
                      )}
                      <Badge variant="warning">{s.daysSilent} Tage still</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-foreground/80">
                      {s.reason}
                    </p>
                  </div>
                  <Button size="sm" variant="primary">
                    <Wand2 className="h-3.5 w-3.5" /> Erinnerung entwerfen
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Hinweis: Erinnerungen werden niemals automatisch versendet. Jede Antwort
        durchläuft den Approval-Workflow.
      </p>
    </div>
  );
}
