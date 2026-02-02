import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS conflict resolution
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
