"use client";

import { useState } from "react";
import { ChevronDown, LogOut, UserRound, UsersRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { USE_API_DATA } from "@/lib/api/config";
import { useSession } from "@/lib/auth/session-provider";
import { useI18n } from "@/lib/i18n/provider";
import { company as mockCompany, currentUser } from "@/lib/mocks";

export function Topbar() {
  const { locale, t } = useI18n();
  const { changeAccount, session, signOut, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const demoDate = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date("2026-05-04T09:00:00+02:00"));

  const activeUser = session?.user;
  const activeCompany = session?.company;
  const companyName = USE_API_DATA
    ? activeCompany?.name ?? "OpsPilot"
    : mockCompany.name;
  const companyIndustry = USE_API_DATA
    ? activeCompany?.industry || "Workspace"
    : mockCompany.industry;
  const userName = activeUser?.name ?? currentUser.name;
  const userEmail = activeUser?.email ?? currentUser.email;
  const userRole = activeUser?.role ?? currentUser.role;
  const roleLabel = userRole === "owner" ? t("role.owner") : t("role.member");
  const accountLoading = USE_API_DATA && status === "loading";

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{companyName}</span>
        <Badge variant="outline" className="hidden sm:inline-flex">
          {companyIndustry}
        </Badge>
        <Badge variant="info" className="hidden md:inline-flex">
          EU · Frankfurt
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex text-xs text-muted-foreground">
          {demoDate}
        </span>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar name={userName} color={currentUser.avatarColor} />
            <span className="hidden sm:flex flex-col leading-tight text-left">
              <span className="text-xs font-medium">
                {accountLoading ? "Loading account..." : userName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {roleLabel}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md border border-border bg-card shadow-lg"
            >
              <div className="border-b border-border px-3 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={userName} color={currentUser.avatarColor} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {accountLoading ? "Loading account..." : userName}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  role="menuitem"
                  disabled={accountLoading}
                  onClick={() => {
                    setMenuOpen(false);
                    void changeAccount();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                >
                  <UsersRound className="h-4 w-4 text-muted-foreground" />
                  Change account
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={accountLoading}
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-muted disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
              <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                <UserRound className="mr-1 inline h-3 w-3" />
                {roleLabel} · {companyName}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
