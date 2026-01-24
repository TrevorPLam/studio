import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';
import { ExtendedSession } from '@/lib/types';
import { validateRequest, repositoryParamsSchema } from '@/lib/validation';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validatedParams = validateRequest(repositoryParamsSchema, params);
    
    // Check cache (commits change frequently, shorter TTL)
    const cacheKey = `commits:${validatedParams.owner}:${validatedParams.repo}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached commits', { owner: validatedParams.owner, repo: validatedParams.repo });
      return NextResponse.json(cached);
    }

    const client = new GitHubClient({ 
      token: session.accessToken,
      timeout: 10000,
      retries: 2,
    });

    const commits = await client.getRepositoryCommits(
      validatedParams.owner,
      validatedParams.repo
    );
    
    // Cache for 2 minutes (commits change more frequently)
    cache.set(cacheKey, commits, 2 * 60 * 1000);
    logger.info('Fetched and cached commits', { owner: validatedParams.owner, repo: validatedParams.repo, count: commits.length });
    
    return NextResponse.json(commits);
  } catch (error) {
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
