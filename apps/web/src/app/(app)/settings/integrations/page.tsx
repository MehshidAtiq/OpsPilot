import { Plug, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { integrations } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getServerI18n } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";

export default async function IntegrationsPage() {
  const { locale, t } = await getServerI18n();
  const connected = integrations.filter((i) => i.status === "mocked");
  const available = integrations.filter((i) => i.status === "disconnected");

  return (
    <div>
      <PageHeader
        title={t("settings.integrations.title")}
        description={t("settings.integrations.description")}
        actions={
          <Badge variant="success">
            <ShieldCheck className="h-3 w-3" /> EU/Frankfurt
          </Badge>
        }
      />
      <SettingsTabs />

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("common.connected")}
      </h2>
      <div className="grid gap-3 mb-8 md:grid-cols-2">
        {connected.map((i) => (
          <IntegrationCardView
            key={i.kind}
            integration={i}
            locale={locale}
            t={t}
          />
        ))}
      </div>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("common.available")}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {available.map((i) => (
          <IntegrationCardView
            key={i.kind}
            integration={i}
            locale={locale}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function IntegrationCardView({
  integration,
  locale,
  t,
}: {
  integration: (typeof integrations)[number];
  locale: string;
  t: (key: TranslationKey) => string;
}) {
  const isConnected = integration.status === "mocked";
  return (
    <Card className={cn(!isConnected && "opacity-80")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          {integration.label}
        </CardTitle>
        {isConnected ? (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" /> {t("common.mocked")}
          </Badge>
        ) : (
          <Badge variant="neutral">
            <XCircle className="h-3 w-3" /> {t("common.disconnected")}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-foreground/80">{integration.description}</p>
        {isConnected ? (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {integration.itemCount} {t("common.items")} ·{" "}
              {t("settings.integrations.since")}{" "}
              {integration.connectedAt &&
                formatDate(integration.connectedAt, locale)}
            </span>
            <Button size="sm" variant="outline">
              {t("common.configure")}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" variant="primary">
              {t("common.connect")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
