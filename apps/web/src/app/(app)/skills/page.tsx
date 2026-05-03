import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldOff,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerI18n } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";
import { skills } from "@/lib/mocks";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, TranslationKey> = {
  triage: "skills.category.triage",
  drafting: "skills.category.drafting",
  extraction: "skills.category.extraction",
  tracking: "skills.category.tracking",
  reporting: "skills.category.reporting",
};

export default async function SkillsPage() {
  const { t } = await getServerI18n();
  const active = skills.filter((s) => s.status === "active");
  const comingSoon = skills.filter((s) => s.status === "coming_soon");

  return (
    <div>
      <PageHeader
        title={t("skills.title")}
        description={t("skills.description")}
        actions={
          <Badge variant="outline">
            <Layers className="h-3 w-3" />
            {active.length} {t("common.active").toLowerCase()} ·{" "}
            {comingSoon.length} {t("common.planned")}
          </Badge>
        }
      />

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("skills.active")}
      </h2>
      <div className="grid gap-3 mb-8 md:grid-cols-2">
        {active.map((s) => (
          <SkillCardView key={s.key} skill={s} t={t} />
        ))}
      </div>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("skills.planned")}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {comingSoon.map((s) => (
          <SkillCardView key={s.key} skill={s} dim t={t} />
        ))}
      </div>
    </div>
  );
}

function SkillCardView({
  skill,
  t,
  dim = false,
}: {
  skill: (typeof skills)[number];
  t: (key: TranslationKey) => string;
  dim?: boolean;
}) {
  return (
    <Card className={cn(dim && "opacity-70")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{skill.name}</span>
          <code className="text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground">
            {skill.key}
          </code>
        </CardTitle>
        <div className="flex items-center gap-1 shrink-0">
          {skill.approvalRequired ? (
            <Badge variant="success">
              <ShieldCheck className="h-3 w-3" /> {t("common.approval")}
            </Badge>
          ) : (
            <Badge variant="neutral">
              <ShieldOff className="h-3 w-3" /> {t("common.readOnly")}
            </Badge>
          )}
          {skill.status === "coming_soon" && (
            <Badge variant="warning">{t("common.soon")}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-foreground/80">{skill.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t(CATEGORY_LABEL[skill.category])}</Badge>
          <span className="text-muted-foreground">
            {t("common.trigger")}: {skill.trigger}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-muted/40 border border-border px-2 py-1.5 text-[11px]">
          <code className="font-mono text-foreground/80 truncate">
            {skill.inputs.map((i) => `${i.name}:${i.type}`).join(", ")}
          </code>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <code className="font-mono text-primary truncate">
            {skill.output.map((o) => `${o.name}:${o.type}`).join(", ")}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
