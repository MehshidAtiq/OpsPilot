import type { Document } from "@/types/models";

export const documents: Document[] = [
  {
    id: "doc_services",
    title: "Leistungsübersicht 2026.pdf",
    source: "upload",
    mime: "application/pdf",
    sizeBytes: 318_440,
    status: "indexed",
    uploadedAt: "2026-04-22T09:14:00+02:00",
    uploaderId: "u_anna",
    chunkCount: 14,
    summary:
      "Beschreibt unsere vier Kernleistungen, Beispielprojekte und typische Tagessätze.",
  },
  {
    id: "doc_proposal_tpl",
    title: "Angebotsvorlage Cloud-Migration.docx",
    source: "upload",
    mime: "application/msword",
    sizeBytes: 96_120,
    status: "indexed",
    uploadedAt: "2026-04-23T11:02:00+02:00",
    uploaderId: "u_tobias",
    chunkCount: 9,
    summary:
      "Standard-Vorlage für Cloud-Migrations-Angebote inkl. Phasenmodell, Timeline und Aufwandschätzung.",
  },
  {
    id: "doc_dsgvo",
    title: "DSGVO-Compliance-Checkliste.md",
    source: "upload",
    mime: "text/markdown",
    sizeBytes: 12_330,
    status: "indexed",
    uploadedAt: "2026-04-25T16:48:00+02:00",
    uploaderId: "u_lena",
    chunkCount: 6,
    summary:
      "Interne Checkliste für DSGVO-Audits — Datenflüsse, AVV, Löschkonzept, Hosting-Region.",
  },
  {
    id: "doc_q3retro",
    title: "Q3-Retro Sturm & Drang.md",
    source: "upload",
    mime: "text/markdown",
    sizeBytes: 8_410,
    status: "indexed",
    uploadedAt: "2026-04-28T14:21:00+02:00",
    uploaderId: "u_anna",
    chunkCount: 4,
    summary:
      "Notizen aus der Q3-Retrospektive — Wins, Engpässe, Q4-Ziele.",
  },
  {
    id: "doc_onboarding",
    title: "Onboarding-Checkliste Neukunden.md",
    source: "upload",
    mime: "text/markdown",
    sizeBytes: 5_840,
    status: "indexed",
    uploadedAt: "2026-04-30T10:05:00+02:00",
    uploaderId: "u_lena",
    chunkCount: 3,
    summary:
      "Standard-Schritte beim Onboarding neuer Kunden — AVV, Kickoff, Tooling-Zugriffe.",
  },
  {
    id: "doc_pending",
    title: "NDA-Vorlage 2026.pdf",
    source: "upload",
    mime: "application/pdf",
    sizeBytes: 142_900,
    status: "pending",
    uploadedAt: "2026-05-04T09:12:00+02:00",
    uploaderId: "u_lena",
    summary: undefined,
  },
];

export function documentById(id: string | undefined) {
  return documents.find((d) => d.id === id);
}
