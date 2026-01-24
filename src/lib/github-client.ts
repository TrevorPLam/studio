import { Octokit } from '@octokit/rest';
import { GitHubAPIError } from './types';

export interface GitHubClientOptions {
  token: string;
  timeout?: number;
  retries?: number;
}

export class GitHubClient {
  private octokit: Octokit;
  private retries: number;

  constructor(options: GitHubClientOptions) {
    this.retries = options.retries ?? 3;
    this.octokit = new Octokit({
      auth: options.token,
      request: {
        timeout: options.timeout ?? 10000, // 10 seconds default
      },
    });
  }

  private async handleRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fn();
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Handle rate limiting
        if (error.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = parseInt(error.response.headers['x-ratelimit-reset'] || '0', 10);
          const waitTime = Math.max(0, resetTime * 1000 - Date.now());
          
          if (waitTime > 0 && attempt < this.retries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          throw new GitHubAPIError(
            'GitHub API rate limit exceeded',
            403,
            0,
            resetTime
          );
        }
        
        // Retry on 5xx errors
        if (error.status >= 500 && attempt < this.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError || new Error('Unknown error occurred');
  }

  async getRepositories(sort: 'updated' | 'created' | 'pushed' = 'updated', perPage: number = 100) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort,
        per_page: perPage,
      });
      return data;
    });
  }

  async getRepository(owner: string, repo: string) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });
      return data;
    });
  }

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

  async getAuthenticatedUser() {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.users.getAuthenticated();
      return data;
    });
  }

  // Get rate limit status
  async getRateLimit() {
    const { data } = await this.octokit.rateLimit.get();
    return data;
  }
}

// Backward compatibility - keep the old functions
export function createGitHubClient(token: string) {
  return new GitHubClient({ token });
}

export async function getRepositories(token: string) {
  const client = new GitHubClient({ token });
  return client.getRepositories();
}

export async function getRepository(token: string, owner: string, repo: string) {
  const client = new GitHubClient({ token });
  return client.getRepository(owner, repo);
}

export async function getRepositoryCommits(token: string, owner: string, repo: string, perPage: number = 30) {
  const client = new GitHubClient({ token });
  return client.getRepositoryCommits(owner, repo, perPage);
}

export async function getRepositoryContents(token: string, owner: string, repo: string, path: string = '') {
  const client = new GitHubClient({ token });
  return client.getRepositoryContents(owner, repo, path);
}

export async function getAuthenticatedUser(token: string) {
  const client = new GitHubClient({ token });
  return client.getAuthenticatedUser();
}
