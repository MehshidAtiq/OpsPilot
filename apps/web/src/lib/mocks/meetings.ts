import type { Meeting } from "@/types/models";

export const meetings: Meeting[] = [
  {
    id: "mtg_hofbauer_today",
    title: "Hofbauer & Partner — cloud backup proposal review",
    clientId: "c_hofbauer",
    scheduledAt: "2026-05-04T14:00:00+02:00",
    durationMin: 45,
    attendees: ["tobias@sturm-drang.de", "kanzlei@hofbauer-partner.de"],
    status: "upcoming",
    source: "calendar_mock",
  },
  {
    id: "mtg_internal_today",
    title: "Internal weekly standup",
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
    transcript: `Anna: Thank you for taking the time today. Let's start with the current state: where do you stand on data protection right now?

A. Becker: We have had an external data protection officer since 2024 and DPAs with all main providers, but our internal deletion concept is still in progress. That is exactly where we need support.

Anna: Understood. Which systems are in scope?

A. Becker: SAP, our custom CRM, AWS workloads, plus M365. About 15 data categories.

Anna: I suggest we start with a two-week audit, then create the roadmap. We can be finished by Q3.

A. Becker: Sounds good. Can you send us a proposal by the end of the week?

Anna: Yes, by Friday. From your side, I need the current data flow overview and the list of DPAs.`,
    aiSummary:
      "Discovery call with KraftStrom (regional energy provider, Cologne). Focus: GDPR audit for SAP, custom CRM, AWS workloads, and M365. About 15 data categories. Proposal due Friday, audit starts in 2 weeks, target completion Q3 2026.",
    decisions: [
      "Two-week GDPR audit as the first phase, followed by roadmap.",
      "Scope: SAP, custom CRM, AWS workloads, M365.",
      "Proposal from us by Friday, 2026-05-09.",
    ],
    actionItems: [
      {
        text: "Create GDPR audit proposal for KraftStrom",
        ownerId: "u_anna",
        dueDate: "2026-05-09",
      },
      {
        text: "Request data flow overview and DPA list from KraftStrom",
        ownerId: "u_lena",
        dueDate: "2026-05-06",
      },
      {
        text: "Block audit slot for May/June in Tobias' calendar",
        ownerId: "u_tobias",
        dueDate: "2026-05-05",
      },
    ],
  },
];

export function meetingById(id: string | undefined) {
  return meetings.find((m) => m.id === id);
}
