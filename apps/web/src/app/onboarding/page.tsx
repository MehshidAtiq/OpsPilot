"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Building2,
  Plug,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USE_API_DATA } from "@/lib/api/config";
import { submitOnboarding } from "@/lib/api/onboarding";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "company", label: "Unternehmen", icon: Building2 },
  { key: "integrations", label: "Integrationen", icon: Plug },
  { key: "skills", label: "Skills", icon: Sparkles },
  { key: "done", label: "Bereit", icon: CheckCircle2 },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step = STEPS[stepIdx].key;

  async function finishOnboarding() {
    if (!USE_API_DATA) {
      router.push("/dashboard");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await submitOnboarding({
        company_name: "Sturm & Drang Consulting GmbH",
        industry: "IT consulting",
        services: [
          "Cloud migration",
          "Microsoft 365 & SharePoint",
          "IT infrastructure",
          "GDPR compliance audits",
        ],
        target_clients: "Mid-sized companies, 50-500 employees, DACH",
        primary_language: "en",
        default_formality: "sie",
        tone_summary: "Polite, factual, no marketing fluff.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="font-semibold">OpsPilot</span>
        <Badge variant="outline" className="ml-2">
          Setup
        </Badge>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <ol className="mb-8 flex items-center gap-2 text-xs">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === stepIdx;
            const done = i < stepIdx;
            return (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border",
                    active && "border-primary bg-primary text-primary-foreground",
                    done && "border-success bg-success/10 text-success",
                    !active && !done && "border-border bg-card text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span
                  className={cn(
                    "font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </li>
            );
          })}
        </ol>

        <Card>
          <CardContent className="space-y-4 py-6">
            {step === "company" && <CompanyStep />}
            {step === "integrations" && <IntegrationsStep />}
            {step === "skills" && <SkillsStep />}
            {step === "done" && <DoneStep />}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="ghost"
                disabled={stepIdx === 0}
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              >
                Zurück
              </Button>
              {step !== "done" ? (
                <Button
                  variant="primary"
                  onClick={() => setStepIdx((i) => i + 1)}
                >
                  Weiter <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="primary" onClick={finishOnboarding} disabled={saving}>
                  {saving ? "Saving..." : "Zum Dashboard"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-[11px] text-center text-muted-foreground">
          EU/Frankfurt · Daten verlassen die EU nicht · Approval-gated
        </p>
      </main>
    </div>
  );
}

function CompanyStep() {
  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">Willkommen bei OpsPilot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Erzähl uns kurz von deinem Unternehmen — das hilft der KI, passenden
          Ton und Kontext zu wählen.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Firmenname</label>
          <Input defaultValue="Sturm & Drang Consulting GmbH" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Branche</label>
          <Input defaultValue="IT-Beratung" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Sprache</label>
          <select className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm">
            <option>Deutsch (Sie)</option>
            <option>Deutsch (Du)</option>
            <option>English</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Teamgröße</label>
          <Input defaultValue="12" />
        </div>
      </div>
    </>
  );
}

function IntegrationsStep() {
  const services = [
    { label: "Gmail", desc: "E-Mail-Posteingang" },
    { label: "Google Calendar", desc: "Termine" },
    { label: "Google Drive", desc: "Wissensdatenbank" },
    { label: "Slack", desc: "Benachrichtigungen", optional: true },
  ];
  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">Datenquellen verbinden</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alle Verbindungen sind <span className="font-medium">read-only</span>{" "}
          — die KI kann nichts ohne deine Freigabe versenden.
        </p>
      </div>
      <div className="space-y-2">
        {services.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5"
          >
            <Plug className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-[11px] text-muted-foreground">{s.desc}</div>
            </div>
            {s.optional && <Badge variant="neutral">optional</Badge>}
            <Button size="sm" variant="outline">
              Verbinden
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsStep() {
  const skills = [
    { name: "daily_briefing", desc: "Morgens 3 Top-Prioritäten" },
    { name: "email_reply", desc: "Antworten entwerfen (Approval erforderlich)" },
    { name: "meeting_summary", desc: "Transkripte → Zusammenfassung + Tasks" },
    { name: "task_extraction", desc: "Aufgaben aus E-Mails erkennen" },
    { name: "follow_up_detector", desc: "Stille Threads erkennen" },
  ];
  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">Skills aktivieren</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Jeder Skill ist ein typisierter Workflow. Du kannst sie einzeln
          ein- und ausschalten.
        </p>
      </div>
      <div className="space-y-2">
        {skills.map((s) => (
          <label
            key={s.name}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 cursor-pointer hover:bg-muted/40"
          >
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <div className="flex-1">
              <code className="text-xs font-mono">{s.name}</code>
              <div className="text-[11px] text-muted-foreground">{s.desc}</div>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </label>
        ))}
      </div>
    </>
  );
}

function DoneStep() {
  return (
    <div className="py-6 text-center space-y-3">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <h1 className="text-lg font-semibold">Alles bereit</h1>
      <p className="text-sm text-muted-foreground">
        Die KI startet jetzt mit dem ersten daily_briefing. Du findest es im
        Dashboard.
      </p>
    </div>
  );
}
