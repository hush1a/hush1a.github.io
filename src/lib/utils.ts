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
// Badge colours for writeup metadata, shared by the writeups index and the
// writeup page so the same field always looks the same. Each pairs a light
// and dark variant: -700 text on a faint tint in light mode, -300 in dark.
const BADGE_BASE = "px-2 py-1 rounded-sm text-sm";

export const WRITEUP_BADGE = {
  neutral: `${BADGE_BASE} bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/70`,
  category: `${BADGE_BASE} bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300`,
  points: `${BADGE_BASE} bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300`,
  difficulty: {
    Easy: `${BADGE_BASE} bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-300`,
    Medium: `${BADGE_BASE} bg-yellow-500/20 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300`,
    Hard: `${BADGE_BASE} bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300`,
    Insane: `${BADGE_BASE} bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300`,
  },
} as const;
