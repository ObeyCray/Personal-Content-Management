import { type ClassValue, clsx } from "clsx";

/**
 * Combines multiple class names into a single string.
 * Uses clsx for conditional logic.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formats a date as YYYY-MM-DD using local time (prevents timezone shifts)
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
