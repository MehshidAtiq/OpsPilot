import type { Document } from "@/types/models";

export const documents: Document[] = [
  {
    id: "doc_services",
    title: "Service overview 2026.pdf",
    source: "upload",
    mime: "application/pdf",
    sizeBytes: 318_440,
    status: "indexed",
    uploadedAt: "2026-04-22T09:14:00+02:00",
    uploaderId: "u_anna",
    chunkCount: 14,
    summary:
      "Describes our four core services, sample projects, and typical day rates.",
  },
  {
    id: "doc_proposal_tpl",
    title: "Cloud migration proposal template.docx",
    source: "upload",
    mime: "application/msword",
    sizeBytes: 96_120,
    status: "indexed",
    uploadedAt: "2026-04-23T11:02:00+02:00",
    uploaderId: "u_tobias",
    chunkCount: 9,
    summary:
      "Standard template for cloud migration proposals, including phase model, timeline, and effort estimate.",
  },
  {
    id: "doc_dsgvo",
    title: "GDPR compliance checklist.md",
    source: "upload",
    mime: "text/markdown",
    sizeBytes: 12_330,
    status: "indexed",
    uploadedAt: "2026-04-25T16:48:00+02:00",
    uploaderId: "u_lena",
    chunkCount: 6,
    summary:
      "Internal checklist for GDPR audits: data flows, data processing agreements, deletion concept, and hosting region.",
  },
  {
    id: "doc_q3retro",
    title: "Q3 retro Sturm & Drang.md",
    source: "upload",
    mime: "text/markdown",
    sizeBytes: 8_410,
    status: "indexed",
    uploadedAt: "2026-04-28T14:21:00+02:00",
    uploaderId: "u_anna",
    chunkCount: 4,
    summary:
      "Notes from the Q3 retrospective: wins, bottlenecks, and Q4 goals.",
  },
  {
    id: "doc_onboarding",
    title: "New customer onboarding checklist.md",
    source: "upload",
    mime: "text/markdown",
    sizeBytes: 5_840,
    status: "indexed",
    uploadedAt: "2026-04-30T10:05:00+02:00",
    uploaderId: "u_lena",
    chunkCount: 3,
    summary:
      "Standard steps for onboarding new customers: DPA, kickoff, and tooling access.",
  },
  {
    id: "doc_pending",
    title: "NDA template 2026.pdf",
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
