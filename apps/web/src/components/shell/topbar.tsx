"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";
import { company, currentUser } from "@/lib/mocks";

export function Topbar() {
  const { locale, t } = useI18n();
  const demoDate = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date("2026-05-04T09:00:00+02:00"));

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{company.name}</span>
        <Badge variant="outline" className="hidden sm:inline-flex">
          {company.industry}
        </Badge>
        <Badge variant="info" className="hidden md:inline-flex">
          EU · Frankfurt
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex text-xs text-muted-foreground">
          {demoDate}
        </span>
        <span className="flex items-center gap-2">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-medium">{currentUser.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {currentUser.role === "owner" ? t("role.owner") : t("role.member")}
            </span>
          </span>
        </span>
      </div>
    </header>
  );
}
