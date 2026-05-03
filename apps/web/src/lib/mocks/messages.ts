import type { Message, Thread } from "@/types/models";

// Anchor: Monday 2026-05-04 09:30 CET. All times are literal ISO strings
// for stable demo recordings.

export const messages: Message[] = [
  // --- Mueller GmbH thread (M365 migration inquiry) ---
  {
    id: "msg_mueller_1",
    threadId: "thr_mueller_m365",
    channel: "email",
    direction: "inbound",
    clientId: "c_mueller",
    projectId: "p_mueller_m365",
    subject: "Inquiry: migration to Microsoft 365",
    body: `Dear Ms. Sturm,

We are currently evaluating a migration of our Office environment (around 180 workstations) to Microsoft 365. We are especially interested in:

• SharePoint Online instead of file servers
• Teams for the workshop locations
• Secure mobile device management

Could you offer us an initial conversation and a rough effort estimate? We are targeting Q3 2026.

Best regards
M. Heller
Head of IT, Mueller GmbH`,
    snippet:
      "We are evaluating a migration of our Office environment (around 180 workstations)...",
    sender: "m.heller@mueller-gmbh.de",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-04-30T08:42:00+02:00",
    isRead: false,
    urgency: "high",
    language: "en",
  },
  {
    id: "msg_mueller_2",
    threadId: "thr_mueller_m365",
    channel: "email",
    direction: "inbound",
    clientId: "c_mueller",
    projectId: "p_mueller_m365",
    subject: "Re: Inquiry: migration to Microsoft 365",
    body: `Dear Ms. Sturm,

One addition, in case it helps with the effort estimate: we currently use Exchange 2019 on-prem and a classic file server (~4 TB). Data protection is an important topic for us because we are a critical-infrastructure supplier.

Best regards
M. Heller`,
    snippet:
      "One addition: we currently use Exchange 2019 on-prem and a classic file server (~4 TB).",
    sender: "m.heller@mueller-gmbh.de",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-05-03T17:11:00+02:00",
    isRead: false,
    urgency: "high",
    language: "en",
  },

  // --- Hofbauer & Partner thread (Cloud-Backup proposal) ---
  {
    id: "msg_hofbauer_1",
    threadId: "thr_hofbauer_backup",
    channel: "email",
    direction: "outbound",
    clientId: "c_hofbauer",
    projectId: "p_hofbauer_backup",
    subject: "Cloud backup proposal for Hofbauer & Partner",
    body: `Dear Mr. Hofbauer,

As discussed, attached is our proposal for the GDPR-compliant cloud backup solution. We based it on the "EU-only hosting" option because that was central for you in our call.

I would be happy to walk you through the proposal on Monday.

Best regards
Tobias Reinhardt`,
    snippet:
      "As discussed, attached is our proposal for the GDPR-compliant cloud backup solution...",
    sender: "tobias@sturm-drang.de",
    recipients: ["kanzlei@hofbauer-partner.de"],
    receivedAt: "2026-04-29T14:30:00+02:00",
    isRead: true,
    urgency: "normal",
    language: "en",
  },
  {
    id: "msg_hofbauer_2",
    threadId: "thr_hofbauer_backup",
    channel: "email",
    direction: "inbound",
    clientId: "c_hofbauer",
    projectId: "p_hofbauer_backup",
    subject: "Re: Cloud backup proposal for Hofbauer & Partner",
    body: `Dear Mr. Reinhardt,

Thank you for the proposal. Can we make the appointment Monday at 14:00? One quick question in advance: is the stated fixed price also guaranteed if our data volume grows (~200 GB/year)?

Best regards
J. Hofbauer`,
    snippet:
      "Can we make the appointment Monday at 14:00? One quick question in advance...",
    sender: "kanzlei@hofbauer-partner.de",
    recipients: ["tobias@sturm-drang.de"],
    receivedAt: "2026-05-02T10:18:00+02:00",
    isRead: false,
    urgency: "normal",
    language: "en",
  },

  // --- Bavarian Tooling (outbound, awaiting reply) ---
  {
    id: "msg_bayr_1",
    threadId: "thr_bayr_wartung",
    channel: "email",
    direction: "outbound",
    clientId: "c_bayr",
    projectId: "p_bayr_wartung",
    subject: "Maintenance contract renewal — proposal",
    body: `Dear Mr. Brunner,

Your current maintenance contract expires on 2026-06-30. We would like to discuss a renewal with you, including slightly adjusted terms if your needs have changed.

Would you have 30 minutes next week for a short conversation?

Best regards
Tobias Reinhardt`,
    snippet:
      "Your current maintenance contract expires on 2026-06-30. We would like to discuss...",
    sender: "tobias@sturm-drang.de",
    recipients: ["it@bayr-werkzeug.de"],
    receivedAt: "2026-04-28T11:00:00+02:00",
    isRead: true,
    urgency: "normal",
    language: "en",
  },

  // --- KraftStrom thread (GDPR question) ---
  {
    id: "msg_kraftstrom_1",
    threadId: "thr_kraftstrom_dsgvo",
    channel: "email",
    direction: "inbound",
    clientId: "c_kraftstrom",
    projectId: "p_kraftstrom_dsgvo",
    subject: "Question about GDPR compliance on AWS",
    body: `Hello Anna,

One quick question from our internal audit: do you use the EU region switch automatically for AWS workloads, or do we need to configure it per service? Our data protection officer needs this by Wednesday.

Thanks and best regards
A. Becker`,
    snippet:
      "One quick question from our internal audit: do you use the EU region switch for AWS workloads...",
    sender: "a.becker@kraftstrom.de",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-05-03T15:42:00+02:00",
    isRead: false,
    urgency: "high",
    language: "en",
  },

  // --- NorthCloud (English) ---
  {
    id: "msg_northcloud_1",
    threadId: "thr_northcloud_joint",
    channel: "email",
    direction: "inbound",
    clientId: "c_northcloud",
    subject: "Joint proposal — Heidelberg Logistics",
    body: `Hey Anna,

quick one — Heidelberg Logistics asked for a combined offer (your migration piece + our managed-services layer). I drafted a one-pager (attached). Could you review and send back any pricing inputs by Wednesday?

Cheers
Tom`,
    snippet:
      "Heidelberg Logistics asked for a combined offer. I drafted a one-pager — could you review by Wednesday?",
    sender: "tom@northcloud.io",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-05-04T07:55:00+02:00",
    isRead: false,
    urgency: "normal",
    language: "en",
  },
];

export const threads: Thread[] = [
  {
    id: "thr_mueller_m365",
    clientId: "c_mueller",
    subject: "Inquiry: migration to Microsoft 365",
    lastMessageAt: "2026-05-03T17:11:00+02:00",
    messageCount: 2,
    hasUnread: true,
    urgency: "high",
    aiSummary:
      "Mueller GmbH (~180 employees, critical-infrastructure supplier) is evaluating an M365 migration: SharePoint instead of file server, Teams, MDM. Current setup: Exchange 2019 on-prem + 4 TB file server. Q3 2026 target. Initial effort estimate requested.",
    detectedLanguage: "en",
    suggestedAction: "Draft reply to M365 inquiry; it matches our cloud migration service.",
    messageIds: ["msg_mueller_1", "msg_mueller_2"],
  },
  {
    id: "thr_hofbauer_backup",
    clientId: "c_hofbauer",
    subject: "Cloud backup proposal for Hofbauer & Partner",
    lastMessageAt: "2026-05-02T10:18:00+02:00",
    messageCount: 2,
    hasUnread: true,
    urgency: "normal",
    aiSummary:
      "Proposal was sent on 2026-04-29. Hofbauer confirms Monday at 14:00 and asks a detailed question about the fixed-price guarantee as data volume grows (~200 GB/year).",
    detectedLanguage: "en",
    suggestedAction: "Draft confirmation and answer to the fixed-price question before the 14:00 meeting.",
    messageIds: ["msg_hofbauer_1", "msg_hofbauer_2"],
  },
  {
    id: "thr_bayr_wartung",
    clientId: "c_bayr",
    subject: "Maintenance contract renewal — proposal",
    lastMessageAt: "2026-04-28T11:00:00+02:00",
    messageCount: 1,
    hasUnread: false,
    urgency: "normal",
    aiSummary:
      "We offered the maintenance contract renewal on 2026-04-28. No response for 6 days; the contract expires on 2026-06-30.",
    detectedLanguage: "en",
    suggestedAction: "Draft a polite reminder (follow-up).",
    messageIds: ["msg_bayr_1"],
  },
  {
    id: "thr_kraftstrom_dsgvo",
    clientId: "c_kraftstrom",
    subject: "Question about GDPR compliance on AWS",
    lastMessageAt: "2026-05-03T15:42:00+02:00",
    messageCount: 1,
    hasUnread: true,
    urgency: "high",
    aiSummary:
      "KraftStrom needs clarification by Wednesday about AWS EU region setup for their internal data protection audit. Our GDPR checklist document contains the answer.",
    detectedLanguage: "en",
    suggestedAction: "Draft reply with reference to our GDPR compliance checklist.",
    messageIds: ["msg_kraftstrom_1"],
  },
  {
    id: "thr_northcloud_joint",
    clientId: "c_northcloud",
    subject: "Joint proposal — Heidelberg Logistics",
    lastMessageAt: "2026-05-04T07:55:00+02:00",
    messageCount: 1,
    hasUnread: true,
    urgency: "normal",
    aiSummary:
      "NorthCloud (UK partner) drafted a joint proposal for Heidelberg Logistics. Wants pricing input from us by Wednesday. English thread, informal tone.",
    detectedLanguage: "en",
    suggestedAction: "Reply in English (informal) confirming review timeline.",
    messageIds: ["msg_northcloud_1"],
  },
];

export function threadById(id: string | undefined) {
  return threads.find((t) => t.id === id);
}

export function messagesByThread(id: string) {
  return messages.filter((m) => m.threadId === id);
}
