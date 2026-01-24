/**
 * ============================================================================
 * GITHUB REPOSITORY COMMITS API ENDPOINT
 * ============================================================================
 * 
 * @file src/app/api/github/repositories/[owner]/[repo]/commits/route.ts
 * @route /api/github/repositories/[owner]/[repo]/commits
 * 
 * PURPOSE:
 * API endpoint for getting repository commit history.
 * 
 * ENDPOINT:
 * - GET /api/github/repositories/[owner]/[repo]/commits - Get commit history
 * 
 * AUTHENTICATION:
 * - Requires NextAuth session with GitHub OAuth token
 * 
 * FEATURES:
 * - Response caching (2 minutes, shorter than repos due to frequency)
 * - Parameter validation
 * - Rate limit handling
 * 
 * RELATED FILES:
 * - src/lib/github-client.ts (GitHub API client)
 * - src/lib/validation.ts (Parameter validation)
 * - src/lib/cache.ts (Response caching)
 * 
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';
import { validateRequest, repositoryParamsSchema } from '@/lib/validation';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * GET /api/github/repositories/[owner]/[repo]/commits
 * 
 * Get commit history for a repository.
 * 
 * Response: GitHubCommit[]
 * 
 * @param request - Next.js request object
 * @param params - Route parameters (owner, repo)
 * @returns JSON response with commit history
 * @returns 401 if not authenticated
 * @returns 400 if validation fails
 * @returns 500 if server error
 */
export async function GET(request: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  try {
    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ========================================================================
    // PARAMETER VALIDATION
    // ========================================================================
    const validatedParams = validateRequest(repositoryParamsSchema, params);

    // ========================================================================
    // CHECK CACHE
    // ========================================================================
    // Shorter cache TTL (2 minutes) since commits change frequently
    const cacheKey = `commits:${validatedParams.owner}:${validatedParams.repo}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached commits', {
        owner: validatedParams.owner,
        repo: validatedParams.repo,
      });
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

    const commits = await client.getRepositoryCommits(validatedParams.owner, validatedParams.repo);

    // ========================================================================
    // CACHE RESPONSE
    // ========================================================================
    cache.set(cacheKey, commits, 2 * 60 * 1000); // 2 minutes (shorter than repos)
    logger.info('Fetched and cached commits', {
      owner: validatedParams.owner,
      repo: validatedParams.repo,
      count: commits.length,
    });

    return NextResponse.json(commits);
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    logger.error('Error fetching commits', error instanceof Error ? error : new Error(String(error)), {
      owner: params.owner,
      repo: params.repo,
    });
    return NextResponse.json(
      { error: 'Failed to fetch commits', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
