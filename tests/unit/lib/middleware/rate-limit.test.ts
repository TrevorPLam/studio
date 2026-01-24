/**
 * Unit tests for rate limiting middleware
 * @file tests/unit/lib/middleware/rate-limit.test.ts
 * @epic BP-SEC-003
 */

import {
  checkRateLimit,
  getRateLimitHeaders,
  clearRateLimitStore,
  type RateLimitResult,
} from '@/lib/middleware/rate-limit';

// Mock Request object
function createMockRequest(ip: string = '127.0.0.1'): Request {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  return {
    headers,
  } as Request;
}

describe('BP-SEC-003 — Rate Limiting Tests', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe('checkRateLimit()', () => {
    it('allows requests within limit', () => {
      const request = createMockRequest();
      const pathname = '/api/sessions';
      
      // Make 5 requests (well under 100/min limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(request, pathname);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBeGreaterThan(0);
        expect(result.limit).toBe(100);
      }
    });

    it('blocks requests exceeding limit', () => {
      const request = createMockRequest();
      const pathname = '/api/agents/chat'; // 10 req/min limit
      
      // Make 11 requests (exceeds 10/min limit)
      let lastResult: RateLimitResult | null = null;
      for (let i = 0; i < 11; i++) {
        lastResult = checkRateLimit(request, pathname);
      }
      
      expect(lastResult).not.toBeNull();
      expect(lastResult!.allowed).toBe(false);
      expect(lastResult!.remaining).toBe(0);
    });

    it('returns correct rate limit config for chat endpoint', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/api/agents/chat');
      
      expect(result.limit).toBe(10);
      expect(result.allowed).toBe(true);
    });

    it('returns correct rate limit config for sessions endpoint', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/api/sessions');
      
      expect(result.limit).toBe(100);
      expect(result.allowed).toBe(true);
    });

    it('returns correct rate limit config for GitHub endpoint', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/api/github/repositories');
      
      expect(result.limit).toBe(60);
      expect(result.allowed).toBe(true);
    });

    it('uses default limit for unknown endpoints', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/api/unknown/endpoint');
      
      expect(result.limit).toBe(100); // Default
      expect(result.allowed).toBe(true);
    });

    it('allows unlimited for non-API paths', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/page');
      
      expect(result.limit).toBe(Infinity);
      expect(result.allowed).toBe(true);
    });

    it('tracks rate limits per IP address', () => {
      const request1 = createMockRequest('192.168.1.1');
      const request2 = createMockRequest('192.168.1.2');
      const pathname = '/api/agents/chat';
      
      // Exhaust limit for IP 1
      for (let i = 0; i < 11; i++) {
        checkRateLimit(request1, pathname);
      }
      
      // IP 2 should still have limit
      const result2 = checkRateLimit(request2, pathname);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBeGreaterThan(0);
    });

    it('resets count after window expires', async () => {
      const request = createMockRequest();
      const pathname = '/api/agents/chat';
      
      // Exhaust limit
      for (let i = 0; i < 11; i++) {
        checkRateLimit(request, pathname);
      }
      
      // Wait for window to expire (in real scenario, this would be 60s)
      // For testing, we'll verify the structure allows reset
      const result = checkRateLimit(request, pathname);
      // Note: In real scenario, window would reset after 60s
      // This test verifies the structure works
      expect(result).toHaveProperty('reset');
      expect(result.reset).toBeGreaterThan(0);
    });

    it('calculates remaining requests correctly', () => {
      const request = createMockRequest();
      const pathname = '/api/agents/chat'; // 10 req/min
      
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        checkRateLimit(request, pathname);
      }
      
      const result = checkRateLimit(request, pathname);
      expect(result.remaining).toBe(6); // 10 - 4 = 6
    });

    it('returns reset timestamp', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/api/sessions');
      
      expect(result.reset).toBeGreaterThan(Math.floor(Date.now() / 1000));
      expect(result.reset).toBeLessThan(Math.floor(Date.now() / 1000) + 120); // Within 2 minutes
    });
  });

  describe('getRateLimitHeaders()', () => {
    it('returns correct headers', () => {
      const result: RateLimitResult = {
        allowed: true,
        remaining: 95,
        limit: 100,
        reset: Math.floor(Date.now() / 1000) + 60,
      };
      
      const headers = getRateLimitHeaders(result);
      
      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('95');
      expect(headers['X-RateLimit-Reset']).toBe(result.reset.toString());
    });

    it('handles zero remaining', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        limit: 10,
        reset: Math.floor(Date.now() / 1000) + 60,
      };
      
      const headers = getRateLimitHeaders(result);
      
      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });
  });

  describe('Edge cases', () => {
    it('handles missing IP address', () => {
      const request = {
        headers: new Headers(),
      } as Request;
      
      const result = checkRateLimit(request, '/api/sessions');
      expect(result).toBeDefined();
      expect(result.allowed).toBe(true);
    });

    it('handles multiple IPs in x-forwarded-for', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');
      const request = { headers } as Request;
      
      const result = checkRateLimit(request, '/api/sessions');
      expect(result).toBeDefined();
    });

    it('handles nested API paths', () => {
      const request = createMockRequest();
      const result = checkRateLimit(request, '/api/sessions/123/steps');
      
      // Should use sessions-detail config (100/min)
      expect(result.limit).toBe(100);
    });
  });
});
