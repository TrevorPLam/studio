/**
 * ============================================================================
 * PROPOSED CHANGE MODULE
 * ============================================================================
 *
 * @file src/lib/agent/proposed-change.ts
 * @module proposed-change
 * @epic RA-PREV-003
 *
 * PURPOSE:
 * Defines the canonical data structure for proposed repository changes.
 * Used by preview and apply workflows to represent file modifications.
 *
 * FEATURES:
 * - Proposed file change representation (RA-07)
 * - Preview payload with diffs and stats (RA-08, RA-09)
 * - Support for create, update, delete operations
 * - Change statistics (files, added/removed chars)
 *
 * RELATED FILES:
 * - src/lib/diff/unified.ts (Unified diff generation)
 * - src/app/api/sessions/[id]/preview/route.ts (Preview endpoint)
 * - src/lib/db/previews.ts (Preview persistence)
 * - src/lib/security/path-policy.ts (Path validation)
 *
 * ============================================================================
 */

import { assertPathAllowed } from '@/lib/security/path-policy';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Type of file operation to perform.
 */
export type FileChangeAction = 'create' | 'update' | 'delete';

/**
 * Represents a proposed change to a single file.
 * Implements RA-07: Canonical proposed change representation
 */
export interface ProposedFileChange {
  /** File path within the repository */
  path: string;

  /** Type of change to perform */
  action: FileChangeAction;

  /** Content before change (for update and delete) */
  before?: string;

  /** Content after change (for create and update) */
  after?: string;
}

/**
 * Statistics about proposed changes.
 * Implements RA-09: Aggregate stats (files/added/removed)
 */
export interface ChangeStatistics {
  /** Total number of files changed */
  files: number;

  /** Number of characters added */
  addedChars: number;

  /** Number of characters removed */
  removedChars: number;

  /** Number of files created */
  created: number;

  /** Number of files updated */
  updated: number;

  /** Number of files deleted */
  deleted: number;
}

/**
 * Unified diff for a single file.
 * Implements RA-08: Generate unified diff per file
 */
export interface FileDiff {
  /** File path */
  path: string;

  /** Unified diff string */
  unified: string;

  /** Number of lines added */
  addedLines: number;

  /** Number of lines removed */
  removedLines: number;
}

/**
 * Complete preview payload for a session.
 * Contains all proposed changes, diffs, and statistics.
 */
export interface PreviewPayload {
  /** Session ID this preview belongs to */
  sessionId: string;

  /** High-level plan description (bullet points) */
  plan: string[];

  /** List of proposed file changes */
  changes: ProposedFileChange[];

  /** Unified diffs for each changed file */
  diffs: FileDiff[];

  /** Aggregate statistics about changes */
  stats: ChangeStatistics;

  /** Timestamp when preview was created */
  createdAt: string;

  /** Preview ID (for tracking) */
  id?: string;
}

// ============================================================================
// SECTION: VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a proposed file change.
 *
 * @param change - Proposed file change to validate
 * @param options - Validation options (path policy overrides)
 * @throws Error if change is invalid
 *
 * @example
 * ```typescript
 * const change: ProposedFileChange = {
 *   path: 'docs/guide.md',
 *   action: 'update',
 *   after: 'New content'
 * };
 * validateProposedChange(change); // Validates or throws
 * ```
 */
export function validateProposedChange(
  change: ProposedFileChange,
  options?: { allowForbidden?: boolean; allowNonWhitelisted?: boolean }
): void {
  // Validate path is not empty
  if (!change.path || change.path.trim() === '') {
    throw new Error('File path cannot be empty');
  }

  // Validate path doesn't contain suspicious patterns
  if (change.path.includes('..') || change.path.startsWith('/')) {
    throw new Error(`Invalid file path: ${change.path}`);
  }

  // Validate against path policy
  const pathCheck = assertPathAllowed(change.path, {
    allowForbidden: options?.allowForbidden,
    allowNonWhitelisted: options?.allowNonWhitelisted,
  });

  if (!pathCheck.allowed) {
    throw new Error(`Path not allowed: ${pathCheck.reason}`);
  }

  // Validate action-specific requirements
  switch (change.action) {
    case 'create':
      if (!change.after) {
        throw new Error('Create action requires "after" content');
      }
      if (change.before) {
        throw new Error('Create action should not have "before" content');
      }
      break;

    case 'update':
      if (!change.after) {
        throw new Error('Update action requires "after" content');
      }
      // before is optional for updates (can be fetched from GitHub)
      break;

    case 'delete':
      if (change.after) {
        throw new Error('Delete action should not have "after" content');
      }
      // before is optional for deletes (can be fetched from GitHub)
      break;

    default:
      throw new Error(`Unknown action: ${change.action}`);
  }
}

/**
 * Validates a complete preview payload.
 *
 * @param preview - Preview payload to validate
 * @param options - Validation options
 * @throws Error if preview is invalid
 */
export function validatePreviewPayload(
  preview: PreviewPayload,
  options?: { allowForbidden?: boolean; allowNonWhitelisted?: boolean }
): void {
  // Validate session ID
  if (!preview.sessionId) {
    throw new Error('Session ID is required');
  }

  // Validate changes array
  if (!Array.isArray(preview.changes)) {
    throw new Error('Changes must be an array');
  }

  // Validate each change
  for (const change of preview.changes) {
    validateProposedChange(change, options);
  }

  // Validate diffs match changes
  if (preview.diffs.length !== preview.changes.length) {
    throw new Error('Number of diffs must match number of changes');
  }

  // Validate stats
  if (preview.stats.files !== preview.changes.length) {
    throw new Error('Stats file count must match number of changes');
  }
}

// ============================================================================
// SECTION: STATISTICS CALCULATION
// ============================================================================

/**
 * Calculate statistics for a set of proposed changes.
 * Implements RA-09: Aggregate stats (files/added/removed)
 *
 * @param changes - List of proposed file changes
 * @returns Aggregate statistics about the changes
 *
 * @example
 * ```typescript
 * const changes = [
 *   { path: 'a.txt', action: 'create', after: 'New' },
 *   { path: 'b.txt', action: 'update', before: 'Old', after: 'Updated' }
 * ];
 * const stats = calculateChangeStatistics(changes);
 * console.log(stats.files); // 2
 * console.log(stats.created); // 1
 * console.log(stats.updated); // 1
 * ```
 */
export function calculateChangeStatistics(changes: ProposedFileChange[]): ChangeStatistics {
  const stats: ChangeStatistics = {
    files: changes.length,
    addedChars: 0,
    removedChars: 0,
    created: 0,
    updated: 0,
    deleted: 0,
  };

  for (const change of changes) {
    // Count by action
    switch (change.action) {
      case 'create':
        stats.created++;
        break;
      case 'update':
        stats.updated++;
        break;
      case 'delete':
        stats.deleted++;
        break;
    }

    // Count character changes
    const beforeLength = change.before?.length || 0;
    const afterLength = change.after?.length || 0;

    if (afterLength > beforeLength) {
      stats.addedChars += afterLength - beforeLength;
    } else if (beforeLength > afterLength) {
      stats.removedChars += beforeLength - afterLength;
    }
  }

  return stats;
}

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Create a proposed file change for creating a new file.
 *
 * @param path - File path
 * @param content - File content
 * @returns Proposed file change
 */
export function createFileChange(path: string, content: string): ProposedFileChange {
  return {
    path,
    action: 'create',
    after: content,
  };
}

/**
 * Create a proposed file change for updating an existing file.
 *
 * @param path - File path
 * @param before - Content before change (optional)
 * @param after - Content after change
 * @returns Proposed file change
 */
export function updateFileChange(
  path: string,
  before: string | undefined,
  after: string
): ProposedFileChange {
  return {
    path,
    action: 'update',
    before,
    after,
  };
}

/**
 * Create a proposed file change for deleting a file.
 *
 * @param path - File path
 * @param before - Content before deletion (optional)
 * @returns Proposed file change
 */
export function deleteFileChange(path: string, before?: string): ProposedFileChange {
  return {
    path,
    action: 'delete',
    before,
  };
}
