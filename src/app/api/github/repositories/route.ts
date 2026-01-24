import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = `repos:${session.user?.email || 'anonymous'}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached repositories');
      return NextResponse.json(cached);
    }

    const client = new GitHubClient({
      token: session.accessToken,
      timeout: 10000,
      retries: 2,
    });

    const repos = await client.getRepositories();

    cache.set(cacheKey, repos, 5 * 60 * 1000);
    logger.info('Fetched and cached repositories', { count: repos.length });

    return NextResponse.json(repos);
  } catch (error) {
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

    logger.error('Error fetching repositories', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch repositories', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
