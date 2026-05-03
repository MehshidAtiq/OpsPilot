import { apiUrl } from "./config";

type JsonBody = Record<string, unknown> | unknown[];
type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonBody;
  formData?: FormData;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (options.formData) {
    body = options.formData;
  } else if (body && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
