import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();

function getRelativeTimeFormatter(locale: string) {
  const cached = relativeTimeFormatters.get(locale);
  if (cached) return cached;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  relativeTimeFormatters.set(locale, formatter);
  return formatter;
}

export function relativeTime(iso: string, locale = "de-DE") {
  const formatter = getRelativeTimeFormatter(locale);
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = then - now;
  const abs = Math.abs(diffMs);
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / (60 * 60 * 1000));
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (abs < 60 * 60 * 1000) return formatter.format(minutes, "minute");
  if (abs < 24 * 60 * 60 * 1000) return formatter.format(hours, "hour");
  return formatter.format(days, "day");
}

export function formatDateTime(iso: string, locale = "de-DE") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale = "de-DE") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
