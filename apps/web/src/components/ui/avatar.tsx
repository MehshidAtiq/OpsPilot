import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  name,
  color = "bg-slate-200",
  size = 28,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-[10px] font-semibold text-slate-700 shrink-0",
        color,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size / 2.7) }}
      aria-label={name}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
