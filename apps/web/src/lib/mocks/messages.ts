import type { Message, Thread } from "@/types/models";

// Anchor: Monday 2026-05-04 09:30 CET. All times are literal ISO strings
// for stable demo recordings.

export const messages: Message[] = [
  // --- Müller GmbH thread (M365 migration enquiry) ---
  {
    id: "msg_mueller_1",
    threadId: "thr_mueller_m365",
    channel: "email",
    direction: "inbound",
    clientId: "c_mueller",
    projectId: "p_mueller_m365",
    subject: "Anfrage: Migration zu Microsoft 365",
    body: `Sehr geehrte Frau Sturm,

wir prüfen aktuell eine Migration unserer Office-Umgebung (rund 180 Arbeitsplätze) zu Microsoft 365. Insbesondere geht es uns um:

• SharePoint Online statt Fileserver
• Teams für die Werkstatt-Standorte
• Sicheres Mobile Device Management

Können Sie uns ein erstes Gespräch und eine grobe Aufwandschätzung anbieten? Zeitlich peilen wir Q3 2026 an.

Mit freundlichen Grüßen
M. Heller
IT-Leiter, Müller GmbH`,
    snippet:
      "Wir prüfen aktuell eine Migration unserer Office-Umgebung (rund 180 Arbeitsplätze)…",
    sender: "m.heller@mueller-gmbh.de",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-04-30T08:42:00+02:00",
    isRead: false,
    urgency: "high",
    language: "de",
  },
  {
    id: "msg_mueller_2",
    threadId: "thr_mueller_m365",
    channel: "email",
    direction: "inbound",
    clientId: "c_mueller",
    projectId: "p_mueller_m365",
    subject: "Re: Anfrage: Migration zu Microsoft 365",
    body: `Sehr geehrte Frau Sturm,

zur Ergänzung — falls hilfreich für die Aufwandschätzung: wir nutzen aktuell Exchange 2019 on-prem und einen klassischen Fileserver (~ 4 TB). Datenschutz ist bei uns ein wichtiges Thema (KRITIS-Lieferant).

Beste Grüße
M. Heller`,
    snippet:
      "Zur Ergänzung — wir nutzen aktuell Exchange 2019 on-prem und einen klassischen Fileserver (~ 4 TB).",
    sender: "m.heller@mueller-gmbh.de",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-05-03T17:11:00+02:00",
    isRead: false,
    urgency: "high",
    language: "de",
  },

  // --- Hofbauer & Partner thread (Cloud-Backup proposal) ---
  {
    id: "msg_hofbauer_1",
    threadId: "thr_hofbauer_backup",
    channel: "email",
    direction: "outbound",
    clientId: "c_hofbauer",
    projectId: "p_hofbauer_backup",
    subject: "Angebot Cloud-Backup für Hofbauer & Partner",
    body: `Sehr geehrter Herr Hofbauer,

wie besprochen anbei unser Angebot für die DSGVO-konforme Cloud-Backup-Lösung. Wir haben die Variante "EU-only Hosting" zugrunde gelegt, da das in unserem Telefonat für Sie zentral war.

Gerne stelle ich Ihnen das Angebot am Montag persönlich vor.

Mit besten Grüßen
Tobias Reinhardt`,
    snippet:
      "Wie besprochen anbei unser Angebot für die DSGVO-konforme Cloud-Backup-Lösung…",
    sender: "tobias@sturm-drang.de",
    recipients: ["kanzlei@hofbauer-partner.de"],
    receivedAt: "2026-04-29T14:30:00+02:00",
    isRead: true,
    urgency: "normal",
    language: "de",
  },
  {
    id: "msg_hofbauer_2",
    threadId: "thr_hofbauer_backup",
    channel: "email",
    direction: "inbound",
    clientId: "c_hofbauer",
    projectId: "p_hofbauer_backup",
    subject: "Re: Angebot Cloud-Backup für Hofbauer & Partner",
    body: `Sehr geehrter Herr Reinhardt,

vielen Dank für das Angebot. Können wir den Termin am Montag um 14:00 Uhr machen? Eine kurze Frage vorab: ist der genannte Festpreis auch bei wachsendem Datenvolumen (~ 200 GB / Jahr) garantiert?

Beste Grüße
J. Hofbauer`,
    snippet:
      "Können wir den Termin am Montag um 14:00 Uhr machen? Eine kurze Frage vorab…",
    sender: "kanzlei@hofbauer-partner.de",
    recipients: ["tobias@sturm-drang.de"],
    receivedAt: "2026-05-02T10:18:00+02:00",
    isRead: false,
    urgency: "normal",
    language: "de",
  },

  // --- Bayrische Werkzeugbau (outbound, awaiting reply) ---
  {
    id: "msg_bayr_1",
    threadId: "thr_bayr_wartung",
    channel: "email",
    direction: "outbound",
    clientId: "c_bayr",
    projectId: "p_bayr_wartung",
    subject: "Verlängerung Wartungsvertrag — Vorschlag",
    body: `Sehr geehrter Herr Brunner,

Ihr aktueller Wartungsvertrag läuft am 30.06.2026 aus. Wir würden gerne mit Ihnen über eine Verlängerung sprechen — gerne auch zu leicht angepassten Konditionen, falls sich Ihr Bedarf geändert hat.

Hätten Sie kommende Woche 30 Minuten für ein kurzes Gespräch?

Mit freundlichen Grüßen
Tobias Reinhardt`,
    snippet:
      "Ihr aktueller Wartungsvertrag läuft am 30.06.2026 aus. Wir würden gerne mit Ihnen…",
    sender: "tobias@sturm-drang.de",
    recipients: ["it@bayr-werkzeug.de"],
    receivedAt: "2026-04-28T11:00:00+02:00",
    isRead: true,
    urgency: "normal",
    language: "de",
  },

  // --- KraftStrom thread (DSGVO question) ---
  {
    id: "msg_kraftstrom_1",
    threadId: "thr_kraftstrom_dsgvo",
    channel: "email",
    direction: "inbound",
    clientId: "c_kraftstrom",
    projectId: "p_kraftstrom_dsgvo",
    subject: "Frage zur DSGVO-Compliance bei AWS",
    body: `Hallo Anna,

eine kurze Frage aus unserem internen Audit: nutzen Sie bei AWS-Workloads den EU-Region-Switch automatisch oder müssen wir das pro Service einstellen? Unser Datenschutzbeauftragter braucht das bis Mittwoch.

Danke und beste Grüße
A. Becker`,
    snippet:
      "Eine kurze Frage aus unserem internen Audit: nutzen Sie bei AWS-Workloads den EU-Region-Switch…",
    sender: "a.becker@kraftstrom.de",
    recipients: ["anna@sturm-drang.de"],
    receivedAt: "2026-05-03T15:42:00+02:00",
    isRead: false,
    urgency: "high",
    language: "de",
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
    subject: "Anfrage: Migration zu Microsoft 365",
    lastMessageAt: "2026-05-03T17:11:00+02:00",
    messageCount: 2,
    hasUnread: true,
    urgency: "high",
    aiSummary:
      "Müller GmbH (~180 MA, KRITIS-Lieferant) prüft M365-Migration: SharePoint statt Fileserver, Teams, MDM. Aktuell Exchange 2019 on-prem + 4 TB Fileserver. Q3 2026 Zieltermin. Erste Aufwandschätzung gefragt.",
    detectedLanguage: "de",
    suggestedAction: "Antwort auf M365-Anfrage entwerfen — passt zu unserer Cloud-Migration-Leistung.",
    messageIds: ["msg_mueller_1", "msg_mueller_2"],
  },
  {
    id: "thr_hofbauer_backup",
    clientId: "c_hofbauer",
    subject: "Angebot Cloud-Backup für Hofbauer & Partner",
    lastMessageAt: "2026-05-02T10:18:00+02:00",
    messageCount: 2,
    hasUnread: true,
    urgency: "normal",
    aiSummary:
      "Angebot wurde am 29.04. versendet. Hofbauer bestätigt Termin Montag 14:00 und stellt eine Detailfrage zu Festpreis-Garantie bei wachsendem Datenvolumen (~200 GB/Jahr).",
    detectedLanguage: "de",
    suggestedAction: "Bestätigung + Antwort auf Festpreis-Frage entwerfen, vor dem Termin um 14:00.",
    messageIds: ["msg_hofbauer_1", "msg_hofbauer_2"],
  },
  {
    id: "thr_bayr_wartung",
    clientId: "c_bayr",
    subject: "Verlängerung Wartungsvertrag — Vorschlag",
    lastMessageAt: "2026-04-28T11:00:00+02:00",
    messageCount: 1,
    hasUnread: false,
    urgency: "normal",
    aiSummary:
      "Wir haben am 28.04. die Verlängerung des Wartungsvertrages angeboten. Seit 6 Tagen keine Reaktion — Vertrag läuft 30.06. aus.",
    detectedLanguage: "de",
    suggestedAction: "Höfliche Erinnerung entwerfen (Follow-up).",
    messageIds: ["msg_bayr_1"],
  },
  {
    id: "thr_kraftstrom_dsgvo",
    clientId: "c_kraftstrom",
    subject: "Frage zur DSGVO-Compliance bei AWS",
    lastMessageAt: "2026-05-03T15:42:00+02:00",
    messageCount: 1,
    hasUnread: true,
    urgency: "high",
    aiSummary:
      "KraftStrom braucht bis Mittwoch eine Klarstellung zum AWS EU-Region-Setup für ihren internen Datenschutz-Audit. Unser DSGVO-Checklisten-Doc enthält die Antwort.",
    detectedLanguage: "de",
    suggestedAction: "Antwort entwerfen mit Verweis auf unsere DSGVO-Compliance-Checkliste.",
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
