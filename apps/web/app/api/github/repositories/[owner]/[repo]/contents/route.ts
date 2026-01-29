/**
 * ============================================================================
 * GITHUB FILE CONTENTS API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/github/repositories/[owner]/[repo]/contents/route.ts
 * @route /api/github/repositories/[owner]/[repo]/contents
 *
 * PURPOSE:
 * API endpoint for reading file contents from repositories.
 * Implements RA-READ-002: File Reads + Size Caps
 *
 * ENDPOINTS:
 * - GET /api/github/repositories/[owner]/[repo]/contents?path=...&ref=... - Read single file
 * - POST /api/github/repositories/[owner]/[repo]/contents - Batch read files
 *
 * AUTHENTICATION:
 * - Requires NextAuth session with GitHub OAuth token
 *
 * FEATURES:
 * - Single file reading (RA-04)
 * - Batch file reading (RA-05)
 * - Size limits enforcement (RA-06)
 * - Response caching (2 minutes)
 * - Parameter validation
 *
 * RELATED FILES:
 * - src/lib/github-reader.ts (File reading functions)
 * - src/lib/github-client.ts (GitHub API client)
 * - src/lib/security/path-policy.ts (Path validation)
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth';
import { GitHubClient } from '@/features/github';
import { readFileContent, batchReadFiles } from '@/features/github';
import { GitHubAPIError } from '@/lib/types';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const fileReadSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  path: z.string().min(1),
  ref: z.string().optional(),
});

const batchReadSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  paths: z.array(z.string().min(1)).min(1).max(50), // Max 50 files per batch
  ref: z.string().optional(),
  maxBytesPerFile: z.number().positive().optional(),
  maxTotalBytes: z.number().positive().optional(),
});

// ============================================================================
// GET ENDPOINT - Read single file
// ============================================================================

/**
 * GET /api/github/repositories/[owner]/[repo]/contents?path=...&ref=...
 *
 * Read a single file from a repository.
 * Implements RA-04: Read file content by path+ref
 *
 * Query Parameters:
 * - path: File path within repository (required)
 * - ref: Git ref (branch, tag, or SHA) (optional, defaults to default branch)
 *
 * Response: FileContent
 *
 * @param request - Next.js request object
 * @param params - Route parameters (owner, repo)
 * @returns JSON response with file content
 * @returns 401 if not authenticated
 * @returns 400 if validation fails
 * @returns 413 if file too large
 * @returns 500 if server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const resolvedParams = await params;

  try {
    // ========================================================================
    // PARAMETER VALIDATION
    // ========================================================================
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Missing required parameter: path' }, { status: 400 });
    }

    const validatedParams = fileReadSchema.parse({
      owner: resolvedParams.owner,
      repo: resolvedParams.repo,
      path,
      ref: searchParams.get('ref') || undefined,
    });

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
    const cacheKey = `file:${validatedParams.owner}:${validatedParams.repo}:${validatedParams.path}:${validatedParams.ref || 'default'}`;
    const cached = cache.get<unknown>(cacheKey);
    if (cached) {
      logger.debug('Returning cached file content', {
        owner: validatedParams.owner,
        repo: validatedParams.repo,
        path: validatedParams.path,
      });
      return NextResponse.json(cached);
    }

    // ========================================================================
    // READ FILE FROM GITHUB
    // ========================================================================
    const client = new GitHubClient({
      token: session.accessToken,
      timeout: 10000,
      retries: 2,
    });

    const fileContent = await readFileContent(
      client,
      validatedParams.owner,
      validatedParams.repo,
      validatedParams.path,
      { ref: validatedParams.ref }
    );

    // ========================================================================
    // CACHE RESPONSE
    // ========================================================================
    cache.set(cacheKey, fileContent, 2 * 60 * 1000); // 2 minutes
    logger.info('Fetched and cached file content', {
      owner: validatedParams.owner,
      repo: validatedParams.repo,
      path: validatedParams.path,
      size: fileContent.size,
    });

    return NextResponse.json(fileContent);
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('exceeds maximum')) {
      logger.warn('File size limit exceeded', error, {
        owner: resolvedParams.owner,
        repo: resolvedParams.repo,
      });
      return NextResponse.json(
        {
          error: 'File too large',
          message: error.message,
        },
        { status: 413 }
      );
    }

    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    logger.error(
      'Error reading file content',
      error instanceof Error ? error : new Error(String(error)),
      {
        owner: resolvedParams.owner,
        repo: resolvedParams.repo,
      }
    );
    return NextResponse.json(
      {
        error: 'Failed to read file content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST ENDPOINT - Batch read files
// ============================================================================

/**
 * POST /api/github/repositories/[owner]/[repo]/contents
 *
 * Batch read multiple files from a repository.
 * Implements RA-05: Batch read selected files
 * Implements RA-06: Enforce max bytes per file and total bytes per request
 *
 * Request Body:
 * - paths: Array of file paths (required, max 50)
 * - ref: Git ref (branch, tag, or SHA) (optional)
 * - maxBytesPerFile: Maximum bytes per file (optional, default 1MB)
 * - maxTotalBytes: Maximum total bytes (optional, default 10MB)
 *
 * Response: Array of FileContent
 *
 * @param request - Next.js request object
 * @param params - Route parameters (owner, repo)
 * @returns JSON response with array of file contents
 * @returns 401 if not authenticated
 * @returns 400 if validation fails
 * @returns 413 if size limits exceeded
 * @returns 500 if server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const resolvedParams = await params;

  try {
    // ========================================================================
    // REQUEST BODY PARSING
    // ========================================================================
    const body = await request.json();

    // ========================================================================
    // PARAMETER VALIDATION
    // ========================================================================
    const validatedParams = batchReadSchema.parse({
      owner: resolvedParams.owner,
      repo: resolvedParams.repo,
      ...body,
    });

    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ========================================================================
    // BATCH READ FILES FROM GITHUB
    // ========================================================================
    const client = new GitHubClient({
      token: session.accessToken,
      timeout: 15000, // Longer timeout for batch operations
      retries: 2,
    });

    const fileContents = await batchReadFiles(
      client,
      validatedParams.owner,
      validatedParams.repo,
      validatedParams.paths,
      {
        ref: validatedParams.ref,
        maxBytesPerFile: validatedParams.maxBytesPerFile,
        maxTotalBytes: validatedParams.maxTotalBytes,
      }
    );

    logger.info('Batch read files', {
      owner: validatedParams.owner,
      repo: validatedParams.repo,
      requestedFiles: validatedParams.paths.length,
      returnedFiles: fileContents.length,
      totalBytes: fileContents.reduce((sum, f) => sum + f.size, 0),
    });

    return NextResponse.json({
      files: fileContents,
      summary: {
        requested: validatedParams.paths.length,
        returned: fileContents.length,
        totalBytes: fileContents.reduce((sum, f) => sum + f.size, 0),
      },
    });
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('exceeds')) {
      logger.warn('Size limit exceeded in batch read', error, {
        owner: resolvedParams.owner,
        repo: resolvedParams.repo,
      });
      return NextResponse.json(
        {
          error: 'Size limit exceeded',
          message: error.message,
        },
        { status: 413 }
      );
    }

    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    logger.error(
      'Error in batch file read',
      error instanceof Error ? error : new Error(String(error)),
      {
        owner: resolvedParams.owner,
        repo: resolvedParams.repo,
      }
    );
    return NextResponse.json(
      {
        error: 'Failed to batch read files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
