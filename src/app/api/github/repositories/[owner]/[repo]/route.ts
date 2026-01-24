import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';
import { ExtendedSession } from '@/lib/types';
import { validateRequest, repositoryParamsSchema } from '@/lib/validation';

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
    const client = new GitHubClient({ 
      token: session.accessToken,
      timeout: 10000,
      retries: 2,
    });

    const repository = await client.getRepository(
      validatedParams.owner,
      validatedParams.repo
    );
    return NextResponse.json(repository);
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

    console.error('Error fetching repository:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
