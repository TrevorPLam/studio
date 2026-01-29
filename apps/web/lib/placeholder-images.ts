/**
 * ============================================================================
 * PLACEHOLDER IMAGES MODULE
 * ============================================================================
 *
 * @file src/lib/placeholder-images.ts
 *
 * PURPOSE:
 * Placeholder image data for UI components.
 * Provides fallback images when actual images are unavailable.
 *
 * DATA SOURCE:
 * - src/lib/placeholder-images.json (Image data)
 *
 * RELATED FILES:
 * - src/lib/placeholder-images.json (Image data file)
 *
 * ============================================================================
 */

import data from './placeholder-images.json';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Placeholder image data structure.
 */
export type ImagePlaceholder = {
  /** Unique image identifier */
  id: string;

  /** Image description */
  description: string;

  /** Image URL */
  imageUrl: string;

  /** Image hint/alt text */
  imageHint: string;
};

// ============================================================================
// SECTION: EXPORT
// ============================================================================

/**
 * Array of placeholder images.
 *
 * Imported from placeholder-images.json.
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
