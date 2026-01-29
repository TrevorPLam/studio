/**
 * ============================================================================
 * RATE LIMITING MIDDLEWARE
 * ============================================================================
 *
 * @file src/lib/middleware/rate-limit.ts
 * @module rate-limit
 * @epic BP-SEC-003
 *
 * PURPOSE:
 * Rate limiting middleware to prevent DDoS attacks and resource exhaustion.
 * Provides per-endpoint rate limiting with configurable limits.
 *
 * DEPENDENCIES:
 * - @/lib/logger (Structured logging)
 *
 * RELATED FILES:
 * - middleware.ts (Next.js middleware integration)
 * - All API routes (protected by rate limiting)
 *
 * FEATURES:
 * - Per-endpoint rate limits
 * - Rate limit headers in responses
 * - 429 status code when exceeded
 * - Logging for monitoring
 * - In-memory storage (can be extended to Redis/Upstash)
 *
 * ============================================================================
 */

import { logger } from '@/lib/logger';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Rate limit configuration for an endpoint.
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in seconds */
  window: number;
  /** Identifier for the endpoint (for logging) */
  identifier: string;
}

/**
 * Rate limit result.
 */
export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Total limit */
  limit: number;
  /** Unix timestamp when the rate limit resets */
  reset: number;
}

/**
 * Rate limit entry in storage.
 */
interface RateLimitEntry {
  /** Number of requests in current window */
  count: number;
  /** Window start timestamp (Unix seconds) */
  windowStart: number;
}

// ============================================================================
// SECTION: RATE LIMIT STORAGE
// ============================================================================

/**
 * In-memory rate limit storage.
 *
 * Key format: `${identifier}:${key}`
 *
 * In production, this should be replaced with Redis or Upstash for:
 * - Distributed rate limiting across instances
 * - Persistence across restarts
 * - Better performance at scale
 */
class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  /**
   * Clean up expired entries periodically.
   */
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  /**
   * Get current count for a key.
   */
  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  /**
   * Set count for a key.
   */
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  /**
   * Increment count for a key, creating entry if it doesn't exist.
   */
  increment(key: string, windowStart: number): number {
    const entry = this.store.get(key);
    if (!entry || entry.windowStart !== windowStart) {
      // New window or new key
      this.store.set(key, { count: 1, windowStart });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  /**
   * Remove expired entries.
   */
  private cleanup(): void {
    const now = Math.floor(Date.now() / 1000);
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      // Remove entries older than 1 hour (safety margin)
      if (now - entry.windowStart > 3600) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.store.delete(key);
    }
  }

  /**
   * Clear all entries (for testing).
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup on destroy.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton store instance
const store = new RateLimitStore();

// ============================================================================
// SECTION: RATE LIMIT CONFIGURATION
// ============================================================================

/**
 * Default rate limit configurations per endpoint pattern.
 *
 * Format: endpoint pattern -> rate limit config
 */
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Chat endpoints - more restrictive (AI processing is expensive)
  '/api/agents/chat': {
    limit: 10,
    window: 60, // 10 requests per minute
    identifier: 'chat',
  },
  '/api/agents/chat-stream': {
    limit: 10,
    window: 60, // 10 requests per minute
    identifier: 'chat-stream',
  },

  // Session endpoints - moderate limits
  '/api/sessions': {
    limit: 100,
    window: 60, // 100 requests per minute
    identifier: 'sessions',
  },
  '/api/sessions/': {
    limit: 100,
    window: 60, // 100 requests per minute
    identifier: 'sessions-detail',
  },

  // GitHub endpoints - moderate limits (external API calls)
  '/api/github/repositories': {
    limit: 60,
    window: 60, // 60 requests per minute
    identifier: 'github-repos',
  },
  '/api/github/repositories/': {
    limit: 60,
    window: 60, // 60 requests per minute
    identifier: 'github-repo-detail',
  },

  // Default for all other API routes
  '/api/': {
    limit: 100,
    window: 60, // 100 requests per minute
    identifier: 'api-default',
  },
};

/**
 * Get rate limit configuration for a path.
 *
 * @param pathname - Request pathname
 * @returns Rate limit configuration or null if no limit
 */
function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  // Check exact matches first
  if (RATE_LIMIT_CONFIGS[pathname]) {
    return RATE_LIMIT_CONFIGS[pathname];
  }

  // Check prefix matches (longest first)
  const sortedKeys = Object.keys(RATE_LIMIT_CONFIGS)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length);

  if (sortedKeys.length > 0) {
    return RATE_LIMIT_CONFIGS[sortedKeys[0]];
  }

  return null;
}

// ============================================================================
// SECTION: RATE LIMIT LOGIC
// ============================================================================

/**
 * Get identifier for rate limiting (IP address or user ID).
 *
 * @param request - Next.js request object
 * @returns Identifier string
 */
function getRateLimitKey(request: Request, identifier: string): string {
  // Try to get IP address from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

  return `${identifier}:${ip}`;
}

/**
 * Check rate limit for a request.
 *
 * @param request - Next.js request object
 * @param pathname - Request pathname
 * @returns Rate limit result
 */
export function checkRateLimit(request: Request, pathname: string): RateLimitResult {
  const config = getRateLimitConfig(pathname);

  // No rate limit configured for this endpoint
  if (!config) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }

  const key = getRateLimitKey(request, config.identifier);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / config.window) * config.window;

  // Get or create entry
  const entry = store.get(key);

  if (!entry || entry.windowStart !== windowStart) {
    // New window - start counting
    const count = store.increment(key, windowStart);
    return {
      allowed: count <= config.limit,
      remaining: Math.max(0, config.limit - count),
      limit: config.limit,
      reset: windowStart + config.window,
    };
  }

  // Existing window - increment
  const count = store.increment(key, windowStart);
  const allowed = count <= config.limit;

  // Log rate limit violations
  if (!allowed) {
    logger.warn('Rate limit exceeded', {
      identifier: config.identifier,
      pathname,
      limit: config.limit,
      window: config.window,
      key: key.replace(/:\d+\.\d+\.\d+\.\d+$/, ':REDACTED'), // Redact IP for privacy
    });
  }

  return {
    allowed,
    remaining: Math.max(0, config.limit - count),
    limit: config.limit,
    reset: windowStart + config.window,
  };
}

/**
 * Get rate limit headers for response.
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Clear rate limit store (for testing).
 */
export function clearRateLimitStore(): void {
  store.clear();
}
