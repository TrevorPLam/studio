/**
 * ============================================================================
 * REPOSITORY INTROSPECTION ORCHESTRATOR
 * ============================================================================
 *
 * @file src/lib/repo-introspection/introspector.ts
 * @module repo-introspector
 *
 * PURPOSE:
 * Main orchestrator for repository metadata extraction and analysis.
 * Coordinates all analyzers and integrates with GitHub API.
 *
 * RELATED FILES:
 * - src/lib/repo-introspection/types.ts (Type definitions)
 * - src/lib/repo-introspection/analyzers/* (Individual analyzers)
 * - src/lib/github-client.ts (GitHub API client)
 *
 * ============================================================================
 */

import { GitHubClient } from '../github-client';
import { logger } from '../logger';
import type { RepositoryMetadata, IntrospectionOptions } from './types';
import { detectLanguages } from './analyzers/language-detector';
import { analyzeDependencies } from './analyzers/dependency-analyzer';
import { analyzeEntryPoints } from './analyzers/entry-points-analyzer';
import { analyzeTestLocations } from './analyzers/test-locations-analyzer';
import { classifyProject } from './analyzers/classification-analyzer';

/**
 * Recursively fetch repository file tree from GitHub.
 *
 * @param client - GitHub client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param ref - Branch/ref to analyze
 * @param maxDepth - Maximum directory depth
 * @param maxFiles - Maximum files to fetch
 * @returns Array of file paths
 */
async function fetchFileTree(
  client: GitHubClient,
  owner: string,
  repo: string,
  ref: string,
  maxDepth: number = 10,
  maxFiles: number = 1000
): Promise<string[]> {
  const fileTree: string[] = [];
  const visited = new Set<string>();

  async function traverse(path: string = '', depth: number = 0): Promise<void> {
    if (depth > maxDepth || fileTree.length >= maxFiles) {
      return;
    }

    try {
      const contents = await client.getRepositoryContents(owner, repo, path);

      // Handle array of files/directories
      if (Array.isArray(contents)) {
        for (const item of contents) {
          if (fileTree.length >= maxFiles) break;

          const itemPath = item.path;
          if (visited.has(itemPath)) continue;
          visited.add(itemPath);

          if (item.type === 'file') {
            fileTree.push(itemPath);
          } else if (item.type === 'dir' && depth < maxDepth) {
            await traverse(itemPath, depth + 1);
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch repository contents', {
        owner,
        repo,
        path,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await traverse();
  return fileTree;
}

/**
 * Fetch file contents for important files.
 *
 * @param client - GitHub client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param fileTree - Array of file paths
 * @param ref - Branch/ref to analyze
 * @returns Map of file paths to contents
 */
async function fetchFileContents(
  client: GitHubClient,
  owner: string,
  repo: string,
  fileTree: string[],
  _ref: string
): Promise<Map<string, string>> {
  const contents = new Map<string, string>();

  // Important files to fetch
  const importantFiles = [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'requirements.txt',
    'Cargo.toml',
    'Cargo.lock',
    'jest.config.js',
    'jest.config.ts',
    'jest.config.json',
    'tsconfig.json',
    'next.config.js',
    'next.config.ts',
    'vite.config.js',
    'vite.config.ts',
    'README.md',
    'Dockerfile',
    'docker-compose.yml',
    '.env.example',
  ];

  // Also fetch entry point files (limited)
  const entryPointFiles = fileTree
    .filter(
      (file) =>
        file.includes('index.') ||
        file.includes('main.') ||
        file.includes('app/page.') ||
        file.includes('pages/') ||
        file.includes('app/api/')
    )
    .slice(0, 20); // Limit to 20 entry point files

  const filesToFetch = [
    ...importantFiles.filter((file) => fileTree.includes(file)),
    ...entryPointFiles,
  ];

  // Fetch contents in parallel (with rate limit consideration)
  const batchSize = 5;
  for (let i = 0; i < filesToFetch.length; i += batchSize) {
    const batch = filesToFetch.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (file) => {
        try {
          const content = await client.getRepositoryContents(owner, repo, file);

          // GitHub API returns base64 encoded content for files
          if (content && typeof content === 'object' && 'content' in content) {
            const fileContent = content as { content?: string; encoding?: string };
            if (fileContent.content && fileContent.encoding === 'base64') {
              const decoded = Buffer.from(fileContent.content, 'base64').toString('utf-8');
              contents.set(file, decoded);
            } else if (typeof fileContent.content === 'string') {
              contents.set(file, fileContent.content);
            }
          }
        } catch (error) {
          logger.debug('Failed to fetch file content', {
            file,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })
    );
  }

  return contents;
}

/**
 * Introspect a GitHub repository and extract metadata.
 *
 * @param client - GitHub API client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param options - Introspection options
 * @returns Complete repository metadata
 */
export async function introspectRepository(
  client: GitHubClient,
  owner: string,
  repo: string,
  options: IntrospectionOptions = {}
): Promise<RepositoryMetadata> {
  const startTime = Date.now();
  const {
    maxFiles = 1000,
    maxDepth = 10,
    ref,
    // timeout reserved for future use
  } = options;

  logger.info('Starting repository introspection', { owner, repo, options });

  try {
    // Get repository info to determine default branch
    const repoInfo = await client.getRepository(owner, repo);
    const targetRef = ref || repoInfo.default_branch;

    // Fetch file tree
    logger.debug('Fetching repository file tree', { owner, repo, ref: targetRef });
    const fileTree = await fetchFileTree(client, owner, repo, targetRef, maxDepth, maxFiles);
    logger.debug('Fetched file tree', { fileCount: fileTree.length });

    // Fetch important file contents
    logger.debug('Fetching file contents', { owner, repo });
    const fileContents = await fetchFileContents(client, owner, repo, fileTree, targetRef);
    logger.debug('Fetched file contents', { fileCount: fileContents.size });

    // Run all analyzers
    logger.debug('Running language detection');
    const languages = detectLanguages(fileTree);

    logger.debug('Analyzing dependencies');
    const dependencies = analyzeDependencies(fileContents);

    logger.debug('Analyzing entry points');
    const entryPoints = analyzeEntryPoints(fileTree, fileContents);

    logger.debug('Analyzing test locations');
    const tests = analyzeTestLocations(fileTree, fileContents);

    logger.debug('Classifying project');
    const classification = classifyProject(fileTree, fileContents);

    const duration = Date.now() - startTime;
    logger.info('Repository introspection completed', {
      owner,
      repo,
      duration: `${duration}ms`,
      fileCount: fileTree.length,
    });

    return {
      repository: {
        owner,
        name: repo,
        defaultBranch: targetRef,
      },
      languages,
      dependencies,
      entryPoints,
      tests,
      classification,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  } catch (error) {
    logger.error('Repository introspection failed', error instanceof Error ? error : undefined, {
      owner,
      repo,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get quick repository summary (lightweight version).
 *
 * @param client - GitHub API client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Quick summary metadata
 */
export async function getRepositorySummary(
  client: GitHubClient,
  owner: string,
  repo: string
): Promise<Pick<RepositoryMetadata, 'repository' | 'languages' | 'classification'>> {
  const repoInfo = await client.getRepository(owner, repo);

  // Fetch limited file tree for quick analysis
  const fileTree = await fetchFileTree(client, owner, repo, repoInfo.default_branch, 3, 100);
  const fileContents = new Map<string, string>();

  // Only fetch package.json for quick classification
  try {
    const pkgContent = await client.getRepositoryContents(owner, repo, 'package.json');
    if (pkgContent && typeof pkgContent === 'object' && 'content' in pkgContent) {
      const fileContent = pkgContent as { content?: string; encoding?: string };
      if (fileContent.content && fileContent.encoding === 'base64') {
        fileContents.set(
          'package.json',
          Buffer.from(fileContent.content, 'base64').toString('utf-8')
        );
      }
    }
  } catch {
    // package.json not found, continue
  }

  const languages = detectLanguages(fileTree);
  const classification = classifyProject(fileTree, fileContents);

  return {
    repository: {
      owner,
      name: repo,
      defaultBranch: repoInfo.default_branch,
    },
    languages,
    classification,
  };
}
