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
import {
  generateRequestId,
  withCorrelationContext,
  type CorrelationContext,
} from '@/lib/observability/correlation';

/**
 * Middleware function that runs on every request.
 *
 * Sets up correlation context (requestId) and applies rate limiting.
 *
 * @param request - Next.js request object
 * @returns Response or undefined to continue
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate request ID for correlation
  const requestId = generateRequestId();
  const correlationContext: CorrelationContext = {
    requestId,
  };

  // Extract webhook delivery ID from headers if present (GitHub webhooks)
  const deliveryId = request.headers.get('x-github-delivery');
  if (deliveryId) {
    correlationContext.deliveryId = deliveryId;
  }

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api/')) {
    // Still add correlation header for non-API routes
    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestId);
    return withCorrelationContext(correlationContext, () => response);
  }

  // Skip rate limiting for NextAuth routes (they have their own protection)
  if (pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestId);
    return withCorrelationContext(correlationContext, () => response);
  }

  // Check rate limit within correlation context
  return withCorrelationContext(correlationContext, () => {
    const rateLimitResult = checkRateLimit(request, pathname);

    // If rate limit exceeded, return 429
    if (!rateLimitResult.allowed) {
      const headers = getRateLimitHeaders(rateLimitResult);

      const response = NextResponse.json(
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
            'X-Request-ID': requestId,
          },
        }
      );

      return response;
    }

    // Add rate limit headers and correlation ID to response
    const response = NextResponse.next();
    const headers = getRateLimitHeaders(rateLimitResult);

    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
    response.headers.set('X-Request-ID', requestId);

    return response;
  });
}

/**
 * Middleware matcher - only run on API routes.
 */
export const config = {
  matcher: ['/api/:path*'],
};
