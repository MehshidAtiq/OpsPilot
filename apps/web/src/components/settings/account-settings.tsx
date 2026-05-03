"use client";

import { Building2, LogOut, UserRound, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USE_API_DATA } from "@/lib/api/config";
import { useSession } from "@/lib/auth/session-provider";
import { useI18n } from "@/lib/i18n/provider";
import { company as mockCompany, currentUser } from "@/lib/mocks";

export function AccountSettings() {
  const { t } = useI18n();
  const { changeAccount, session, signOut, status } = useSession();
  const loading = USE_API_DATA && status === "loading";
  const user = session?.user;
  const company = session?.company;
  const userName = user?.name ?? currentUser.name;
  const userEmail = user?.email ?? currentUser.email;
  const role = user?.role ?? currentUser.role;
  const companyName = USE_API_DATA ? company?.name ?? "OpsPilot" : mockCompany.name;

  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          {t("settings.account.title")}
        </CardTitle>
        <Badge variant={USE_API_DATA ? "success" : "outline"}>
          {USE_API_DATA
            ? t("settings.account.database")
            : t("settings.account.mock")}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
              {t("settings.account.signedInAs")}
            </div>
            <div className="truncate text-sm font-medium">
              {loading ? t("settings.account.loading") : userName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {userEmail}
            </div>
            <Badge variant="outline" className="mt-2">
              {role === "owner" ? t("role.owner") : t("role.member")}
            </Badge>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {t("settings.account.workspace")}
            </div>
            <div className="truncate text-sm font-medium">{companyName}</div>
            <div className="truncate text-xs text-muted-foreground">
              {company?.industry || mockCompany.industry}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => void changeAccount()}
          >
            <UsersRound className="h-4 w-4" />
            {t("settings.account.changeAccount")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => void signOut()}
          >
            <LogOut className="h-4 w-4" />
            {t("settings.account.logout")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
