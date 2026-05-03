import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ApprovalCard } from "@/components/feature/approvals/approval-card";
import { getServerI18n } from "@/lib/i18n/server";
import { approvalById } from "@/lib/mocks";

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = await getServerI18n();
  const { id } = await params;
  const approval = approvalById(id);
  if (!approval) notFound();

  return (
    <div>
      <Link
        href="/approvals"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> {t("approvals.back")}
      </Link>
      <ApprovalCard approval={approval} defaultExpanded />
    </div>
  );
}
