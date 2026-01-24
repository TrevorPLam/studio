/**
 * ============================================================================
 * ADMIN ROLE CHECK UTILITY
 * ============================================================================
 *
 * @file src/lib/auth/admin.ts
 * @module admin-auth
 *
 * PURPOSE:
 * Admin role checking utility for authorization of administrative operations.
 * Uses environment variable to define admin users (comma-separated emails).
 *
 * SECURITY:
 * - Admin emails are configured via ADMIN_EMAILS environment variable
 * - Comma-separated list of email addresses
 * - Case-insensitive email matching
 * - Fail-closed: returns false if user not in admin list
 *
 * USAGE:
 * ```typescript
 * import { isAdmin } from '@/lib/auth/admin';
 *
 * if (!isAdmin(userId)) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 *
 * CONFIGURATION:
 * - Set ADMIN_EMAILS environment variable (comma-separated emails)
 * - Example: ADMIN_EMAILS=admin@example.com,superuser@example.com
 *
 * RELATED FILES:
 * - src/lib/env.ts (Environment configuration)
 * - src/app/api/admin/killswitch/route.ts (Uses admin check)
 *
 * ============================================================================
 */

import { env } from '@/lib/env';

// ============================================================================
// SECTION: ADMIN EMAIL CONFIGURATION
// ============================================================================

/**
 * Get list of admin email addresses from environment variable.
 *
 * ADMIN_EMAILS environment variable should contain comma-separated email addresses.
 * Example: ADMIN_EMAILS=admin@example.com,superuser@example.com
 *
 * @returns Array of admin email addresses (normalized to lowercase)
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';

  if (!adminEmailsEnv.trim()) {
    // No admin emails configured - fail-closed (no admins)
    return [];
  }

  // Split by comma, trim whitespace, normalize to lowercase
  return adminEmailsEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Cached admin emails list (computed once per process).
 * Environment variables don't change at runtime, so we can cache.
 */
let cachedAdminEmails: string[] | null = null;

/**
 * Get cached admin emails list.
 *
 * @returns Array of admin email addresses
 */
function getCachedAdminEmails(): string[] {
  if (cachedAdminEmails === null) {
    cachedAdminEmails = getAdminEmails();
  }
  return cachedAdminEmails;
}

/**
 * Reset cached admin emails (for testing only).
 * This allows tests to change ADMIN_EMAILS and have it take effect.
 *
 * @internal
 */
export function _resetAdminCache(): void {
  cachedAdminEmails = null;
}

// ============================================================================
// SECTION: ADMIN CHECK FUNCTION
// ============================================================================

/**
 * Check if a user ID (email) is an admin.
 *
 * Performs case-insensitive email matching against ADMIN_EMAILS environment variable.
 * Returns false if:
 * - userId is null/undefined/empty
 * - ADMIN_EMAILS is not configured
 * - userId is not in admin list
 *
 * @param userId - User identifier (typically email address)
 * @returns true if user is admin, false otherwise
 *
 * @example
 * ```typescript
 * const userId = session?.user?.email;
 * if (!isAdmin(userId)) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export function isAdmin(userId: string | null | undefined): boolean {
  // Fail-closed: null/undefined/empty userId is not admin
  if (!userId || !userId.trim()) {
    return false;
  }

  // Normalize userId to lowercase for comparison
  const normalizedUserId = userId.trim().toLowerCase();

  // Get admin emails list
  const adminEmails = getCachedAdminEmails();

  // Check if userId matches any admin email
  return adminEmails.includes(normalizedUserId);
}
