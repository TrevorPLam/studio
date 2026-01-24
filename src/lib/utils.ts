/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 *
 * @file src/lib/utils.ts
 * @module utils
 *
 * PURPOSE:
 * Common utility functions used throughout the application.
 * Primarily for CSS class name merging (Tailwind + clsx).
 *
 * DEPENDENCIES:
 * - clsx (conditional class names)
 * - tailwind-merge (Tailwind class conflict resolution)
 *
 * RELATED FILES:
 * - All component files (use cn() for className merging)
 *
 * ============================================================================
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge and deduplicate CSS class names.
 *
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 * Essential for Tailwind CSS components with conditional styling.
 *
 * @param inputs - Class name inputs (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 *
 * @example
 * ```typescript
 * cn('px-4', 'py-2', { 'bg-red-500': isError }) // 'px-4 py-2 bg-red-500'
 * cn('px-4', 'px-2') // 'px-2' (later class wins)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
