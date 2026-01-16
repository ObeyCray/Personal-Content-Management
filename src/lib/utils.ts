import { type ClassValue, clsx } from "clsx";

/**
 * Combines multiple class names into a single string.
 * Uses clsx for conditional logic.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
