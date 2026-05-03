"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Building2,
  Plug,
  Sparkles,
  CheckCircle2,
  Languages,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/api/auth";
import { USE_API_DATA } from "@/lib/api/config";
import { submitOnboarding } from "@/lib/api/onboarding";
import { useI18n } from "@/lib/i18n/provider";
import type { Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

type StepKey = "language" | "company" | "integrations" | "skills" | "done";
type CommunicationChoice = "de_sie" | "de_du" | "en";

const STEP_ICONS = {
  language: Languages,
  company: Building2,
  integrations: Plug,
  skills: Sparkles,
  done: CheckCircle2,
} satisfies Record<StepKey, ComponentType<{ className?: string }>>;

const STEP_KEYS: StepKey[] = [
  "language",
  "company",
  "integrations",
  "skills",
  "done",
];

const COPY = {
  en: {
    steps: {
      language: "Language",
      company: "Company",
      integrations: "Integrations",
      skills: "Skills",
      done: "Ready",
    },
    setup: "Setup",
    languageTitle: "Choose your app language",
    languageDescription:
      "This controls the setup screens and the rest of the app. You can change it later in Settings.",
    english: "English",
    englishDescription: "Show onboarding and OpsPilot in English.",
    german: "Deutsch",
    germanDescription: "Onboarding und OpsPilot auf Deutsch anzeigen.",
    companyTitle: "Welcome to OpsPilot",
    companyDescription:
      "Tell us a little about your company so OpsPilot can use the right tone and context.",
    companyName: "Company name",
    companyPlaceholder: "Sturm & Drang Consulting GmbH",
    industry: "Industry",
    industryPlaceholder: "IT consulting",
    communicationLanguage: "Client communication",
    germanFormal: "German (formal Sie)",
    germanInformal: "German (informal Du)",
    englishCommunication: "English",
    teamSize: "Team size",
    servicesTitle: "Connect data sources",
    servicesDescription:
      "All integrations are read-only for the model. Nothing is sent or changed without your approval.",
    optional: "optional",
    connect: "Connect",
    services: [
      { label: "Gmail", desc: "Email inbox" },
      { label: "Google Calendar", desc: "Meetings" },
      { label: "Google Drive", desc: "Knowledge base" },
      { label: "Slack", desc: "Notifications", optional: true },
    ],
    skillsTitle: "Enable skills",
    skillsDescription:
      "Every skill is a typed workflow. You can switch them on or off later.",
    skills: [
      { name: "daily_briefing", desc: "Three morning priorities" },
      { name: "email_reply", desc: "Draft replies with required approval" },
      { name: "meeting_summary", desc: "Transcript to summary and tasks" },
      { name: "task_extraction", desc: "Find tasks in emails" },
      { name: "follow_up_detector", desc: "Detect quiet threads" },
    ],
    doneTitle: "You are ready",
    doneDescription:
      "OpsPilot will start with your first daily briefing. You will find it on the dashboard.",
    back: "Back",
    next: "Next",
    saving: "Saving...",
    dashboard: "Go to dashboard",
    requiredCompany: "Add a company name to continue.",
    saveError: "Could not save onboarding",
    footer: "EU/Frankfurt · Data stays in the EU · Approval-gated",
  },
  de: {
    steps: {
      language: "Sprache",
      company: "Unternehmen",
      integrations: "Integrationen",
      skills: "Skills",
      done: "Bereit",
    },
    setup: "Setup",
    languageTitle: "Wähle deine App-Sprache",
    languageDescription:
      "Diese Sprache gilt für das Setup und die App. Du kannst sie später in den Einstellungen ändern.",
    english: "English",
    englishDescription: "Show onboarding and OpsPilot in English.",
    german: "Deutsch",
    germanDescription: "Onboarding und OpsPilot auf Deutsch anzeigen.",
    companyTitle: "Willkommen bei OpsPilot",
    companyDescription:
      "Erzähl uns kurz von deinem Unternehmen, damit OpsPilot Ton und Kontext passend wählen kann.",
    companyName: "Firmenname",
    companyPlaceholder: "Sturm & Drang Consulting GmbH",
    industry: "Branche",
    industryPlaceholder: "IT-Beratung",
    communicationLanguage: "Kundensprache",
    germanFormal: "Deutsch (Sie)",
    germanInformal: "Deutsch (Du)",
    englishCommunication: "English",
    teamSize: "Teamgröße",
    servicesTitle: "Datenquellen verbinden",
    servicesDescription:
      "Alle Integrationen sind für das Modell read-only. Ohne deine Freigabe wird nichts gesendet oder geändert.",
    optional: "optional",
    connect: "Verbinden",
    services: [
      { label: "Gmail", desc: "E-Mail-Posteingang" },
      { label: "Google Calendar", desc: "Termine" },
      { label: "Google Drive", desc: "Wissensdatenbank" },
      { label: "Slack", desc: "Benachrichtigungen", optional: true },
    ],
    skillsTitle: "Skills aktivieren",
    skillsDescription:
      "Jeder Skill ist ein typisierter Workflow. Du kannst sie später einzeln ein- oder ausschalten.",
    skills: [
      { name: "daily_briefing", desc: "Morgens drei Top-Prioritäten" },
      { name: "email_reply", desc: "Antworten mit Freigabe entwerfen" },
      { name: "meeting_summary", desc: "Transkript zu Zusammenfassung und Tasks" },
      { name: "task_extraction", desc: "Aufgaben in E-Mails erkennen" },
      { name: "follow_up_detector", desc: "Stille Threads erkennen" },
    ],
    doneTitle: "Alles bereit",
    doneDescription:
      "OpsPilot startet mit deinem ersten Daily Briefing. Du findest es im Dashboard.",
    back: "Zurück",
    next: "Weiter",
    saving: "Speichern...",
    dashboard: "Zum Dashboard",
    requiredCompany: "Gib einen Firmennamen ein, um fortzufahren.",
    saveError: "Onboarding konnte nicht gespeichert werden",
    footer: "EU/Frankfurt · Daten bleiben in der EU · Approval-gated",
  },
} as const;

function communicationForLanguage(language: Language): CommunicationChoice {
  return language === "de" ? "de_sie" : "en";
}

function communicationToSettings(choice: CommunicationChoice) {
  if (choice === "en") {
    return { primaryLanguage: "en", formality: "sie" };
  }

  return {
    primaryLanguage: "de",
    formality: choice === "de_du" ? "du" : "sie",
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage } = useI18n();
  const copy = COPY[language];
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [communicationChoice, setCommunicationChoice] =
    useState<CommunicationChoice>(communicationForLanguage(language));

  const step = STEP_KEYS[stepIdx];
  const communicationSettings = useMemo(
    () => communicationToSettings(communicationChoice),
    [communicationChoice],
  );

  useEffect(() => {
    if (!USE_API_DATA) return;

    let cancelled = false;
    getSession()
      .then((session) => {
        if (cancelled) return;
        setCompanyName((current) => current || session.company.name);
        setIndustry((current) => current || session.company.industry);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  function chooseLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setCommunicationChoice(communicationForLanguage(nextLanguage));
    setError(null);
  }

  function goNext() {
    if (step === "company" && !companyName.trim()) {
      setError(copy.requiredCompany);
      return;
    }

    setError(null);
    setStepIdx((index) => Math.min(STEP_KEYS.length - 1, index + 1));
  }

  async function finishOnboarding() {
    if (!USE_API_DATA) {
      router.push("/dashboard");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await submitOnboarding({
        company_name: companyName.trim(),
        industry: industry.trim(),
        services: [
          "Cloud migration",
          "Microsoft 365 & SharePoint",
          "IT infrastructure",
          "GDPR compliance audits",
        ],
        target_clients: "Mid-sized companies, 50-500 employees, DACH",
        primary_language: communicationSettings.primaryLanguage,
        default_formality: communicationSettings.formality,
        tone_summary:
          communicationSettings.primaryLanguage === "de"
            ? "Höflich, sachlich, kein Marketing-Fluff."
            : "Polite, factual, no marketing fluff.",
        settings: {
          app_language: language,
          team_size: teamSize.trim(),
        },
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveError);
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
          {copy.setup}
        </Badge>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <ol className="mb-8 flex flex-wrap items-center gap-2 text-xs">
          {STEP_KEYS.map((stepKey, index) => {
            const Icon = STEP_ICONS[stepKey];
            const active = index === stepIdx;
            const done = index < stepIdx;
            return (
              <li key={stepKey} className="flex items-center gap-2">
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
                  {copy.steps[stepKey]}
                </span>
                {index < STEP_KEYS.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </li>
            );
          })}
        </ol>

        <Card>
          <CardContent className="space-y-4 py-6">
            {step === "language" && (
              <LanguageStep language={language} onChoose={chooseLanguage} />
            )}
            {step === "company" && (
              <CompanyStep
                companyName={companyName}
                industry={industry}
                teamSize={teamSize}
                communicationChoice={communicationChoice}
                onCompanyNameChange={setCompanyName}
                onIndustryChange={setIndustry}
                onTeamSizeChange={setTeamSize}
                onCommunicationChange={setCommunicationChoice}
                copy={copy}
              />
            )}
            {step === "integrations" && <IntegrationsStep copy={copy} />}
            {step === "skills" && <SkillsStep copy={copy} />}
            {step === "done" && <DoneStep copy={copy} />}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="ghost"
                disabled={stepIdx === 0}
                onClick={() => {
                  setError(null);
                  setStepIdx((index) => Math.max(0, index - 1));
                }}
              >
                {copy.back}
              </Button>
              {step !== "done" ? (
                <Button variant="primary" onClick={goNext}>
                  {copy.next} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="primary" onClick={finishOnboarding} disabled={saving}>
                  {saving ? copy.saving : copy.dashboard}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-[11px] text-center text-muted-foreground">
          {copy.footer}
        </p>
      </main>
    </div>
  );
}

function LanguageStep({
  language,
  onChoose,
}: {
  language: Language;
  onChoose: (language: Language) => void;
}) {
  const copy = COPY[language];
  const choices = [
    {
      code: "en" as const,
      label: copy.english,
      description: copy.englishDescription,
    },
    {
      code: "de" as const,
      label: copy.german,
      description: copy.germanDescription,
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">
          Choose your app language / Wähle deine App-Sprache
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the language for setup and OpsPilot. You can change it later in
          Settings. / Wähle die Sprache für Setup und OpsPilot. Du kannst sie
          später in den Einstellungen ändern.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
        {choices.map((choice) => {
          const active = language === choice.code;
          return (
            <button
              key={choice.code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChoose(choice.code)}
              className={cn(
                "min-h-28 rounded-md border bg-card p-3 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-accent/60"
                  : "border-border hover:bg-muted/60",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold">
                    {choice.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {choice.description}
                  </span>
                </span>
                {active && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function CompanyStep({
  companyName,
  industry,
  teamSize,
  communicationChoice,
  onCompanyNameChange,
  onIndustryChange,
  onTeamSizeChange,
  onCommunicationChange,
  copy,
}: {
  companyName: string;
  industry: string;
  teamSize: string;
  communicationChoice: CommunicationChoice;
  onCompanyNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onTeamSizeChange: (value: string) => void;
  onCommunicationChange: (value: CommunicationChoice) => void;
  copy: (typeof COPY)[Language];
}) {
  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">{copy.companyTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {copy.companyDescription}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">
            {copy.companyName}
          </label>
          <Input
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            placeholder={copy.companyPlaceholder}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">
            {copy.industry}
          </label>
          <Input
            value={industry}
            onChange={(event) => onIndustryChange(event.target.value)}
            placeholder={copy.industryPlaceholder}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">
            {copy.communicationLanguage}
          </label>
          <select
            value={communicationChoice}
            onChange={(event) =>
              onCommunicationChange(event.target.value as CommunicationChoice)
            }
            className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm"
          >
            <option value="en">{copy.englishCommunication}</option>
            <option value="de_sie">{copy.germanFormal}</option>
            <option value="de_du">{copy.germanInformal}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">
            {copy.teamSize}
          </label>
          <Input
            value={teamSize}
            onChange={(event) => onTeamSizeChange(event.target.value)}
            inputMode="numeric"
            placeholder="12"
          />
        </div>
      </div>
    </>
  );
}

function IntegrationsStep({ copy }: { copy: (typeof COPY)[Language] }) {
  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">{copy.servicesTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {copy.servicesDescription}
        </p>
      </div>
      <div className="space-y-2">
        {copy.services.map((service) => (
          <div
            key={service.label}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5"
          >
            <Plug className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">{service.label}</div>
              <div className="text-[11px] text-muted-foreground">
                {service.desc}
              </div>
            </div>
            {"optional" in service && service.optional && (
              <Badge variant="neutral">{copy.optional}</Badge>
            )}
            <Button size="sm" variant="outline">
              {copy.connect}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsStep({ copy }: { copy: (typeof COPY)[Language] }) {
  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">{copy.skillsTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {copy.skillsDescription}
        </p>
      </div>
      <div className="space-y-2">
        {copy.skills.map((skill) => (
          <label
            key={skill.name}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 cursor-pointer hover:bg-muted/40"
          >
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <div className="flex-1">
              <code className="text-xs font-mono">{skill.name}</code>
              <div className="text-[11px] text-muted-foreground">
                {skill.desc}
              </div>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </label>
        ))}
      </div>
    </>
  );
}

function DoneStep({ copy }: { copy: (typeof COPY)[Language] }) {
  return (
    <div className="py-6 text-center space-y-3">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <h1 className="text-lg font-semibold">{copy.doneTitle}</h1>
      <p className="text-sm text-muted-foreground">{copy.doneDescription}</p>
    </div>
  );
}
