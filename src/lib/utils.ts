import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

export function readingTime(html?: string) {
  // Content layer entries expose `body` as optional, so guard against undefined.
  const textOnly = (html ?? "").replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = ((wordCount / 200) + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const monthYear = (date: Date) =>
    `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

  const start = monthYear(startDate);
  if (!endDate) return start;

  const end = typeof endDate === "string" ? endDate : monthYear(endDate);
  return `${start} – ${end}`;
}