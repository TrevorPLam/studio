/**
 * @jest-environment node
 */

/**
 * ============================================================================
 * GITHUB READER MODULE TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/github-reader.test.ts
 * @module github-reader.test
 * @epic RA-READ-001
 *
 * PURPOSE:
 * Unit tests for GitHub repository reader module.
 * Validates branch resolution, listing, and tree fetching.
 *
 * TEST COVERAGE:
 * - RA-01: Default branch resolution
 * - RA-02: Branch listing with bounds
 * - RA-03: Tree fetching with limits
 * - Error handling
 * - Pagination
 * - Bounds enforcement
 *
 * ============================================================================
 */

import {
  getRepositoryInfo,
  listBranches,
  fetchTree,
  getDefaultBranch,
  branchExists,
  type RepositoryInfo,
  type BranchInfo,
  type TreeResult,
} from '@/lib/github-reader';
import { GitHubClient } from '@/lib/github-client';
import { GitHubAPIError } from '@/lib/types';

// ============================================================================
// SECTION: MOCKS
// ============================================================================

// Mock GitHubClient
jest.mock('@/lib/github-client');

describe('GitHub Reader Module', () => {
  let mockClient: jest.Mocked<GitHubClient>;

  beforeEach(() => {
    // Create mock client
    mockClient = {
      getRepository: jest.fn(),
      octokit: {
        repos: {
          listBranches: jest.fn(),
        },
        git: {
          getTree: jest.fn(),
        },
      },
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // SECTION: RA-01 - DEFAULT BRANCH RESOLUTION
  // ==========================================================================

  describe('RA-01: getRepositoryInfo', () => {
    it('resolves repository information with default branch', async () => {
      const mockRepo = {
        owner: { login: 'test-owner' },
        name: 'test-repo',
        default_branch: 'main',
        full_name: 'test-owner/test-repo',
        description: 'Test repository',
        private: false,
        html_url: 'https://github.com/test-owner/test-repo',
      };

      mockClient.getRepository.mockResolvedValue(mockRepo);

      const result = await getRepositoryInfo(mockClient, 'test-owner', 'test-repo');

      expect(result).toEqual({
        owner: 'test-owner',
        name: 'test-repo',
        defaultBranch: 'main',
        fullName: 'test-owner/test-repo',
        description: 'Test repository',
        isPrivate: false,
        url: 'https://github.com/test-owner/test-repo',
      });
      expect(mockClient.getRepository).toHaveBeenCalledWith('test-owner', 'test-repo');
    });

    it('handles repository with develop as default branch', async () => {
      const mockRepo = {
        owner: { login: 'test-owner' },
        name: 'test-repo',
        default_branch: 'develop',
        full_name: 'test-owner/test-repo',
        description: null,
        private: true,
        html_url: 'https://github.com/test-owner/test-repo',
      };

      mockClient.getRepository.mockResolvedValue(mockRepo);

      const result = await getRepositoryInfo(mockClient, 'test-owner', 'test-repo');

      expect(result.defaultBranch).toBe('develop');
      expect(result.isPrivate).toBe(true);
      expect(result.description).toBeNull();
    });

    it('throws GitHubAPIError on repository not found', async () => {
      mockClient.getRepository.mockRejectedValue(new GitHubAPIError('Not found', 404));

      await expect(getRepositoryInfo(mockClient, 'test-owner', 'nonexistent')).rejects.toThrow(
        GitHubAPIError
      );
    });

    it('handles unknown errors', async () => {
      mockClient.getRepository.mockRejectedValue(new Error('Unknown error'));

      await expect(getRepositoryInfo(mockClient, 'test-owner', 'test-repo')).rejects.toThrow(
        GitHubAPIError
      );
    });
  });

  describe('getDefaultBranch', () => {
    it('returns default branch name', async () => {
      const mockRepo = {
        owner: { login: 'test-owner' },
        name: 'test-repo',
        default_branch: 'main',
        full_name: 'test-owner/test-repo',
        description: '',
        private: false,
        html_url: 'https://github.com/test-owner/test-repo',
      };

      mockClient.getRepository.mockResolvedValue(mockRepo);

      const branch = await getDefaultBranch(mockClient, 'test-owner', 'test-repo');

      expect(branch).toBe('main');
    });
  });

  // ==========================================================================
  // SECTION: RA-02 - BRANCH LISTING
  // ==========================================================================

  describe('RA-02: listBranches', () => {
    it('lists branches with default options', async () => {
      const mockBranches = [
        { name: 'main', commit: { sha: 'abc123' }, protected: true },
        { name: 'develop', commit: { sha: 'def456' }, protected: false },
        { name: 'feature/test', commit: { sha: 'ghi789' }, protected: false },
      ];

      mockClient.octokit.repos.listBranches.mockResolvedValue({
        data: mockBranches,
      } as any);

      const result = await listBranches(mockClient, 'test-owner', 'test-repo');

      expect(result).toEqual([
        { name: 'main', sha: 'abc123', protected: true },
        { name: 'develop', sha: 'def456', protected: false },
        { name: 'feature/test', sha: 'ghi789', protected: false },
      ]);
      expect(mockClient.octokit.repos.listBranches).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        per_page: 100,
        page: 1,
      });
    });

    it('respects perPage limit', async () => {
      mockClient.octokit.repos.listBranches.mockResolvedValue({ data: [] } as any);

      await listBranches(mockClient, 'test-owner', 'test-repo', { perPage: 50 });

      expect(mockClient.octokit.repos.listBranches).toHaveBeenCalledWith(
        expect.objectContaining({ per_page: 50 })
      );
    });

    it('enforces maximum perPage limit', async () => {
      mockClient.octokit.repos.listBranches.mockResolvedValue({ data: [] } as any);

      await listBranches(mockClient, 'test-owner', 'test-repo', { perPage: 200 });

      expect(mockClient.octokit.repos.listBranches).toHaveBeenCalledWith(
        expect.objectContaining({ per_page: 100 })
      );
    });

    it('supports pagination', async () => {
      mockClient.octokit.repos.listBranches.mockResolvedValue({ data: [] } as any);

      await listBranches(mockClient, 'test-owner', 'test-repo', { page: 2 });

      expect(mockClient.octokit.repos.listBranches).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('throws GitHubAPIError on API failure', async () => {
      mockClient.octokit.repos.listBranches.mockRejectedValue(new GitHubAPIError('Forbidden', 403));

      await expect(listBranches(mockClient, 'test-owner', 'test-repo')).rejects.toThrow(
        GitHubAPIError
      );
    });
  });

  describe('branchExists', () => {
    it('returns true if branch exists', async () => {
      const mockBranches = [
        { name: 'main', commit: { sha: 'abc123' }, protected: true },
        { name: 'develop', commit: { sha: 'def456' }, protected: false },
      ];

      mockClient.octokit.repos.listBranches.mockResolvedValue({
        data: mockBranches,
      } as any);

      const exists = await branchExists(mockClient, 'test-owner', 'test-repo', 'main');

      expect(exists).toBe(true);
    });

    it('returns false if branch does not exist', async () => {
      const mockBranches = [{ name: 'main', commit: { sha: 'abc123' }, protected: true }];

      mockClient.octokit.repos.listBranches.mockResolvedValue({
        data: mockBranches,
      } as any);

      const exists = await branchExists(mockClient, 'test-owner', 'test-repo', 'nonexistent');

      expect(exists).toBe(false);
    });

    it('returns false on API error', async () => {
      mockClient.octokit.repos.listBranches.mockRejectedValue(new Error('API error'));

      const exists = await branchExists(mockClient, 'test-owner', 'test-repo', 'main');

      expect(exists).toBe(false);
    });
  });

  // ==========================================================================
  // SECTION: RA-03 - TREE FETCHING
  // ==========================================================================

  describe('RA-03: fetchTree', () => {
    it('fetches tree without recursion', async () => {
      const mockTree = {
        sha: 'tree123',
        truncated: false,
        tree: [
          {
            path: 'README.md',
            mode: '100644',
            type: 'blob',
            sha: 'blob1',
            size: 1024,
            url: 'url1',
          },
          { path: 'src', mode: '040000', type: 'tree', sha: 'tree1', url: 'url2' },
        ],
      };

      mockClient.octokit.git.getTree.mockResolvedValue({ data: mockTree } as any);

      const result = await fetchTree(mockClient, 'test-owner', 'test-repo', 'main');

      expect(result).toEqual({
        sha: 'tree123',
        entries: [
          {
            path: 'README.md',
            mode: '100644',
            type: 'blob',
            sha: 'blob1',
            size: 1024,
            url: 'url1',
          },
          { path: 'src', mode: '040000', type: 'tree', sha: 'tree1', size: undefined, url: 'url2' },
        ],
        truncated: false,
      });
      expect(mockClient.octokit.git.getTree).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        tree_sha: 'main',
        recursive: undefined,
      });
    });

    it('fetches tree with recursion', async () => {
      const mockTree = {
        sha: 'tree123',
        truncated: false,
        tree: [
          {
            path: 'README.md',
            mode: '100644',
            type: 'blob',
            sha: 'blob1',
            size: 1024,
            url: 'url1',
          },
          {
            path: 'src/index.ts',
            mode: '100644',
            type: 'blob',
            sha: 'blob2',
            size: 2048,
            url: 'url2',
          },
        ],
      };

      mockClient.octokit.git.getTree.mockResolvedValue({ data: mockTree } as any);

      const result = await fetchTree(mockClient, 'test-owner', 'test-repo', 'main', {
        recursive: true,
      });

      expect(result.entries.length).toBe(2);
      expect(mockClient.octokit.git.getTree).toHaveBeenCalledWith(
        expect.objectContaining({ recursive: 1 })
      );
    });

    it('enforces max depth for recursive fetching', async () => {
      const mockTree = {
        sha: 'tree123',
        truncated: false,
        tree: [
          {
            path: 'a/b/c/d/e/f/file.txt',
            mode: '100644',
            type: 'blob',
            sha: 'blob1',
            size: 1024,
            url: 'url1',
          },
          {
            path: 'a/file.txt',
            mode: '100644',
            type: 'blob',
            sha: 'blob2',
            size: 1024,
            url: 'url2',
          },
        ],
      };

      mockClient.octokit.git.getTree.mockResolvedValue({ data: mockTree } as any);

      const result = await fetchTree(mockClient, 'test-owner', 'test-repo', 'main', {
        recursive: true,
        maxDepth: 3,
      });

      // Only entry with depth <= 3 should be included
      expect(result.entries).toEqual([
        { path: 'a/file.txt', mode: '100644', type: 'blob', sha: 'blob2', size: 1024, url: 'url2' },
      ]);
    });

    it('detects truncated trees', async () => {
      const mockTree = {
        sha: 'tree123',
        truncated: true,
        tree: [],
      };

      mockClient.octokit.git.getTree.mockResolvedValue({ data: mockTree } as any);

      const result = await fetchTree(mockClient, 'test-owner', 'test-repo', 'main');

      expect(result.truncated).toBe(true);
    });

    it('limits tree entries to maximum', async () => {
      // Create tree with more than MAX_TREE_ENTRIES (10000)
      const largeTree = Array.from({ length: 11000 }, (_, i) => ({
        path: `file${i}.txt`,
        mode: '100644',
        type: 'blob',
        sha: `blob${i}`,
        size: 1024,
        url: `url${i}`,
      }));

      mockClient.octokit.git.getTree.mockResolvedValue({
        data: { sha: 'tree123', truncated: false, tree: largeTree },
      } as any);

      const result = await fetchTree(mockClient, 'test-owner', 'test-repo', 'main');

      expect(result.entries.length).toBe(10000);
      expect(result.truncated).toBe(true);
    });

    it('throws GitHubAPIError on API failure', async () => {
      mockClient.octokit.git.getTree.mockRejectedValue(new GitHubAPIError('Not found', 404));

      await expect(fetchTree(mockClient, 'test-owner', 'test-repo', 'invalid')).rejects.toThrow(
        GitHubAPIError
      );
    });
  });

  // ==========================================================================
  // SECTION: ERROR HANDLING
  // ==========================================================================

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      mockClient.getRepository.mockRejectedValue(new Error('Network error'));

      await expect(getRepositoryInfo(mockClient, 'test-owner', 'test-repo')).rejects.toThrow(
        GitHubAPIError
      );
    });

    it('preserves status codes in errors', async () => {
      mockClient.getRepository.mockRejectedValue(new GitHubAPIError('Forbidden', 403));

      try {
        await getRepositoryInfo(mockClient, 'test-owner', 'test-repo');
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubAPIError);
        expect((error as GitHubAPIError).statusCode).toBe(403);
      }
    });
  });
});
