/**
 * ============================================================================
 * NEXT.JS MIDDLEWARE
 * ============================================================================
 *
 * @file middleware.ts
 * @module middleware
 * @epic BP-SEC-003
 *
 * PURPOSE:
 * Next.js middleware for rate limiting and security headers.
 * Runs on every request before it reaches API routes or pages.
 *
 * DEPENDENCIES:
 * - @/lib/middleware/rate-limit (Rate limiting logic)
 *
 * RELATED FILES:
 * - src/lib/middleware/rate-limit.ts (Rate limiting implementation)
 * - All API routes (protected by middleware)
 *
 * FEATURES:
 * - Rate limiting for API routes
 * - Rate limit headers in responses
 * - 429 status code when rate limit exceeded
 *
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';

/**
 * Middleware function that runs on every request.
 *
 * @param request - Next.js request object
 * @returns Response or undefined to continue
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting for NextAuth routes (they have their own protection)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Check rate limit
  const rateLimitResult = checkRateLimit(request, pathname);

  // If rate limit exceeded, return 429
  if (!rateLimitResult.allowed) {
    const headers = getRateLimitHeaders(rateLimitResult);

    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: rateLimitResult.reset - Math.floor(Date.now() / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': (rateLimitResult.reset - Math.floor(Date.now() / 1000)).toString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  const headers = getRateLimitHeaders(rateLimitResult);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Middleware matcher - only run on API routes.
 */
export const config = {
  matcher: ['/api/:path*'],
};
