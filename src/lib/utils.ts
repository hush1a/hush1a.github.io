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
// Chips for writeup metadata, shared by the index and the detail page. Every
// field uses the same quiet surface so a row reads as one set rather than a
// rainbow; colour is reserved for the small difficulty dot.
const CHIP_BASE =
  "inline-flex items-center rounded-full border border-black/10 bg-white/50 px-2.5 py-0.5 text-xs leading-5 dark:border-white/15 dark:bg-white/5";

export const WRITEUP_BADGE = {
  neutral: `${CHIP_BASE} gap-1.5 text-black/65 dark:text-white/65`,
  category: `${CHIP_BASE} gap-1.5 font-medium text-black/80 dark:text-white/80`,
  points: `${CHIP_BASE} gap-1.5 font-medium tabular-nums text-black/70 dark:text-white/70`,
  difficulty: `${CHIP_BASE} gap-1.5 font-medium text-black/75 dark:text-white/75`,
  tag: `${CHIP_BASE} gap-1 text-black/60 dark:text-white/60`,
} as const;

// Decorative colour for the difficulty chip: a dot rather than a tinted fill.
export const DIFFICULTY_DOT = {
  Easy: "bg-green-600 dark:bg-green-400",
  Medium: "bg-amber-500 dark:bg-amber-400",
  Hard: "bg-orange-500 dark:bg-orange-400",
  Insane: "bg-red-600 dark:bg-red-400",
} as const;
