import { apiFetch } from "./http";

export type ApiUser = {
  id: string;
  company_id: string;
  email: string;
  name: string;
  role: string;
  locale: string;
  last_login_at?: string | null;
};

export type ApiCompany = {
  id: string;
  name: string;
  industry: string;
  services: string[];
  target_clients: string;
  tone_profile: Record<string, unknown>;
  primary_language: string;
  default_formality: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AuthSession = {
  user: ApiUser;
  company: ApiCompany;
};

export async function login(payload: { email: string; password: string }) {
  return apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function signup(payload: {
  email: string;
  password: string;
  name: string;
  company_name: string;
}) {
  return apiFetch<AuthSession>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export async function getSession() {
  return apiFetch<AuthSession>("/auth/session");
}

export async function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}
