/**
 * ============================================================================
 * GITHUB REPOSITORIES LIST API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/github/repositories/route.ts
 * @route /api/github/repositories
 *
 * PURPOSE:
 * API endpoint for listing user's GitHub repositories.
 *
 * ENDPOINT:
 * - GET /api/github/repositories - List user's repositories
 *
 * AUTHENTICATION:
 * - Requires NextAuth session with GitHub OAuth token
 *
 * FEATURES:
 * - Response caching (5 minutes)
 * - Rate limit handling
 * - Error handling with proper status codes
 *
 * RELATED FILES:
 * - src/lib/github-client.ts (GitHub API client)
 * - src/lib/cache.ts (Response caching)
 * - src/app/api/github/repositories/[owner]/[repo]/route.ts (Repository detail)
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * GET /api/github/repositories
 *
 * List all repositories for authenticated user.
 *
 * Response: GitHubRepository[]
 *
 * @param request - Next.js request object
 * @returns JSON response with user's repositories
 * @returns 401 if not authenticated
 * @returns 403 if rate limited
 * @returns 500 if server error
 */
export async function GET(_request: NextRequest) {
  try {
    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ========================================================================
    // CHECK CACHE
    // ========================================================================
    const cacheKey = `repos:${session.user?.email || 'anonymous'}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached repositories');
      return NextResponse.json(cached);
    }

    // ========================================================================
    // FETCH FROM GITHUB API
    // ========================================================================
    const client = new GitHubClient({
      token: session.accessToken,
      timeout: 10000,
      retries: 2,
    });

    const repos = await client.getRepositories();

    // ========================================================================
    // CACHE RESPONSE
    // ========================================================================
    cache.set(cacheKey, repos, 5 * 60 * 1000); // 5 minutes
    logger.info('Fetched and cached repositories', { count: repos.length });

    return NextResponse.json(repos);
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
          rateLimitRemaining: error.rateLimitRemaining,
          rateLimitReset: error.rateLimitReset,
        },
        { status: error.statusCode }
      );
    }

    logger.error(
      'Error fetching repositories',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      {
        error: 'Failed to fetch repositories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
