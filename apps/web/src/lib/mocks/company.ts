import type { Company } from "@/types/models";

export const company: Company = {
  id: "co_1",
  name: "Sturm & Drang Consulting GmbH",
  industry: "IT-Beratung & Cloud-Migration",
  services: [
    "Cloud-Migration (Azure / M365)",
    "Microsoft 365 & SharePoint",
    "IT-Infrastruktur",
    "DSGVO-Compliance-Audits",
  ],
  targetClients: "Mittelständische Unternehmen, 50–500 Mitarbeitende, DACH",
  primaryLanguage: "de",
  defaultFormality: "sie",
  toneSummary:
    "Höflich, sachlich, kein Marketing-Sprech. Antwort in 24 h. Englisch nur auf Anfrage.",
};
