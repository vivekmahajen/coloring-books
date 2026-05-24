import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export const BOOK_TYPE_LABELS: Record<string, string> = {
  COLORING: "Coloring Book",
  STORYBOOK: "Kids Storybook",
  ACTIVITY: "Activity Book",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  GENERATING: "Generating",
  READY: "Ready",
  FAILED: "Failed",
};
