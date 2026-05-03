import { apiFetch } from "./http";

export type ApiUser = {
  id: string;
  company_id: string;
  email: string;
  name: string;
  role: string;
  locale: string;
};

export async function login(payload: { email: string; password: string }) {
  return apiFetch<{ user: ApiUser }>("/auth/login", {
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
  return apiFetch<{ user: ApiUser }>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

