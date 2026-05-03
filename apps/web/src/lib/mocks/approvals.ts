import type { Approval } from "@/types/models";

export const approvals: Approval[] = [
  {
    id: "ap_mueller_reply",
    actionType: "email_send",
    title: "Reply to Mueller GmbH — M365 inquiry",
    rationale:
      "Inbound cloud migration inquiry that matches your core service. Unanswered for 4 days, high priority. Draft uses the 2026 service overview and the cloud migration template.",
    sources: [
      { documentId: "doc_services", documentTitle: "Service overview 2026.pdf", chunkIndex: 3, label: "Service overview 2026 · M365" },
      { documentId: "doc_proposal_tpl", documentTitle: "Cloud migration proposal template.docx", chunkIndex: 1, label: "Proposal template · phase model" },
      { threadId: "thr_mueller_m365", label: "Thread: Mueller GmbH M365" },
    ],
    payload: {
      to: ["m.heller@mueller-gmbh.de"],
      subject: "Re: Inquiry: migration to Microsoft 365",
      body: `Dear Mr. Heller,

Thank you for your inquiry and the additional details about your current environment. That helps us a lot.

A migration of the size you outlined (~180 workstations, Exchange 2019, ~4 TB file server, critical-infrastructure requirements) is something we typically cover in four phases:

1. Assessment and target architecture (2-3 weeks)
2. Pilot migration with one selected department (3 weeks)
3. Wave migration across all sites (8-10 weeks)
4. Hypercare and training (4 weeks)

I suggest a 60-minute discovery call so we can prioritize together and I can send you an effort estimate with a range by the end of next week. Would Thursday, 2026-05-08 at 10:00 or Friday, 2026-05-09 at 14:00 work for you?

Best regards
Anna Sturm
Sturm & Drang Consulting GmbH`,
      language: "en",
      formality: "sie",
    },
    status: "pending",
    skillKey: "email_reply",
    skillRunId: "sr_001",
    clientId: "c_mueller",
    createdAt: "2026-05-04T08:55:00+02:00",
  },
  {
    id: "ap_bayr_followup",
    actionType: "follow_up_send",
    title: "Follow-up to Bavarian Tooling — no response for 6 days",
    rationale:
      "Outbound message from 2026-04-28 about the maintenance contract renewal has not been answered. Contract expires on 2026-06-30, so a polite reminder is recommended.",
    sources: [
      { threadId: "thr_bayr_wartung", label: "Thread: Bavarian Tooling maintenance" },
    ],
    payload: {
      to: ["it@bayr-werkzeug.de"],
      subject: "Reminder: maintenance contract renewal",
      body: `Dear Mr. Brunner,

I wanted to quickly check whether my email from 2026-04-28 about renewing your maintenance contract reached you. Since the contract expires on 2026-06-30, I would like to find a short appointment within the next two weeks so we do not leave a gap.

If now is not a good time, no problem. Just let me know when it works better for you.

Best regards
Tobias Reinhardt`,
      language: "en",
      formality: "sie",
    },
    status: "pending",
    skillKey: "follow_up_detector",
    skillRunId: "sr_002",
    clientId: "c_bayr",
    createdAt: "2026-05-04T08:00:00+02:00",
  },
  {
    id: "ap_mueller_task",
    actionType: "task_create",
    title: "Task: prepare Mueller GmbH discovery call",
    rationale:
      "Extracted from the Mueller thread. The proposed discovery call needs briefing material before 2026-05-09.",
    sources: [
      { threadId: "thr_mueller_m365", label: "Thread: Mueller GmbH M365" },
    ],
    payload: {
      title: "Prepare Mueller GmbH discovery call",
      description:
        "Create briefing: 180 employees, critical-infrastructure supplier, Exchange 2019, 4 TB file server. Bring phase plan.",
      ownerName: "Tobias Reinhardt",
      dueDate: "2026-05-09",
      priority: "high",
    },
    status: "pending",
    skillKey: "task_extraction",
    skillRunId: "sr_001",
    clientId: "c_mueller",
    createdAt: "2026-05-04T08:55:00+02:00",
  },
  {
    id: "ap_northcloud_reply",
    actionType: "email_send",
    title: "Reply to NorthCloud — joint proposal Heidelberg",
    rationale:
      "Inbound from UK partner, English/informal. Pricing input requested by Wednesday. Draft confirms timeline and asks for the one-pager.",
    sources: [
      { documentId: "doc_q3retro", documentTitle: "Q3 retro Sturm & Drang.md", chunkIndex: 2, label: "Q3 retro · pricing" },
      { threadId: "thr_northcloud_joint", label: "Thread: NorthCloud joint" },
    ],
    payload: {
      to: ["tom@northcloud.io"],
      subject: "Re: Joint proposal — Heidelberg Logistics",
      body: `Hey Tom,

thanks — sounds like a good fit. I'll get pricing inputs back to you by Tuesday EOB so you have time before Wednesday's send.

Could you share the one-pager draft now? I'd like to align on positioning before I plug in numbers.

Cheers
Anna`,
      language: "en",
      formality: "du",
    },
    status: "pending",
    skillKey: "email_reply",
    skillRunId: "sr_003",
    clientId: "c_northcloud",
    createdAt: "2026-05-04T08:30:00+02:00",
  },

  // Decided / historical for the audit and "recent activity"
  {
    id: "ap_kraftstrom_dsgvo",
    actionType: "email_send",
    title: "Reply to KraftStrom — GDPR question about AWS",
    rationale: "Reply with reference to the internal GDPR compliance checklist.",
    sources: [
      { documentId: "doc_dsgvo", documentTitle: "GDPR compliance checklist.md", chunkIndex: 4, label: "GDPR checklist · hosting region" },
    ],
    payload: {
      to: ["a.becker@kraftstrom.de"],
      subject: "Re: Question about GDPR compliance on AWS",
      body: "Hello Ms. Becker,\n\nFor AWS, the EU region must be explicitly set per service; there is no automatic switch. Our checklist (section 4.2) lists the default regions by service. I can gladly send you the document...",
      language: "en",
      formality: "sie",
    },
    status: "edited",
    skillKey: "email_reply",
    skillRunId: "sr_004",
    clientId: "c_kraftstrom",
    createdAt: "2026-05-04T07:30:00+02:00",
    decidedAt: "2026-05-04T07:42:00+02:00",
    decidedBy: "Anna Sturm",
  },
  {
    id: "ap_mueller_onboarding",
    actionType: "task_create",
    title: "Task: send onboarding document to Mueller GmbH",
    rationale: "Extracted from the Mueller thread.",
    sources: [{ threadId: "thr_mueller_m365", label: "Thread: Mueller GmbH" }],
    payload: {
      title: "Send onboarding document to Mueller GmbH",
      ownerName: "Lena Hoffmann",
      dueDate: "2026-05-06",
      priority: "med",
    },
    status: "approved",
    skillKey: "task_extraction",
    skillRunId: "sr_001",
    clientId: "c_mueller",
    createdAt: "2026-05-04T08:55:00+02:00",
    decidedAt: "2026-05-04T09:01:00+02:00",
    decidedBy: "Anna Sturm",
  },
];

export function approvalById(id: string | undefined) {
  return approvals.find((a) => a.id === id);
}
