import type { Meeting } from "@/types/models";

export const meetings: Meeting[] = [
  {
    id: "mtg_hofbauer_today",
    title: "Hofbauer & Partner — Angebotsbesprechung Cloud-Backup",
    clientId: "c_hofbauer",
    scheduledAt: "2026-05-04T14:00:00+02:00",
    durationMin: 45,
    attendees: ["tobias@sturm-drang.de", "kanzlei@hofbauer-partner.de"],
    status: "upcoming",
    source: "calendar_mock",
  },
  {
    id: "mtg_internal_today",
    title: "Internes Wochen-Standup",
    scheduledAt: "2026-05-04T16:30:00+02:00",
    durationMin: 30,
    attendees: ["anna@sturm-drang.de", "tobias@sturm-drang.de", "lena@sturm-drang.de"],
    status: "upcoming",
    source: "calendar_mock",
  },
  {
    id: "mtg_kraftstrom_disc",
    title: "KraftStrom Discovery Call",
    clientId: "c_kraftstrom",
    scheduledAt: "2026-05-02T11:00:00+02:00",
    durationMin: 60,
    attendees: ["anna@sturm-drang.de", "a.becker@kraftstrom.de"],
    status: "done",
    source: "calendar_mock",
    transcript: `Anna: Vielen Dank, dass Sie sich Zeit genommen haben. Lassen Sie uns mit dem Status quo beginnen — wo stehen Sie aktuell beim Datenschutz?

A. Becker: Wir haben einen externen DSB seit 2024, AVVs mit allen Hauptdienstleistern, aber unser internes Löschkonzept ist noch in Arbeit. Genau dort brauchen wir Unterstützung.

Anna: Verstanden. Welche Systeme sind im Scope?

A. Becker: SAP, ein eigenes CRM, AWS-Workloads, plus M365. Etwa 15 Datenkategorien.

Anna: Ich schlage vor, wir starten mit einem zweiwöchigen Audit, danach Roadmap. Wir können bis Q3 fertig sein.

A. Becker: Klingt gut. Können Sie uns ein Angebot bis Ende der Woche schicken?

Anna: Ja, bis Freitag. Ich brauche von Ihrer Seite die aktuelle Datenflussübersicht und die Liste der AVVs.`,
    aiSummary:
      "Discovery Call mit KraftStrom (regionaler Energieversorger, Köln). Fokus: DSGVO-Audit für SAP, eigenes CRM, AWS-Workloads und M365. Etwa 15 Datenkategorien. Angebot bis Freitag, Audit-Start in 2 Wochen, Ziel Q3 2026.",
    decisions: [
      "Zweiwöchiger DSGVO-Audit als erste Phase, danach Roadmap.",
      "Scope: SAP, eigenes CRM, AWS-Workloads, M365.",
      "Angebot von uns bis Freitag, 09.05.2026.",
    ],
    actionItems: [
      {
        text: "Angebot DSGVO-Audit für KraftStrom erstellen",
        ownerId: "u_anna",
        dueDate: "2026-05-09",
      },
      {
        text: "Datenflussübersicht und AVV-Liste von KraftStrom anfragen",
        ownerId: "u_lena",
        dueDate: "2026-05-06",
      },
      {
        text: "Audit-Slot für Mai/Juni in Tobias' Kalender blocken",
        ownerId: "u_tobias",
        dueDate: "2026-05-05",
      },
    ],
  },
];

export function meetingById(id: string | undefined) {
  return meetings.find((m) => m.id === id);
}
