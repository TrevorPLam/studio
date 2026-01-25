/**
 * ============================================================================
 * UNIFIED DIFF GENERATOR MODULE
 * ============================================================================
 *
 * @file src/lib/diff/unified.ts
 * @module unified-diff
 * @epic RA-PREV-003
 *
 * PURPOSE:
 * Generates unified diff format for file changes.
 * Implements RA-08: Generate unified diff per file
 *
 * FEATURES:
 * - Unified diff generation (standard diff format)
 * - Line-by-line comparison
 * - Context lines support
 * - Added/removed line counting
 *
 * RELATED FILES:
 * - src/lib/agent/proposed-change.ts (Proposed change model)
 * - src/app/api/sessions/[id]/preview/route.ts (Preview endpoint)
 *
 * ============================================================================
 */

import { ProposedFileChange, FileDiff } from '@/lib/agent/proposed-change';
import { diffLines, Change } from 'diff';

// ============================================================================
// SECTION: UNIFIED DIFF GENERATION
// ============================================================================

/**
 * Generate unified diff for a proposed file change.
 * Implements RA-08: Generate unified diff per file
 *
 * @param change - Proposed file change
 * @returns Unified diff with statistics
 *
 * @example
 * ```typescript
 * const change: ProposedFileChange = {
 *   path: 'file.txt',
 *   action: 'update',
 *   before: 'Hello\nWorld',
 *   after: 'Hello\nUniverse'
 * };
 * const diff = generateUnifiedDiff(change);
 * console.log(diff.unified); // Unified diff string
 * console.log(diff.addedLines); // 1
 * console.log(diff.removedLines); // 1
 * ```
 */
export function generateUnifiedDiff(change: ProposedFileChange): FileDiff {
  const { path, action, before, after } = change;

  // Handle different actions
  switch (action) {
    case 'create':
      return generateCreateDiff(path, after || '');

    case 'delete':
      return generateDeleteDiff(path, before || '');

    case 'update':
      return generateUpdateDiff(path, before || '', after || '');

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Generate diff for file creation.
 *
 * @param path - File path
 * @param content - File content
 * @returns Unified diff
 */
function generateCreateDiff(path: string, content: string): FileDiff {
  const lines = content.split('\n');
  const addedLines = lines.length;

  // Generate unified diff format
  const header = `--- /dev/null\n+++ b/${path}`;
  const hunk = `@@ -0,0 +1,${addedLines} @@`;
  const contentLines = lines.map((line) => `+${line}`).join('\n');

  const unified = [header, hunk, contentLines].join('\n');

  return {
    path,
    unified,
    addedLines,
    removedLines: 0,
  };
}

/**
 * Generate diff for file deletion.
 *
 * @param path - File path
 * @param content - File content before deletion
 * @returns Unified diff
 */
function generateDeleteDiff(path: string, content: string): FileDiff {
  const lines = content.split('\n');
  const removedLines = lines.length;

  // Generate unified diff format
  const header = `--- a/${path}\n+++ /dev/null`;
  const hunk = `@@ -1,${removedLines} +0,0 @@`;
  const contentLines = lines.map((line) => `-${line}`).join('\n');

  const unified = [header, hunk, contentLines].join('\n');

  return {
    path,
    unified,
    addedLines: 0,
    removedLines,
  };
}

/**
 * Generate diff for file update.
 *
 * @param path - File path
 * @param before - Content before change
 * @param after - Content after change
 * @returns Unified diff
 */
function generateUpdateDiff(path: string, before: string, after: string): FileDiff {
  // Use diff library to compute line-by-line differences
  const changes: Change[] = diffLines(before, after);

  // Count added and removed lines
  let addedLines = 0;
  let removedLines = 0;

  for (const change of changes) {
    const lineCount = change.count || 0;
    if (change.added) {
      addedLines += lineCount;
    } else if (change.removed) {
      removedLines += lineCount;
    }
  }

  // Generate unified diff format
  const header = `--- a/${path}\n+++ b/${path}`;
  const hunk = `@@ -1,${removedLines || 0} +1,${addedLines || 0} @@`;

  // Format change lines
  const contentLines: string[] = [];
  for (const change of changes) {
    const lines = change.value.split('\n').filter((line, idx, arr) => {
      // Keep all lines except the last empty line (if it exists)
      return idx < arr.length - 1 || line !== '';
    });

    if (change.added) {
      contentLines.push(...lines.map((line) => `+${line}`));
    } else if (change.removed) {
      contentLines.push(...lines.map((line) => `-${line}`));
    } else {
      contentLines.push(...lines.map((line) => ` ${line}`));
    }
  }

  const unified = [header, hunk, contentLines.join('\n')].join('\n');

  return {
    path,
    unified,
    addedLines,
    removedLines,
  };
}

/**
 * Generate unified diffs for multiple file changes.
 *
 * @param changes - List of proposed file changes
 * @returns Array of unified diffs
 *
 * @example
 * ```typescript
 * const changes = [
 *   { path: 'a.txt', action: 'create', after: 'New' },
 *   { path: 'b.txt', action: 'update', before: 'Old', after: 'Updated' }
 * ];
 * const diffs = generateUnifiedDiffs(changes);
 * diffs.forEach(diff => console.log(diff.unified));
 * ```
 */
export function generateUnifiedDiffs(changes: ProposedFileChange[]): FileDiff[] {
  return changes.map((change) => generateUnifiedDiff(change));
}

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Format a unified diff as a string suitable for display.
 *
 * @param diff - File diff
 * @returns Formatted diff string
 */
export function formatDiff(diff: FileDiff): string {
  return `
File: ${diff.path}
Added: ${diff.addedLines} lines
Removed: ${diff.removedLines} lines

${diff.unified}
`;
}

/**
 * Format multiple diffs as a single string.
 *
 * @param diffs - Array of file diffs
 * @returns Formatted diff string
 */
export function formatDiffs(diffs: FileDiff[]): string {
  return diffs.map((diff) => formatDiff(diff)).join('\n---\n');
}
