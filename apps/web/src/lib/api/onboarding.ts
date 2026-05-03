import { apiFetch } from "./http";

export async function submitOnboarding(payload: {
  company_name: string;
  industry: string;
  services: string[];
  target_clients: string;
  primary_language: string;
  default_formality: string;
  tone_summary: string;
  settings?: Record<string, unknown>;
}) {
  return apiFetch("/onboarding", {
    method: "POST",
    body: payload,
  });
}
