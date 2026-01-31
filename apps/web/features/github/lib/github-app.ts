/**
 * GitHub App Authentication Module (GH-AUTH-001)
 *
 * Implements GitHub App JWT authentication and installation token management.
 *
 * Per GH-AUTH-001:
 * - Generate GitHub App JWT from private key (GH-01)
 * - Exchange JWT for installation token (GH-02)
 * - Cache token with 60s early expiration (GH-03)
 * - Support reader vs actor permissions (GH-04)
 */

import { createAppAuth } from '@octokit/auth-app';
import { getGitHubAppConfig } from '@/lib/security/secrets';
import { logger } from '@/lib/logger';

/**
 * Cached installation token with expiration tracking.
 */
interface CachedToken {
  token: string;
  expiresAt: number; // Unix timestamp in milliseconds
  installationId: number;
  permissions?: Record<string, string>; // Permission scopes
}

/**
 * Token cache keyed by installation ID and permissions.
 */
const tokenCache = new Map<string, CachedToken>();

/**
 * Early expiration buffer: expire tokens 60 seconds before actual expiration.
 * Per GH-AUTH-001 GH-03.
 */
const EARLY_EXPIRATION_BUFFER_MS = 60 * 1000;

/**
 * Generate cache key for installation token.
 *
 * @param installationId - GitHub App installation ID
 * @param permissions - Optional permission scopes
 * @returns Cache key string
 */
function getCacheKey(installationId: number, permissions?: Record<string, string>): string {
  const permKey = permissions ? JSON.stringify(permissions) : 'default';
  return `install:${installationId}:${permKey}`;
}

/**
 * Check if a cached token is still valid (not expired, accounting for early expiration).
 *
 * @param cached - Cached token
 * @returns true if token is still valid
 */
function isTokenValid(cached: CachedToken): boolean {
  const now = Date.now();
  const expiresAtWithBuffer = cached.expiresAt - EARLY_EXPIRATION_BUFFER_MS;
  return now < expiresAtWithBuffer;
}

/**
 * Get GitHub App installation token.
 *
 * Per GH-AUTH-001:
 * - GH-01: Generate JWT from private key
 * - GH-02: Exchange JWT for installation token
 * - GH-03: Cache token with 60s early expiration
 * - GH-04: Support permission scopes (reader vs actor)
 *
 * @param installationId - GitHub App installation ID (optional if configured in env)
 * @param permissions - Optional permission scopes (e.g., { contents: 'read', metadata: 'read' } for reader)
 * @returns Installation token
 * @throws Error if authentication fails
 */
export async function getInstallationToken(
  installationId?: number,
  permissions?: Record<string, string>
): Promise<string> {
  const config = getGitHubAppConfig();
  const targetInstallationId = installationId || config.installationId;

  if (!targetInstallationId) {
    throw new Error(
      'Installation ID is required (provide as parameter or set GITHUB_APP_INSTALLATION_ID)'
    );
  }

  // Check cache first
  const cacheKey = getCacheKey(targetInstallationId, permissions);
  const cached = tokenCache.get(cacheKey);

  if (cached && isTokenValid(cached)) {
    logger.debug('Using cached installation token', {
      installationId: targetInstallationId,
      expiresAt: new Date(cached.expiresAt).toISOString(),
    });
    return cached.token;
  }

  // Generate new token
  logger.debug('Generating new installation token', {
    installationId: targetInstallationId,
    permissions,
  });

  try {
    const auth = createAppAuth({
      appId: config.appId,
      privateKey: config.privateKey,
      installationId: targetInstallationId,
    });

    // Get installation token
    const authResult = await auth({
      type: 'installation',
      ...(permissions && { permissions }),
    });

    if (!authResult.token) {
      throw new Error('Failed to obtain installation token');
    }

    // Cache the token
    // GitHub installation tokens expire in 1 hour (3600 seconds)
    // We expire 60s early per GH-AUTH-001 GH-03
    const expiresAtMs =
      typeof authResult.expiresAt === 'number' ? authResult.expiresAt * 1000 : 3600 * 1000;
    const expiresAt = Date.now() + expiresAtMs;

    const cachedToken: CachedToken = {
      token: authResult.token,
      expiresAt,
      installationId: targetInstallationId,
      permissions,
    };

    tokenCache.set(cacheKey, cachedToken);

    logger.info('Obtained and cached installation token', {
      installationId: targetInstallationId,
      expiresAt: new Date(expiresAt).toISOString(),
      permissions,
    });

    return authResult.token;
  } catch (error) {
    logger.error(
      'Failed to get installation token',
      error instanceof Error ? error : new Error(String(error))
    );
    throw new Error(
      `GitHub App authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get installation token with read-only permissions.
 * Per GH-AUTH-001 GH-04: Split reader vs actor permissions.
 *
 * @param installationId - GitHub App installation ID
 * @returns Installation token with read permissions
 */
export async function getReaderToken(installationId?: number): Promise<string> {
  return getInstallationToken(installationId, {
    contents: 'read',
    metadata: 'read',
    pull_requests: 'read',
  });
}

/**
 * Get installation token with write permissions.
 * Per GH-AUTH-001 GH-04: Split reader vs actor permissions.
 *
 * @param installationId - GitHub App installation ID
 * @returns Installation token with write permissions
 */
export async function getActorToken(installationId?: number): Promise<string> {
  return getInstallationToken(installationId, {
    contents: 'write',
    metadata: 'read',
    pull_requests: 'write',
  });
}

/**
 * Clear cached tokens (useful for testing or forced refresh).
 *
 * @param installationId - Optional installation ID to clear specific cache
 */
export function clearTokenCache(installationId?: number): void {
  if (installationId) {
    // Clear all cache entries for this installation
    for (const [key, cached] of tokenCache.entries()) {
      if (cached.installationId === installationId) {
        tokenCache.delete(key);
      }
    }
  } else {
    // Clear all cached tokens
    tokenCache.clear();
  }

  logger.debug('Cleared token cache', { installationId });
}

/**
 * Get installation ID for a repository.
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Installation ID for the repository
 * @throws Error if installation not found
 */
export async function getInstallationIdForRepo(owner: string, repo: string): Promise<number> {
  const config = getGitHubAppConfig();

  const auth = createAppAuth({
    appId: config.appId,
    privateKey: config.privateKey,
  });

  try {
    // Get JWT for app authentication
    const appAuth = await auth({ type: 'app' });

    // Use Octokit to find installation
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({
      auth: appAuth.token,
    });

    const { data: installation } = await octokit.apps.getRepoInstallation({
      owner,
      repo,
    });

    return installation.id;
  } catch (error) {
    logger.error(
      'Failed to get installation ID for repository',
      error instanceof Error ? error : undefined,
      {
        owner,
        repo,
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw new Error(
      `Failed to get installation ID for ${owner}/${repo}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
