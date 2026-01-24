/**
 * ============================================================================
 * GITHUB API CLIENT MODULE
 * ============================================================================
 *
 * @file src/lib/github-client.ts
 * @module github-client
 *
 * PURPOSE:
 * GitHub API client wrapper with rate limit handling, retry logic, and error management.
 * Provides type-safe methods for common GitHub API operations.
 *
 * DEPENDENCIES:
 * - @octokit/rest (GitHub REST API client)
 * - @/lib/types (GitHubAPIError)
 *
 * RELATED FILES:
 * - src/lib/github-app.ts (GitHub App authentication)
 * - src/app/api/github/repositories/route.ts (Uses GitHubClient)
 * - src/lib/types.ts (GitHub API types)
 *
 * FEATURES:
 * - Automatic rate limit handling with wait-and-retry
 * - Retry logic for 5xx errors
 * - Configurable timeout and retry count
 * - Type-safe API responses
 *
 * ============================================================================
 */

import { Octokit } from '@octokit/rest';
import { GitHubAPIError } from './types';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Options for GitHubClient initialization.
 */
export interface GitHubClientOptions {
  /** GitHub OAuth token or installation token */
  token: string;

  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;

  /** Number of retry attempts (default: 3) */
  retries?: number;
}

// ============================================================================
// SECTION: GITHUB CLIENT CLASS
// ============================================================================

/**
 * GitHub API client with rate limit and error handling.
 *
 * Features:
 * - Automatic rate limit detection and waiting
 * - Exponential backoff for 5xx errors
 * - Configurable retry attempts
 * - Request timeout protection
 */
export class GitHubClient {
  /** Octokit instance for API calls */
  private octokit: Octokit;

  /** Number of retry attempts */
  private retries: number;

  /**
   * Initialize GitHub client.
   *
   * @param options - Client configuration options
   */
  constructor(options: GitHubClientOptions) {
    this.retries = options.retries ?? 3;
    this.octokit = new Octokit({
      auth: options.token,
      request: {
        timeout: options.timeout ?? 10000, // 10 seconds default
      },
    });
  }

  /**
   * Handle rate limits and retries for API calls.
   *
   * Strategy:
   * - Rate limit (403): Wait until reset time, then retry
   * - 5xx errors: Exponential backoff retry
   * - Other errors: Throw immediately
   *
   * @param fn - Function to execute with retry logic
   * @returns API response data
   * @throws GitHubAPIError for rate limit errors
   */
  private async handleRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fn();
        return response;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Type guard for Octokit API errors
        const isOctokitError = (
          err: unknown
        ): err is {
          status: number;
          response?: {
            headers: Record<string, string | undefined>;
          };
        } => {
          return (
            typeof err === 'object' &&
            err !== null &&
            'status' in err &&
            typeof (err as { status: unknown }).status === 'number'
          );
        };

        if (!isOctokitError(error)) {
          throw error;
        }

        // ====================================================================
        // RATE LIMIT HANDLING
        // ====================================================================
        // If rate limited, wait until reset time and retry
        if (error.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = parseInt(error.response.headers['x-ratelimit-reset'] || '0', 10);
          const waitTime = Math.max(0, resetTime * 1000 - Date.now());

          if (waitTime > 0 && attempt < this.retries) {
            // Wait until rate limit resets
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }

          // Rate limit exceeded, throw error
          throw new GitHubAPIError('GitHub API rate limit exceeded', 403, 0, resetTime);
        }

        // ====================================================================
        // RETRY ON 5XX ERRORS
        // ====================================================================
        // Exponential backoff: 1s, 2s, 3s, etc.
        if (error.status >= 500 && attempt < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        // Other errors: throw immediately
        throw error;
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }

  // ==========================================================================
  // SECTION: REPOSITORY METHODS
  // ==========================================================================

  /**
   * Get list of repositories for authenticated user.
   *
   * @param sort - Sort order (default: 'updated')
   * @param perPage - Results per page (default: 100, max: 100)
   * @returns Array of repository objects
   *
   * @see GitHub REST API: GET /user/repos
   */
  async getRepositories(sort: 'updated' | 'created' | 'pushed' = 'updated', perPage: number = 100) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort,
        per_page: perPage,
      });
      return data;
    });
  }

  /**
   * Get repository details.
   *
   * @param owner - Repository owner (username or org)
   * @param repo - Repository name
   * @returns Repository object
   *
   * @see GitHub REST API: GET /repos/{owner}/{repo}
   */
  async getRepository(owner: string, repo: string) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });
      return data;
    });
  }

  /**
   * Get repository commits.
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param perPage - Results per page (default: 30)
   * @returns Array of commit objects
   *
   * @see GitHub REST API: GET /repos/{owner}/{repo}/commits
   */
  async getRepositoryCommits(owner: string, repo: string, perPage: number = 30) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.repos.listCommits({
        owner,
        repo,
        per_page: perPage,
      });
      return data;
    });
  }

  /**
   * Get repository contents (files/directories).
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - File or directory path (default: root)
   * @returns File or directory contents
   *
   * @see GitHub REST API: GET /repos/{owner}/{repo}/contents/{path}
   */
  async getRepositoryContents(owner: string, repo: string, path: string = '') {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      return data;
    });
  }

  // ==========================================================================
  // SECTION: USER METHODS
  // ==========================================================================

  /**
   * Get authenticated user information.
   *
   * @returns User object
   *
   * @see GitHub REST API: GET /user
   */
  async getAuthenticatedUser() {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.users.getAuthenticated();
      return data;
    });
  }

  // ==========================================================================
  // SECTION: RATE LIMIT METHODS
  // ==========================================================================

  /**
   * Get current rate limit status.
   *
   * @returns Rate limit information
   *
   * @see GitHub REST API: GET /rate_limit
   */
  async getRateLimit() {
    const { data } = await this.octokit.rateLimit.get();
    return data;
  }
}

// ============================================================================
// SECTION: BACKWARD COMPATIBILITY FUNCTIONS
// ============================================================================
// Legacy function exports for backward compatibility
// New code should use GitHubClient class directly

/**
 * Create GitHub client instance (legacy function).
 *
 * @deprecated Use `new GitHubClient({ token })` instead
 * @param token - GitHub OAuth token
 * @returns GitHubClient instance
 */
export function createGitHubClient(token: string) {
  return new GitHubClient({ token });
}

/**
 * Get repositories (legacy function).
 *
 * @deprecated Use GitHubClient class instead
 */
export async function getRepositories(token: string) {
  const client = new GitHubClient({ token });
  return client.getRepositories();
}

/**
 * Get repository (legacy function).
 *
 * @deprecated Use GitHubClient class instead
 */
export async function getRepository(token: string, owner: string, repo: string) {
  const client = new GitHubClient({ token });
  return client.getRepository(owner, repo);
}

/**
 * Get repository commits (legacy function).
 *
 * @deprecated Use GitHubClient class instead
 */
export async function getRepositoryCommits(
  token: string,
  owner: string,
  repo: string,
  perPage: number = 30
) {
  const client = new GitHubClient({ token });
  return client.getRepositoryCommits(owner, repo, perPage);
}

/**
 * Get repository contents (legacy function).
 *
 * @deprecated Use GitHubClient class instead
 */
export async function getRepositoryContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ''
) {
  const client = new GitHubClient({ token });
  return client.getRepositoryContents(owner, repo, path);
}

/**
 * Get authenticated user (legacy function).
 *
 * @deprecated Use GitHubClient class instead
 */
export async function getAuthenticatedUser(token: string) {
  const client = new GitHubClient({ token });
  return client.getAuthenticatedUser();
}
