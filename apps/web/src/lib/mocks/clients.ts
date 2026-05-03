import type { Client, ProjectRef } from "@/types/models";

export const clients: Client[] = [
  {
    id: "c_mueller",
    name: "Müller GmbH",
    contactEmail: "m.heller@mueller-gmbh.de",
    language: "de",
    formality: "sie",
    notes: "Maschinenbau, ca. 180 MA. Erstgespräch im April. Hauptkontakt: M. Heller (IT-Leiter).",
  },
  {
    id: "c_hofbauer",
    name: "Hofbauer & Partner",
    contactEmail: "kanzlei@hofbauer-partner.de",
    language: "de",
    formality: "sie",
    notes: "Steuerberatung Hamburg. Cloud-Backup-Projekt in Angebotsphase.",
  },
  {
    id: "c_bayr",
    name: "Bayrische Werkzeugbau AG",
    contactEmail: "it@bayr-werkzeug.de",
    language: "de",
    formality: "sie",
    notes: "Bestandskunde seit 2023. Wartungsvertrag läuft 30.06.2026 aus.",
  },
  {
    id: "c_kraftstrom",
    name: "KraftStrom Energie GmbH",
    contactEmail: "a.becker@kraftstrom.de",
    language: "de",
    formality: "sie",
    notes: "Regionaler Energieversorger Köln. DSGVO-Audit angefragt.",
  },
  {
    id: "c_northcloud",
    name: "NorthCloud Ltd.",
    contactEmail: "tom@northcloud.io",
    language: "en",
    formality: "du",
    notes: "UK partner, joint proposals. Tom Whitfield is point of contact. English, informal.",
  },
];

export const projects: ProjectRef[] = [
  {
    id: "p_mueller_m365",
    clientId: "c_mueller",
    name: "M365-Migration Müller",
    status: "active",
  },
  {
    id: "p_hofbauer_backup",
    clientId: "c_hofbauer",
    name: "Cloud-Backup Hofbauer",
    status: "active",
  },
  {
    id: "p_kraftstrom_dsgvo",
    clientId: "c_kraftstrom",
    name: "DSGVO-Audit KraftStrom",
    status: "active",
  },
  {
    id: "p_bayr_wartung",
    clientId: "c_bayr",
    name: "Wartungsvertrag-Verlängerung",
    status: "active",
  },
];

export function clientById(id: string | undefined) {
  return clients.find((c) => c.id === id);
}
