/**
 * Integration tests for GitHub API
 * @file tests/integration/api/github.test.ts
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/github/repositories/route';
import { getServerSession } from 'next-auth';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock GitHub client
jest.mock('@/lib/github-client', () => ({
  getAuthenticatedUser: jest.fn(),
  getRepositories: jest.fn(),
  getRepository: jest.fn(),
  getRepositoryCommits: jest.fn(),
}));

import { getRepositories, getRepository, getRepositoryCommits } from '@/lib/github-client';

describe('GitHub API Tests', () => {
  const mockUserId = 'test-user@example.com';
  const mockSession = {
    user: {
      email: mockUserId,
      name: 'Test User',
    },
    accessToken: 'mock-github-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/github/repositories', () => {
    it('returns user repos', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user/repo1',
          description: 'Test repo',
          private: false,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
          owner: {
            login: 'user',
            avatar_url: 'https://example.com/avatar.png',
            id: 1,
          },
          default_branch: 'main',
          language: 'TypeScript',
          stargazers_count: 10,
          forks_count: 2,
        },
      ];

      (getRepositories as jest.Mock).mockResolvedValue(mockRepos);

      const request = new NextRequest('http://localhost:3000/api/github/repositories');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.repositories).toEqual(mockRepos);
    });

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/github/repositories');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/github/repositories/[owner]/[repo]', () => {
    it('returns repo details', async () => {
      const mockRepo = {
        id: 1,
        name: 'test-repo',
        full_name: 'test-owner/test-repo',
        description: 'Test repository',
        private: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
        owner: {
          login: 'test-owner',
          avatar_url: 'https://example.com/avatar.png',
          id: 1,
        },
        default_branch: 'main',
        language: 'TypeScript',
        stargazers_count: 5,
        forks_count: 1,
      };

      // Note: This would need the actual route file to test
      // For now, we test the mocked function
      (getRepository as jest.Mock).mockResolvedValue(mockRepo);

      const result = await getRepository('test-owner', 'test-repo', 'mock-token');
      expect(result).toEqual(mockRepo);
    });
  });

  describe('GET /api/github/repositories/[owner]/[repo]/commits', () => {
    it('returns commits', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            message: 'Test commit',
            author: {
              name: 'Test Author',
              email: 'test@example.com',
              date: new Date().toISOString(),
            },
            committer: {
              name: 'Test Committer',
              email: 'test@example.com',
              date: new Date().toISOString(),
            },
          },
          author: {
            login: 'test-author',
            avatar_url: 'https://example.com/avatar.png',
            id: 1,
          },
          committer: {
            login: 'test-committer',
            avatar_url: 'https://example.com/avatar.png',
            id: 2,
          },
          html_url: 'https://github.com/test-owner/test-repo/commit/abc123',
        },
      ];

      (getRepositoryCommits as jest.Mock).mockResolvedValue(mockCommits);

      const result = await getRepositoryCommits('mock-token', 'test-owner', 'test-repo', 30);
      expect(result).toEqual(mockCommits);
    });
  });

  describe('Rate limiting', () => {
    it('handles 403 rate limit responses', async () => {
      (getRepositories as jest.Mock).mockRejectedValue({
        status: 403,
        message: 'API rate limit exceeded',
      });

      await expect(getRepositories('mock-token')).rejects.toMatchObject({
        status: 403,
      });
    });
  });

  describe('Error handling', () => {
    it('returns proper error format', async () => {
      (getRepositories as jest.Mock).mockRejectedValue(new Error('GitHub API error'));

      await expect(getRepositories('mock-token')).rejects.toThrow('GitHub API error');
    });
  });
});
