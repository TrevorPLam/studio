/**
 * ============================================================================
 * GITHUB REPOSITORY DETAIL API ENDPOINT
 * ============================================================================
 * 
 * @file src/app/api/github/repositories/[owner]/[repo]/route.ts
 * @route /api/github/repositories/[owner]/[repo]
 * 
 * PURPOSE:
 * API endpoint for getting repository details.
 * 
 * ENDPOINT:
 * - GET /api/github/repositories/[owner]/[repo] - Get repository details
 * 
 * AUTHENTICATION:
 * - Requires NextAuth session with GitHub OAuth token
 * 
 * FEATURES:
 * - Response caching (5 minutes)
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
 * GET /api/github/repositories/[owner]/[repo]
 * 
 * Get repository details.
 * 
 * Response: GitHubRepository
 * 
 * @param request - Next.js request object
 * @param params - Route parameters (owner, repo)
 * @returns JSON response with repository data
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
    const cacheKey = `repo:${validatedParams.owner}:${validatedParams.repo}`;
    const cached = cache.get<unknown>(cacheKey);
    if (cached) {
      logger.debug('Returning cached repository', {
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

    const repository = await client.getRepository(validatedParams.owner, validatedParams.repo);

    // ========================================================================
    // CACHE RESPONSE
    // ========================================================================
    cache.set(cacheKey, repository, 5 * 60 * 1000); // 5 minutes
    logger.info('Fetched and cached repository', {
      owner: validatedParams.owner,
      repo: validatedParams.repo,
    });

    return NextResponse.json(repository);
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

    logger.error('Error fetching repository', error instanceof Error ? error : new Error(String(error)), {
      owner: params.owner,
      repo: params.repo,
    });
    return NextResponse.json(
      { error: 'Failed to fetch repository', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
