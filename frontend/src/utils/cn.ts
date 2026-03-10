import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS class names conditionally.
 * Combines clsx and tailwind-merge for safe class composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
