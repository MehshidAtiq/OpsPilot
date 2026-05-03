"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  Bell,
  CheckCircle2,
  Kanban,
  Sparkles,
  BookOpen,
  ScrollText,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { approvals } from "@/lib/mocks";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translations";

type NavItem = {
  label: TranslationKey;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type NavGroup = { label: TranslationKey; items: NavItem[] };

function buildNav(): NavGroup[] {
  const pendingApprovals = approvals.filter((a) => a.status === "pending").length;
  return [
    {
      label: "nav.today",
      items: [
        { label: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
          label: "nav.approvals",
          href: "/approvals",
          icon: CheckCircle2,
          badge: pendingApprovals,
        },
        { label: "nav.inbox", href: "/inbox", icon: Inbox },
      ],
    },
    {
      label: "nav.work",
      items: [
        { label: "nav.meetings", href: "/meetings", icon: Calendar },
        { label: "nav.tasks", href: "/tasks", icon: Kanban },
        { label: "nav.followUps", href: "/follow-ups", icon: Bell },
      ],
    },
    {
      label: "nav.knowledge",
      items: [
        { label: "nav.knowledgeBase", href: "/knowledge", icon: BookOpen },
        { label: "nav.skills", href: "/skills", icon: Sparkles },
      ],
    },
    {
      label: "nav.trust",
      items: [
        { label: "nav.auditLog", href: "/audit", icon: ScrollText },
        { label: "nav.settings", href: "/settings", icon: Settings },
      ],
    },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const groups = buildNav();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">OpsPilot</span>
          <span className="text-[10px] text-muted-foreground">
            {t("app.tagline")}
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.label)}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {t(item.label)}
                      </span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
        {t("app.footer")}
      </div>
    </aside>
  );
}
