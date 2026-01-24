/**
 * ============================================================================
 * IN-MEMORY CACHE MODULE
 * ============================================================================
 * 
 * @file src/lib/cache.ts
 * @module cache
 * 
 * PURPOSE:
 * Simple in-memory cache for API responses and computed data.
 * Reduces redundant API calls and improves response times.
 * 
 * FEATURES:
 * - TTL-based expiration
 * - Automatic cleanup of expired entries
 * - Type-safe get/set operations
 * 
 * USAGE:
 * - GitHub API responses (repositories, commits)
 * - Computed data that's expensive to regenerate
 * 
 * LIMITATIONS:
 * - In-memory only (lost on restart)
 * - Single process (not shared across instances)
 * 
 * FUTURE ENHANCEMENTS:
 * - Redis integration for distributed caching
 * - Cache invalidation strategies
 * - Cache size limits and eviction policies
 * 
 * ============================================================================
 */

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Cache entry structure with TTL tracking.
 * 
 * @template T - Type of cached data
 */
interface CacheEntry<T> {
  /** Cached data */
  data: T;
  
  /** Timestamp when entry was created (milliseconds) */
  timestamp: number;
  
  /** Time-to-live in milliseconds */
  ttl: number;
}

// ============================================================================
// SECTION: CACHE CLASS
// ============================================================================

/**
 * In-memory cache implementation with TTL support.
 * 
 * Features:
 * - Automatic expiration based on TTL
 * - Periodic cleanup of expired entries
 * - Type-safe operations
 */
class Cache {
  /** Internal cache storage */
  private cache = new Map<string, CacheEntry<unknown>>();
  
  /** Default TTL: 5 minutes */
  private defaultTTL = 5 * 60 * 1000;

  /**
   * Store data in cache with optional TTL.
   * 
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time-to-live in milliseconds (default: 5 minutes)
   * 
   * @example
   * ```typescript
   * cache.set('user:123', userData, 10 * 60 * 1000); // 10 minutes
   * ```
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Retrieve data from cache.
   * 
   * Returns null if key not found or entry expired.
   * Automatically removes expired entries.
   * 
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   * 
   * @example
   * ```typescript
   * const user = cache.get<User>('user:123');
   * if (user) {
   *   // Use cached data
   * }
   * ```
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists in cache and is not expired.
   * 
   * @param key - Cache key
   * @returns true if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove entry from cache.
   * 
   * @param key - Cache key to remove
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries.
   * 
   * Removes all entries that have exceeded their TTL.
   * Called automatically by cleanup interval.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================================================
// SECTION: EXPORT & INITIALIZATION
// ============================================================================

/**
 * Singleton cache instance.
 * 
 * Use this throughout the application for caching.
 * 
 * @example
 * ```typescript
 * const cached = cache.get<Repository[]>('repos:user123');
 * if (!cached) {
 *   const repos = await fetchRepos();
 *   cache.set('repos:user123', repos, 5 * 60 * 1000);
 * }
 * ```
 */
export const cache = new Cache();

// ========================================================================
// AUTOMATIC CLEANUP
// ========================================================================
// Run cleanup every 10 minutes to remove expired entries
// Only runs in Node.js environment (not in browser)

if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 10 * 60 * 1000);
}
