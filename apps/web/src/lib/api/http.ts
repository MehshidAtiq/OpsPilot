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
    const contentType = response.headers.get("content-type") ?? "";
    const fallback = `API request failed: ${response.status}`;
    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null);
      const detail = payload?.detail;
      if (typeof detail === "string") {
        throw new Error(detail);
      }
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        if (typeof first?.msg === "string") {
          throw new Error(first.msg);
        }
      }
      throw new Error(fallback);
    }

    const text = await response.text();
    throw new Error(text || fallback);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
