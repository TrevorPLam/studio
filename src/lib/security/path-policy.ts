/**
 * ============================================================================
 * PATH POLICY MODULE
 * ============================================================================
 *
 * @file src/lib/security/path-policy.ts
 * @module path-policy
 * @epic RA-SAFE-004
 *
 * PURPOSE:
 * Enforces allowlist and do-not-touch policies for repository file paths.
 * Used by preview and apply endpoints to prevent unauthorized modifications.
 *
 * SECURITY MODEL:
 * Per AS-CORE-001: Fail-closed security model - reject by default.
 *
 * RELATED FILES:
 * - src/lib/agent/proposed-change.ts (Uses path policy for validation)
 * - src/app/api/sessions/[id]/preview/route.ts (Enforces path policy)
 *
 * ============================================================================
 */

/**
 * Allowed path prefixes for repository files.
 * Files must match at least one of these prefixes to be allowed.
 */
export const ALLOWED_PREFIXES = ['docs/', '.repo/', 'README.md'];

/**
 * Forbidden path prefixes and exact paths.
 * These paths cannot be modified unless explicit override is provided.
 */
export const FORBIDDEN_PREFIXES = [
  '.github/workflows/',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'pnpm-lock.yml',
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
];

/**
 * Options for path policy enforcement.
 */
export interface PathPolicyOptions {
  /**
   * If true, allows modification of forbidden paths.
   * Should only be used with explicit user approval.
   */
  allowForbidden?: boolean;

  /**
   * If true, allows paths not in the allowlist.
   * Should only be used with explicit user approval.
   */
  allowNonWhitelisted?: boolean;
}

/**
 * Result of path policy check.
 */
export interface PathPolicyResult {
  /**
   * Whether the path is allowed.
   */
  allowed: boolean;

  /**
   * Reason for rejection (if not allowed).
   */
  reason?: string;
}

/**
 * Check if a repository file path is allowed according to the path policy.
 *
 * Per RA-SAFE-004:
 * - Paths must match at least one allowed prefix
 * - Paths must not match any forbidden prefix
 * - Fail-closed: reject by default
 *
 * @param filePath - Repository-relative file path (e.g., "docs/guide.md")
 * @param options - Optional overrides for policy enforcement
 * @returns PathPolicyResult indicating if path is allowed
 *
 * @example
 * ```typescript
 * const result = assertPathAllowed("docs/guide.md");
 * if (!result.allowed) {
 *   throw new Error(result.reason);
 * }
 * ```
 */
export function assertPathAllowed(
  filePath: string,
  options: PathPolicyOptions = {}
): PathPolicyResult {
  // Normalize path: remove leading/trailing slashes, handle Windows paths
  const normalized = filePath.replace(/^\/+|\/+$/g, '').replace(/\\/g, '/');

  // Check forbidden list first (unless override)
  if (!options.allowForbidden) {
    const isForbidden = FORBIDDEN_PREFIXES.some((prefix) => {
      // Exact match
      if (normalized === prefix) {
        return true;
      }
      // Prefix match
      if (normalized.startsWith(prefix)) {
        return true;
      }
      // For exact filenames, check if path ends with the forbidden name
      if (!prefix.includes('/') && normalized.endsWith(`/${prefix}`)) {
        return true;
      }
      return false;
    });

    if (isForbidden) {
      return {
        allowed: false,
        reason: `Path "${filePath}" is in the forbidden list and cannot be modified without explicit override`,
      };
    }
  }

  // Check allowlist (unless override)
  if (!options.allowNonWhitelisted) {
    const isAllowed = ALLOWED_PREFIXES.some((prefix) => {
      // Exact match
      if (normalized === prefix) {
        return true;
      }
      // Prefix match
      if (normalized.startsWith(prefix)) {
        return true;
      }
      // For exact filenames, check if path ends with the allowed name
      if (!prefix.includes('/') && normalized.endsWith(`/${prefix}`)) {
        return true;
      }
      return false;
    });

    if (!isAllowed) {
      return {
        allowed: false,
        reason: `Path "${filePath}" is not in the allowed list and cannot be modified without explicit override`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Assert that a path is allowed, throwing an error if not.
 * Convenience wrapper around assertPathAllowed.
 *
 * @param filePath - Repository-relative file path
 * @param options - Optional overrides for policy enforcement
 * @throws Error if path is not allowed
 */
export function validatePath(filePath: string, options: PathPolicyOptions = {}): void {
  const result = assertPathAllowed(filePath, options);
  if (!result.allowed) {
    throw new Error(result.reason || `Path "${filePath}" is not allowed`);
  }
}

/**
 * Validate multiple paths at once.
 * Returns all validation errors, or throws if any path is invalid.
 *
 * @param filePaths - Array of repository-relative file paths
 * @param options - Optional overrides for policy enforcement
 * @throws Error if any path is not allowed (includes all errors in message)
 */
export function validatePaths(filePaths: string[], options: PathPolicyOptions = {}): void {
  const errors: string[] = [];

  for (const filePath of filePaths) {
    const result = assertPathAllowed(filePath, options);
    if (!result.allowed) {
      errors.push(result.reason || `Path "${filePath}" is not allowed`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Path policy violations:\n${errors.join('\n')}`);
  }
}

/**
 * Check if a path is in the forbidden list (regardless of allowlist).
 * Useful for warning users about risky operations.
 *
 * @param filePath - Repository-relative file path
 * @returns true if path is forbidden
 */
export function isForbiddenPath(filePath: string): boolean {
  const result = assertPathAllowed(filePath, { allowNonWhitelisted: true });
  return !result.allowed && (result.reason?.includes('forbidden') ?? false);
}

/**
 * Check if a path is in the allowed list.
 *
 * @param filePath - Repository-relative file path
 * @returns true if path matches an allowed prefix
 */
export function isAllowedPath(filePath: string): boolean {
  const normalized = filePath.replace(/^\/+|\/+$/g, '').replace(/\\/g, '/');
  return ALLOWED_PREFIXES.some((prefix) => {
    if (normalized === prefix) return true;
    if (normalized.startsWith(prefix)) return true;
    if (!prefix.includes('/') && normalized.endsWith(`/${prefix}`)) return true;
    return false;
  });
}
