import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ApprovalCard } from "@/components/feature/approvals/approval-card";
import { approvalById } from "@/lib/mocks";

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const approval = approvalById(id);
  if (!approval) notFound();

  return (
    <div>
      <Link
        href="/approvals"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> Zurück zur Inbox
      </Link>
      <ApprovalCard approval={approval} defaultExpanded />
    </div>
  );
}
