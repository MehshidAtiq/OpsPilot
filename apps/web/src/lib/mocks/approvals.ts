import type { Approval } from "@/types/models";

export const approvals: Approval[] = [
  {
    id: "ap_mueller_reply",
    actionType: "email_send",
    title: "Antwort an Müller GmbH — M365-Anfrage",
    rationale:
      "Inbound-Anfrage zu Cloud-Migration (passt zu Ihrer Kernleistung). 4 Tage unbeantwortet, hohe Priorität. Entwurf nutzt die Leistungsübersicht 2026 und die Cloud-Migrations-Vorlage.",
    sources: [
      { documentId: "doc_services", documentTitle: "Leistungsübersicht 2026.pdf", chunkIndex: 3, label: "Leistungsübersicht 2026 · §M365" },
      { documentId: "doc_proposal_tpl", documentTitle: "Angebotsvorlage Cloud-Migration.docx", chunkIndex: 1, label: "Angebotsvorlage · Phasenmodell" },
      { threadId: "thr_mueller_m365", label: "Thread: Müller GmbH M365" },
    ],
    payload: {
      to: ["m.heller@mueller-gmbh.de"],
      subject: "Re: Anfrage: Migration zu Microsoft 365",
      body: `Sehr geehrter Herr Heller,

vielen Dank für Ihre Anfrage und die zusätzlichen Details zur aktuellen Umgebung — das hilft uns sehr.

Eine Migration in der von Ihnen skizzierten Größenordnung (~ 180 Arbeitsplätze, Exchange 2019, ~ 4 TB Fileserver, KRITIS-Anforderungen) decken wir typischerweise in vier Phasen ab:

1. Assessment & Zielarchitektur (2–3 Wochen)
2. Pilotmigration mit ausgewählter Abteilung (3 Wochen)
3. Wellenmigration aller Standorte (8–10 Wochen)
4. Hyperc​are und Schulungen (4 Wochen)

Ich schlage einen 60-minütigen Discovery-Call vor — dann können wir gemeinsam priorisieren und ich kann Ihnen bis Ende kommender Woche eine Aufwandschätzung mit Bandbreite zusenden. Hätten Sie am Donnerstag, 08.05., 10:00 oder Freitag, 09.05., 14:00 Zeit?

Mit freundlichen Grüßen
Anna Sturm
Sturm & Drang Consulting GmbH`,
      language: "de",
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
    title: "Follow-up an Bayrische Werkzeugbau — keine Antwort seit 6 Tagen",
    rationale:
      "Outbound vom 28.04. zur Wartungsvertrag-Verlängerung blieb unbeantwortet. Vertrag läuft am 30.06. aus — höfliche Erinnerung empfohlen.",
    sources: [
      { threadId: "thr_bayr_wartung", label: "Thread: Bayrische Werkzeugbau Wartung" },
    ],
    payload: {
      to: ["it@bayr-werkzeug.de"],
      subject: "Erinnerung: Verlängerung Wartungsvertrag",
      body: `Sehr geehrter Herr Brunner,

ich wollte kurz nachhören, ob meine Mail vom 28.04. zur Verlängerung Ihres Wartungsvertrages bei Ihnen angekommen ist. Da der Vertrag am 30.06. ausläuft, würde ich gerne in den nächsten zwei Wochen einen kurzen Termin finden, damit wir keine Lücke entstehen lassen.

Falls es bei Ihnen aktuell nicht passt — kein Problem, dann melden Sie sich einfach, wenn es wieder besser passt.

Mit freundlichen Grüßen
Tobias Reinhardt`,
      language: "de",
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
    title: "Aufgabe: Discovery Call Müller GmbH vorbereiten",
    rationale:
      "Aus dem Müller-Thread extrahiert. Der vorgeschlagene Discovery-Call braucht Briefing-Material vor dem 09.05.",
    sources: [
      { threadId: "thr_mueller_m365", label: "Thread: Müller GmbH M365" },
    ],
    payload: {
      title: "Discovery Call Müller GmbH vorbereiten",
      description:
        "Briefing erstellen: 180 MA, KRITIS-Lieferant, Exchange 2019, 4 TB Fileserver. Phasenplan mitnehmen.",
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
      { documentId: "doc_q3retro", documentTitle: "Q3-Retro Sturm & Drang.md", chunkIndex: 2, label: "Q3-Retro · Pricing" },
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
    title: "Antwort an KraftStrom — DSGVO-Frage AWS",
    rationale: "Antwort mit Verweis auf interne DSGVO-Compliance-Checkliste.",
    sources: [
      { documentId: "doc_dsgvo", documentTitle: "DSGVO-Compliance-Checkliste.md", chunkIndex: 4, label: "DSGVO-Checkliste · Hosting-Region" },
    ],
    payload: {
      to: ["a.becker@kraftstrom.de"],
      subject: "Re: Frage zur DSGVO-Compliance bei AWS",
      body: "Hallo Frau Becker,\n\nbei AWS muss die EU-Region pro Service explizit gesetzt werden — kein automatischer Switch. Unsere Checkliste (Punkt 4.2) listet die Default-Regionen pro Service. Ich kann Ihnen das Dokument gerne zukommen lassen…",
      language: "de",
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
    title: "Aufgabe: Onboarding-Doc an Müller GmbH versenden",
    rationale: "Aus Müller-Thread extrahiert.",
    sources: [{ threadId: "thr_mueller_m365", label: "Thread: Müller GmbH" }],
    payload: {
      title: "Onboarding-Doc an Müller GmbH versenden",
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
