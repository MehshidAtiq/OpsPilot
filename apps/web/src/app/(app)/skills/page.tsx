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
import { skills } from "@/lib/mocks";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  triage: "Triage",
  drafting: "Drafting",
  extraction: "Extraction",
  tracking: "Tracking",
  reporting: "Reporting",
};

export default function SkillsPage() {
  const active = skills.filter((s) => s.status === "active");
  const comingSoon = skills.filter((s) => s.status === "coming_soon");

  return (
    <div>
      <PageHeader
        title="Skills library"
        description="Jeder Workflow ist ein typed Skill mit Trigger, Inputs, Output und Approval-Regel — keine Magie."
        actions={
          <Badge variant="outline">
            <Layers className="h-3 w-3" />
            {active.length} aktiv · {comingSoon.length} geplant
          </Badge>
        }
      />

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Aktiv
      </h2>
      <div className="grid gap-3 mb-8 md:grid-cols-2">
        {active.map((s) => (
          <SkillCardView key={s.key} skill={s} />
        ))}
      </div>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Geplant
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {comingSoon.map((s) => (
          <SkillCardView key={s.key} skill={s} dim />
        ))}
      </div>
    </div>
  );
}

function SkillCardView({
  skill,
  dim = false,
}: {
  skill: (typeof skills)[number];
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
              <ShieldCheck className="h-3 w-3" /> approval
            </Badge>
          ) : (
            <Badge variant="neutral">
              <ShieldOff className="h-3 w-3" /> read-only
            </Badge>
          )}
          {skill.status === "coming_soon" && <Badge variant="warning">soon</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-foreground/80">{skill.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{CATEGORY_LABEL[skill.category]}</Badge>
          <span className="text-muted-foreground">Trigger: {skill.trigger}</span>
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
