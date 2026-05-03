export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const USE_API_DATA = process.env.NEXT_PUBLIC_DATA_SOURCE !== "mock";

export function apiUrl(path: string) {
  return `${API_BASE_URL}/api/v1${path}`;
}
