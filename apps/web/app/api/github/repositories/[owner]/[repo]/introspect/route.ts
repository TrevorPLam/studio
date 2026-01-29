/**
 * ============================================================================
 * REPOSITORY INTROSPECTION API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/github/repositories/[owner]/[repo]/introspect/route.ts
 * @route /api/github/repositories/[owner]/[repo]/introspect
 *
 * PURPOSE:
 * API endpoint for repository introspection and metadata extraction.
 *
 * USAGE:
 * GET /api/github/repositories/{owner}/{repo}/introspect
 *
 * QUERY PARAMETERS:
 * - ref: Branch/ref to analyze (optional, defaults to default branch)
 * - maxFiles: Maximum files to analyze (optional, default: 1000)
 * - maxDepth: Maximum directory depth (optional, default: 10)
 * - quick: Use quick summary mode (optional, default: false)
 *
 * AUTHENTICATION:
 * - Requires NextAuth session with GitHub OAuth token
 *
 * RELATED FILES:
 * - src/lib/repo-introspection/introspector.ts (Main introspection logic)
 * - src/lib/github-client.ts (GitHub API client)
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth';
import { GitHubClient } from '@/features/github';
import { introspectRepository, getRepositorySummary } from '@/lib/repo-introspection';
import { logger } from '@/lib/logger';

/**
 * GET /api/github/repositories/[owner]/[repo]/introspect
 *
 * Introspect a GitHub repository and return metadata.
 *
 * @param request - Next.js request object
 * @param params - Route parameters (owner, repo)
 * @returns JSON response with repository metadata
 * @returns 401 if not authenticated
 * @returns 500 if server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const ref = searchParams.get('ref') || undefined;
    const maxFiles = searchParams.get('maxFiles')
      ? parseInt(searchParams.get('maxFiles')!, 10)
      : undefined;
    const maxDepth = searchParams.get('maxDepth')
      ? parseInt(searchParams.get('maxDepth')!, 10)
      : undefined;
    const quick = searchParams.get('quick') === 'true';

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create GitHub client
    const client = new GitHubClient({ token: session.accessToken });

    // Perform introspection
    if (quick) {
      const summary = await getRepositorySummary(client, owner, repo);
      return NextResponse.json(summary);
    } else {
      const metadata = await introspectRepository(client, owner, repo, {
        ref,
        maxFiles,
        maxDepth,
      });
      return NextResponse.json(metadata);
    }
  } catch (error) {
    logger.error('Repository introspection API error', error instanceof Error ? error : undefined, {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'Failed to introspect repository',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
