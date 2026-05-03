import { FileText, MessageSquare, Calendar } from "lucide-react";
import type { ApprovalSource } from "@/types/models";
import { cn } from "@/lib/utils";

export function SourceChip({
  source,
  className,
}: {
  source: ApprovalSource;
  className?: string;
}) {
  const Icon = source.documentId
    ? FileText
    : source.threadId
      ? MessageSquare
      : Calendar;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-accent text-accent-foreground px-1.5 py-0.5 text-[11px] font-medium",
        "ring-1 ring-inset ring-blue-200 hover:bg-blue-100 cursor-pointer transition-colors",
        className,
      )}
      title={source.label}
    >
      <Icon className="h-3 w-3" />
      <span className="truncate max-w-[180px]">{source.label}</span>
    </span>
  );
}
