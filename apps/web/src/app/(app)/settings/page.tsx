import { Globe2 } from "lucide-react";
import { LanguageSettings } from "@/components/settings/language-settings";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { getServerI18n } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const { t } = await getServerI18n();

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
        actions={
          <Badge variant="outline">
            <Globe2 className="h-3 w-3" />
            DE / EN
          </Badge>
        }
      />
      <SettingsTabs />
      <LanguageSettings />
    </div>
  );
}
