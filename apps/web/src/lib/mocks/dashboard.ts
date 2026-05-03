import type { DailyPriority } from "@/types/models";

export const dailyPriorities: DailyPriority[] = [
  {
    rank: 1,
    title: "Antwort an Müller GmbH freigeben (M365-Anfrage)",
    rationale:
      "Hochpriorisierter inbound — passt 1:1 zu Ihrer M365-Migrations-Leistung. 4 Tage unbeantwortet. Entwurf liegt bereit.",
    ctaLabel: "Entwurf prüfen",
    ctaHref: "/approvals/ap_mueller_reply",
    sources: [
      { threadId: "thr_mueller_m365", label: "Müller GmbH · Anfrage" },
      { documentId: "doc_services", label: "Leistungsübersicht 2026" },
    ],
  },
  {
    rank: 2,
    title: "Vorbereitung 14:00 Hofbauer-Termin",
    rationale:
      "Angebotsbesprechung Cloud-Backup. Hofbauer hat eine Detailfrage zu Festpreis-Garantie gestellt — vor dem Termin klären.",
    ctaLabel: "Kontext öffnen",
    ctaHref: "/inbox/thr_hofbauer_backup",
    sources: [
      { threadId: "thr_hofbauer_backup", label: "Hofbauer · Cloud-Backup" },
    ],
  },
  {
    rank: 3,
    title: "Follow-up an Bayrische Werkzeugbau freigeben",
    rationale:
      "Wartungsvertrag-Verlängerung vor 6 Tagen verschickt, keine Reaktion. Vertrag läuft 30.06. aus. Höfliche Erinnerung entworfen.",
    ctaLabel: "Erinnerung prüfen",
    ctaHref: "/approvals/ap_bayr_followup",
    sources: [
      { threadId: "thr_bayr_wartung", label: "Bayrische Werkzeugbau · Wartung" },
    ],
  },
];
