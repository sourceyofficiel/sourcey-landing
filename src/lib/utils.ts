import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names en évitant les conflits. Utilisé partout pour
 * combiner les classes conditionnellement.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
