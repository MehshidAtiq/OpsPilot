import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "outline";

const variants: Record<Variant, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-accent text-accent-foreground",
  success: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
  destructive: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  info: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-600/20",
  outline: "bg-transparent text-foreground border border-border",
};

export function Badge({
  className,
  variant = "neutral",
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
