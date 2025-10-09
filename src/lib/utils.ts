import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a string to URL-friendly format (spaces to hyphens, lowercase)
 */
export function toUrlSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')   // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')       // Trim hyphens from start
    .replace(/-+$/, '');      // Trim hyphens from end
}

/**
 * Convert a URL slug back to the original format
 * This tries to match against a list of known names to restore proper casing
 */
export function fromUrlSlug(slug: string, knownNames: string[] = []): string {
  // First, try to find exact match in known names
  const slugLower = slug.toLowerCase();
  const match = knownNames.find(name =>
    toUrlSlug(name) === slugLower
  );

  if (match) {
    return match;
  }

  // If no match, convert slug to readable format (hyphens to spaces, capitalize words)
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Throttle function that limits how often a function can be called
 * @param func - The function to throttle
 * @param delay - The minimum time (in ms) between function calls
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Schedule the call for the remaining time
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  };
}
