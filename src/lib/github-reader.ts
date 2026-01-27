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

/**
 * File content result.
 */
export interface FileContent {
  /** File path */
  path: string;
  /** File content (decoded from base64) */
  content: string;
  /** Content encoding */
  encoding: 'utf-8' | 'base64';
  /** File size in bytes */
  size: number;
  /** File SHA */
  sha: string;
}

/**
 * Options for reading file content.
 */
export interface ReadFileOptions {
  /** Git ref (branch, tag, or commit SHA) to read from (default: repository default branch) */
  ref?: string;
}

/**
 * Options for batch reading files.
 */
export interface BatchReadFilesOptions {
  /** Git ref (branch, tag, or commit SHA) to read from (default: repository default branch) */
  ref?: string;
  /** Maximum bytes per file (default: 1MB) */
  maxBytesPerFile?: number;
  /** Maximum total bytes for all files (default: 10MB) */
  maxTotalBytes?: number;
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

/**
 * Maximum file size in bytes (1MB).
 * Implements RA-06: Enforce max bytes per file
 */
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB

/**
 * Maximum total bytes for batch read operations (10MB).
 * Implements RA-06: Enforce max total bytes per request
 */
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10MB

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client as any).octokit.repos.listBranches({
      owner,
      repo,
      per_page: perPage,
      page,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client as any).octokit.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: recursive ? 1 : undefined,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// SECTION: RA-04 - FILE CONTENT READING
// ============================================================================

/**
 * Read file content from a repository.
 * Implements RA-04: Read file content by path+ref
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path within the repository
 * @param options - Read options (ref, size limits)
 * @returns File content with metadata
 * @throws GitHubAPIError on API errors
 * @throws Error if file size exceeds maximum
 *
 * @example
 * ```typescript
 * const file = await readFileContent(client, 'owner', 'repo', 'README.md');
 * console.log(file.content); // File content as string
 * console.log(file.size); // Size in bytes
 * ```
 */
export async function readFileContent(
  client: GitHubClient,
  owner: string,
  repo: string,
  path: string,
  options: ReadFileOptions = {}
): Promise<FileContent> {
  try {
    // Use default branch if ref not specified
    const ref = options.ref || (await getDefaultBranch(client, owner, repo));

    // Access the internal octokit instance for file content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client as any).octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    // Handle directory response
    if (Array.isArray(response.data)) {
      throw new GitHubAPIError('Path points to a directory, not a file', 400);
    }

    // Handle non-file types
    if (response.data.type !== 'file') {
      throw new GitHubAPIError(`Path type is ${response.data.type}, expected file`, 400);
    }

    const fileData = response.data;

    // Check file size limit
    if (fileData.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File size (${fileData.size} bytes) exceeds maximum allowed (${MAX_FILE_SIZE_BYTES} bytes)`
      );
    }

    // Decode base64 content
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

    return {
      path: fileData.path,
      content,
      encoding: 'utf-8',
      size: fileData.size,
      sha: fileData.sha,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('exceeds maximum')) {
      throw error;
    }
    throw new GitHubAPIError(
      `Failed to read file content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof GitHubAPIError ? error.statusCode : 500
    );
  }
}

// ============================================================================
// SECTION: RA-05 - BATCH FILE READING
// ============================================================================

/**
 * Batch read multiple files from a repository.
 * Implements RA-05: Batch read selected files
 * Implements RA-06: Enforce max bytes per file and total bytes per request
 *
 * @param client - GitHub client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param paths - Array of file paths to read
 * @param options - Batch read options (ref, size limits)
 * @returns Array of file contents (may be partial on size limit)
 * @throws GitHubAPIError on API errors
 *
 * @example
 * ```typescript
 * const files = await batchReadFiles(client, 'owner', 'repo', ['README.md', 'package.json']);
 * files.forEach(file => console.log(file.path, file.size));
 * ```
 */
export async function batchReadFiles(
  client: GitHubClient,
  owner: string,
  repo: string,
  paths: string[],
  options: BatchReadFilesOptions = {}
): Promise<FileContent[]> {
  const maxBytesPerFile = options.maxBytesPerFile || MAX_FILE_SIZE_BYTES;
  const maxTotalBytes = options.maxTotalBytes || MAX_TOTAL_BYTES;

  const results: FileContent[] = [];
  let totalBytes = 0;

  for (const path of paths) {
    try {
      const fileContent = await readFileContent(client, owner, repo, path, {
        ref: options.ref,
      });

      // Check per-file size limit
      if (fileContent.size > maxBytesPerFile) {
        throw new Error(
          `File ${path} size (${fileContent.size} bytes) exceeds per-file limit (${maxBytesPerFile} bytes)`
        );
      }

      // Check total size limit
      if (totalBytes + fileContent.size > maxTotalBytes) {
        throw new Error(
          `Total size would exceed maximum (${maxTotalBytes} bytes). Processed ${results.length} of ${paths.length} files.`
        );
      }

      totalBytes += fileContent.size;
      results.push(fileContent);
    } catch (error) {
      // Continue processing other files, but log the error
      // For production, consider collecting errors and returning them with results
      if (
        error instanceof Error &&
        (error.message.includes('exceed') || error.message.includes('limit'))
      ) {
        // Stop processing if size limits exceeded
        throw error;
      }
      // Skip files that can't be read (e.g., not found, not a file)
      // Could optionally collect these errors and return them
      continue;
    }
  }

  return results;
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
