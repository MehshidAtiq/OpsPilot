import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalCard } from "@/components/feature/approvals/approval-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getServerI18n } from "@/lib/i18n/server";
import { approvals } from "@/lib/mocks";

export default async function ApprovalsPage() {
  const { t } = await getServerI18n();
  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  return (
    <div>
      <PageHeader
        title={t("approvals.title")}
        description={t("approvals.description")}
        actions={
          <Badge variant="primary">
            {pending.length} {t("common.open")}
          </Badge>
        }
      />

      <div className="mb-3 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-900">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>{t("approvals.safety")}</span>
      </div>

      <section className="space-y-3 mb-8">
        {pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={t("approvals.emptyTitle")}
            description={t("approvals.emptyDescription")}
          />
        ) : (
          pending.map((a) => <ApprovalCard key={a.id} approval={a} />)
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("approvals.decidedToday")}
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
