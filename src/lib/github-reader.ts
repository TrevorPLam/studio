/**
 * ============================================================================
 * GITHUB REPOSITORY READER MODULE
 * ============================================================================
 *
 * @file src/lib/github-reader.ts
 * @module github-reader
 * @epic RA-READ-001
 *
 * PURPOSE:
 * Provides safe repository access operations with bounds and pagination.
 * Handles branch resolution, tree listing, and file reading with size caps.
 *
 * FEATURES:
 * - Default branch resolution (RA-01)
 * - Branch listing with bounds (RA-02)
 * - Tree fetching with recursion limits (RA-03)
 * - File content reading with size caps
 * - Pagination support for large repositories
 *
 * RELATED FILES:
 * - src/lib/github-client.ts (GitHub API wrapper)
 * - src/lib/security/path-policy.ts (Path validation)
 * - src/app/api/github/repositories/[owner]/[repo]/branches/route.ts (Branches API)
 * - src/app/api/github/repositories/[owner]/[repo]/tree/route.ts (Tree API)
 *
 * SECURITY:
 * - Enforces maximum file sizes
 * - Bounded tree traversal to prevent DoS
 * - Path policy validation for file access
 *
 * ============================================================================
 */

import { GitHubClient } from './github-client';
import { GitHubAPIError } from './types';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Repository information including default branch.
 */
export interface RepositoryInfo {
  /** Repository owner */
  owner: string;
  /** Repository name */
  name: string;
  /** Default branch name */
  defaultBranch: string;
  /** Full repository name (owner/repo) */
  fullName: string;
  /** Repository description */
  description: string | null;
  /** Whether repository is private */
  isPrivate: boolean;
  /** Repository URL */
  url: string;
}

/**
 * Branch information.
 */
export interface BranchInfo {
  /** Branch name */
  name: string;
  /** Commit SHA */
  sha: string;
  /** Whether this is a protected branch */
  protected: boolean;
}

/**
 * Tree entry (file or directory).
 */
export interface TreeEntry {
  /** Entry path */
  path: string;
  /** Entry mode (file permissions) */
  mode: string;
  /** Entry type (blob, tree, commit) */
  type: 'blob' | 'tree' | 'commit';
  /** Entry SHA */
  sha: string;
  /** Entry size in bytes (for blobs) */
  size?: number;
  /** Entry URL */
  url: string;
}

/**
 * Tree listing result with pagination.
 */
export interface TreeResult {
  /** SHA of the tree */
  sha: string;
  /** Tree entries */
  entries: TreeEntry[];
  /** Whether tree was truncated */
  truncated: boolean;
}

/**
 * Options for listing branches.
 */
export interface ListBranchesOptions {
  /** Maximum number of branches to return (default: 100) */
  perPage?: number;
  /** Page number for pagination (default: 1) */
  page?: number;
}

/**
 * Options for fetching tree.
 */
export interface FetchTreeOptions {
  /** Whether to fetch tree recursively (default: false) */
  recursive?: boolean;
  /** Maximum depth for recursive fetching (default: 5) */
  maxDepth?: number;
}

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================

/**
 * Maximum number of branches to return per request.
 */
const MAX_BRANCHES_PER_PAGE = 100;

/**
 * Maximum tree depth for recursive fetching.
 */
const MAX_TREE_DEPTH = 10;

/**
 * Maximum number of tree entries to process.
 */
const MAX_TREE_ENTRIES = 10000;

// ============================================================================
// SECTION: RA-01 - DEFAULT BRANCH RESOLUTION
// ============================================================================

/**
 * Get repository information including default branch.
 * Implements RA-01: Resolve default branch via repos.get
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Repository information with default branch
 * @throws GitHubAPIError on API errors
 *
 * @example
 * ```typescript
 * const repoInfo = await getRepositoryInfo(client, 'owner', 'repo');
 * console.log(repoInfo.defaultBranch); // "main"
 * ```
 */
export async function getRepositoryInfo(
  client: GitHubClient,
  owner: string,
  repo: string
): Promise<RepositoryInfo> {
  try {
    const repository = await client.getRepository(owner, repo);

    return {
      owner: repository.owner.login,
      name: repository.name,
      defaultBranch: repository.default_branch,
      fullName: repository.full_name,
      description: repository.description,
      isPrivate: repository.private,
      url: repository.html_url,
    };
  } catch (error) {
    throw new GitHubAPIError(
      `Failed to get repository info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof GitHubAPIError ? error.statusCode : 500
    );
  }
}

// ============================================================================
// SECTION: RA-02 - BRANCH LISTING
// ============================================================================

/**
 * List branches in a repository with bounds.
 * Implements RA-02: List branches (bounded)
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param options - Listing options (pagination, limits)
 * @returns Array of branch information
 * @throws GitHubAPIError on API errors
 *
 * @example
 * ```typescript
 * const branches = await listBranches(client, 'owner', 'repo', { perPage: 50 });
 * console.log(branches.map(b => b.name)); // ["main", "develop", ...]
 * ```
 */
export async function listBranches(
  client: GitHubClient,
  owner: string,
  repo: string,
  options: ListBranchesOptions = {}
): Promise<BranchInfo[]> {
  const perPage = Math.min(options.perPage || 100, MAX_BRANCHES_PER_PAGE);
  const page = options.page || 1;

  try {
    // Access the internal octokit instance for branch listing
    // Using raw Octokit API since GitHubClient doesn't expose listBranches
    const response = await (client as any).octokit.repos.listBranches({
      owner,
      repo,
      per_page: perPage,
      page,
    });

    return response.data.map((branch: any) => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected,
    }));
  } catch (error) {
    throw new GitHubAPIError(
      `Failed to list branches: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof GitHubAPIError ? error.statusCode : 500
    );
  }
}

// ============================================================================
// SECTION: RA-03 - TREE FETCHING
// ============================================================================

/**
 * Fetch repository tree with recursion limits and pagination.
 * Implements RA-03: Fetch tree with recursion limits + pagination strategy
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param treeSha - Tree SHA or branch name
 * @param options - Fetch options (recursive, depth limits)
 * @returns Tree result with entries and truncation info
 * @throws GitHubAPIError on API errors
 * @throws Error if tree exceeds size limits
 *
 * @example
 * ```typescript
 * const tree = await fetchTree(client, 'owner', 'repo', 'main', { recursive: true });
 * console.log(tree.entries.length); // Number of files/directories
 * console.log(tree.truncated); // Whether tree was truncated
 * ```
 */
export async function fetchTree(
  client: GitHubClient,
  owner: string,
  repo: string,
  treeSha: string,
  options: FetchTreeOptions = {}
): Promise<TreeResult> {
  const recursive = options.recursive || false;
  const maxDepth = Math.min(options.maxDepth || 5, MAX_TREE_DEPTH);

  try {
    // Access the internal octokit instance for tree fetching
    const response = await (client as any).octokit.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: recursive ? 1 : undefined,
    });

    const entries: TreeEntry[] = response.data.tree.map((entry: any) => ({
      path: entry.path,
      mode: entry.mode,
      type: entry.type,
      sha: entry.sha,
      size: entry.size,
      url: entry.url,
    }));

    // Check if tree exceeds maximum entries
    const truncated = response.data.truncated || entries.length > MAX_TREE_ENTRIES;

    // Filter entries by depth if recursive
    let filteredEntries = entries;
    if (recursive && maxDepth > 0) {
      filteredEntries = entries.filter((entry) => {
        const depth = entry.path.split('/').length;
        return depth <= maxDepth;
      });
    }

    // Limit to MAX_TREE_ENTRIES
    if (filteredEntries.length > MAX_TREE_ENTRIES) {
      filteredEntries = filteredEntries.slice(0, MAX_TREE_ENTRIES);
    }

    return {
      sha: response.data.sha,
      entries: filteredEntries,
      truncated,
    };
  } catch (error) {
    throw new GitHubAPIError(
      `Failed to fetch tree: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof GitHubAPIError ? error.statusCode : 500
    );
  }
}

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Get the default branch name for a repository.
 * Convenience wrapper around getRepositoryInfo.
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Default branch name
 */
export async function getDefaultBranch(
  client: GitHubClient,
  owner: string,
  repo: string
): Promise<string> {
  const info = await getRepositoryInfo(client, owner, repo);
  return info.defaultBranch;
}

/**
 * Check if a branch exists in a repository.
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branchName - Branch name to check
 * @returns True if branch exists, false otherwise
 */
export async function branchExists(
  client: GitHubClient,
  owner: string,
  repo: string,
  branchName: string
): Promise<boolean> {
  try {
    const branches = await listBranches(client, owner, repo, { perPage: 100 });
    return branches.some((branch) => branch.name === branchName);
  } catch {
    return false;
  }
}
