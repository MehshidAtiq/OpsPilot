"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plug, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

const TABS = [
  { href: "/settings", labelKey: "settings.tabs.general", icon: SlidersHorizontal },
  { href: "/settings/integrations", labelKey: "settings.tabs.integrations", icon: Plug },
] as const;

export function SettingsTabs() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="mb-5 flex flex-wrap gap-1 rounded-md border border-border bg-muted/40 p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active =
          pathname === tab.href ||
          (tab.href !== "/settings" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
