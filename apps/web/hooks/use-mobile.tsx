/**
 * ============================================================================
 * MOBILE DETECTION HOOK
 * ============================================================================
 *
 * @file src/hooks/use-mobile.tsx
 *
 * PURPOSE:
 * React hook for detecting mobile viewport size.
 * Uses media queries to detect screen width.
 *
 * FEATURES:
 * - Responsive to window resize
 * - SSR-safe (returns undefined initially)
 * - Media query-based detection
 *
 * BREAKPOINT:
 * - Mobile: < 768px
 * - Desktop: >= 768px
 *
 * RELATED FILES:
 * - UI components that need mobile-specific behavior
 *
 * ============================================================================
 */

import * as React from 'react';

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================

/**
 * Breakpoint for mobile detection (pixels).
 * Screens below this width are considered mobile.
 */
const MOBILE_BREAKPOINT = 768;

// ============================================================================
// SECTION: USE MOBILE HOOK
// ============================================================================

/**
 * React hook for detecting mobile viewport.
 *
 * Returns true if viewport width is below MOBILE_BREAKPOINT.
 * Returns undefined during SSR (before hydration).
 *
 * @returns true if mobile, false if desktop, undefined during SSR
 *
 * @example
 * ```typescript
 * const isMobile = useIsMobile();
 * if (isMobile) {
 *   // Mobile-specific UI
 * }
 * ```
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // ========================================================================
    // MEDIA QUERY SETUP
    // ========================================================================
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    /**
     * Handler for media query changes.
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Listen for changes
    mql.addEventListener('change', onChange);

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
