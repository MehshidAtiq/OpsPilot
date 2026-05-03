"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { Language } from "@/lib/i18n/translations";

const LANGUAGE_CHOICES: {
  code: Language;
  labelKey: "common.german" | "common.english";
  descriptionKey:
    | "settings.language.de.description"
    | "settings.language.en.description";
}[] = [
  {
    code: "de",
    labelKey: "common.german",
    descriptionKey: "settings.language.de.description",
  },
  {
    code: "en",
    labelKey: "common.english",
    descriptionKey: "settings.language.en.description",
  },
];

export function LanguageSettings() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { language, setLanguage, t } = useI18n();

  function chooseLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    startTransition(() => router.refresh());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          {t("settings.language.title")}
        </CardTitle>
        <Badge variant="outline">
          {t("settings.language.current")}:{" "}
          {language === "de" ? t("common.german") : t("common.english")}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          {t("settings.language.description")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          {LANGUAGE_CHOICES.map((choice) => {
            const active = language === choice.code;
            return (
              <button
                key={choice.code}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={isPending}
                onClick={() => chooseLanguage(choice.code)}
                className={cn(
                  "flex min-h-24 items-start gap-3 rounded-md border bg-card p-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-accent/60"
                    : "border-border hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-transparent",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {t(choice.labelKey)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {t(choice.descriptionKey)}
                  </span>
                  {active && (
                    <Badge variant="primary" className="mt-2">
                      {t("common.active")}
                    </Badge>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
