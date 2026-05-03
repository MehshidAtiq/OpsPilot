import type { DailyPriority } from "@/types/models";

export const dailyPriorities: DailyPriority[] = [
  {
    rank: 1,
    title: "Approve reply to Mueller GmbH (M365 inquiry)",
    rationale:
      "High-priority inbound request that matches your M365 migration service. Unanswered for 4 days. Draft is ready.",
    ctaLabel: "Review draft",
    ctaHref: "/approvals/ap_mueller_reply",
    sources: [
      { threadId: "thr_mueller_m365", label: "Mueller GmbH · inquiry" },
      { documentId: "doc_services", label: "Service overview 2026" },
    ],
  },
  {
    rank: 2,
    title: "Prepare for 14:00 Hofbauer meeting",
    rationale:
      "Cloud backup proposal review. Hofbauer asked a detailed question about the fixed-price guarantee that should be clarified before the meeting.",
    ctaLabel: "Open context",
    ctaHref: "/inbox/thr_hofbauer_backup",
    sources: [
      { threadId: "thr_hofbauer_backup", label: "Hofbauer · cloud backup" },
    ],
  },
  {
    rank: 3,
    title: "Approve follow-up to Bavarian Tooling",
    rationale:
      "Maintenance renewal proposal was sent 6 days ago with no response. Contract expires on 2026-06-30. Polite reminder drafted.",
    ctaLabel: "Review reminder",
    ctaHref: "/approvals/ap_bayr_followup",
    sources: [
      { threadId: "thr_bayr_wartung", label: "Bavarian Tooling · maintenance" },
    ],
  },
];
