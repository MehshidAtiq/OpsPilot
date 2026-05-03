import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalCard } from "@/components/feature/approvals/approval-card";
import { EmptyState } from "@/components/ui/empty-state";
import { approvals } from "@/lib/mocks";

export default function ApprovalsPage() {
  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  return (
    <div>
      <PageHeader
        title="Approval inbox"
        description="Jede externe KI-Aktion landet hier zur Freigabe. Begründung und Quellen sichtbar — Sie entscheiden."
        actions={<Badge variant="primary">{pending.length} offen</Badge>}
      />

      <div className="mb-3 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-900">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Sicherheits-Eigenschaft: Das KI-Modell hat keine Schreibwerkzeuge.
          Alles, was extern wirkt, durchläuft diese Inbox.
        </span>
      </div>

      <section className="space-y-3 mb-8">
        {pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Alle Freigaben bearbeitet"
            description="Keine offenen Vorschläge. Sobald die KI etwas vorschlägt, erscheint es hier."
          />
        ) : (
          pending.map((a) => <ApprovalCard key={a.id} approval={a} />)
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Heute bereits entschieden
          </h2>
          <Card>
            <CardContent className="divide-y divide-border -my-1 -mx-1">
              {decided.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-3 py-2 text-xs"
                >
                  <Badge
                    variant={
                      a.status === "approved" || a.status === "edited"
                        ? "success"
                        : "neutral"
                    }
                  >
                    {a.status}
                  </Badge>
                  <span className="font-medium truncate flex-1">{a.title}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {a.decidedBy}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
