import type { Client, ProjectRef } from "@/types/models";

export const clients: Client[] = [
  {
    id: "c_mueller",
    name: "Mueller GmbH",
    contactEmail: "m.heller@mueller-gmbh.de",
    language: "en",
    formality: "sie",
    notes: "Manufacturing, approx. 180 employees. Intro call in April. Main contact: M. Heller (Head of IT).",
  },
  {
    id: "c_hofbauer",
    name: "Hofbauer & Partner",
    contactEmail: "kanzlei@hofbauer-partner.de",
    language: "en",
    formality: "sie",
    notes: "Tax advisory firm in Hamburg. Cloud backup project is in proposal stage.",
  },
  {
    id: "c_bayr",
    name: "Bavarian Tooling AG",
    contactEmail: "it@bayr-werkzeug.de",
    language: "en",
    formality: "sie",
    notes: "Existing customer since 2023. Maintenance contract expires on 2026-06-30.",
  },
  {
    id: "c_kraftstrom",
    name: "KraftStrom Energie GmbH",
    contactEmail: "a.becker@kraftstrom.de",
    language: "en",
    formality: "sie",
    notes: "Regional energy provider in Cologne. Requested a GDPR audit.",
  },
  {
    id: "c_northcloud",
    name: "NorthCloud Ltd.",
    contactEmail: "tom@northcloud.io",
    language: "en",
    formality: "du",
    notes: "UK partner for joint proposals. Tom Whitfield is the point of contact. English, informal.",
  },
];

export const projects: ProjectRef[] = [
  {
    id: "p_mueller_m365",
    clientId: "c_mueller",
    name: "Mueller M365 migration",
    status: "active",
  },
  {
    id: "p_hofbauer_backup",
    clientId: "c_hofbauer",
    name: "Hofbauer cloud backup",
    status: "active",
  },
  {
    id: "p_kraftstrom_dsgvo",
    clientId: "c_kraftstrom",
    name: "KraftStrom GDPR audit",
    status: "active",
  },
  {
    id: "p_bayr_wartung",
    clientId: "c_bayr",
    name: "Maintenance contract renewal",
    status: "active",
  },
];

export function clientById(id: string | undefined) {
  return clients.find((c) => c.id === id);
}
