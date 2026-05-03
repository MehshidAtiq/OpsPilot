import type { Company } from "@/types/models";

export const company: Company = {
  id: "co_1",
  name: "Sturm & Drang Consulting GmbH",
  industry: "IT consulting & cloud migration",
  services: [
    "Cloud migration (Azure / M365)",
    "Microsoft 365 & SharePoint",
    "IT infrastructure",
    "GDPR compliance audits",
  ],
  targetClients: "Mid-sized companies, 50-500 employees, DACH",
  primaryLanguage: "en",
  defaultFormality: "sie",
  toneSummary:
    "Polite, factual, no marketing fluff. Reply within 24 hours.",
};
