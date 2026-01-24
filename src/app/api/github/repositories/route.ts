import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';
import { ExtendedSession } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = new GitHubClient({ 
      token: session.accessToken,
      timeout: 10000,
      retries: 2,
    });

    const repos = await client.getRepositories();
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

    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
