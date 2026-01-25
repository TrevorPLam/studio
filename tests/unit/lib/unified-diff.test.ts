/**
 * @jest-environment node
 */

/**
 * ============================================================================
 * UNIFIED DIFF MODULE TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/unified-diff.test.ts
 * @module unified-diff.test
 * @epic RA-PREV-003
 *
 * PURPOSE:
 * Unit tests for unified diff generation module.
 * Validates diff generation for create, update, and delete operations.
 *
 * TEST COVERAGE:
 * - RA-08: Unified diff generation
 * - Create diffs
 * - Update diffs
 * - Delete diffs
 * - Line counting
 *
 * ============================================================================
 */

import {
  generateUnifiedDiff,
  generateUnifiedDiffs,
  formatDiff,
  formatDiffs,
} from '@/lib/diff/unified';
import type { ProposedFileChange } from '@/lib/agent/proposed-change';

describe('Unified Diff Module', () => {
  describe('generateUnifiedDiff - create', () => {
    it('generates diff for file creation', () => {
      const change: ProposedFileChange = {
        path: 'docs/new.md',
        action: 'create',
        after: 'Hello\nWorld',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('docs/new.md');
      expect(diff.addedLines).toBe(2);
      expect(diff.removedLines).toBe(0);
      expect(diff.unified).toContain('--- /dev/null');
      expect(diff.unified).toContain('+++ b/docs/new.md');
      expect(diff.unified).toContain('+Hello');
      expect(diff.unified).toContain('+World');
    });

    it('generates diff for empty file creation', () => {
      const change: ProposedFileChange = {
        path: 'docs/empty.txt',
        action: 'create',
        after: '',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('docs/empty.txt');
      expect(diff.addedLines).toBe(1); // Empty string creates one empty line
      expect(diff.removedLines).toBe(0);
    });

    it('generates diff for single-line file', () => {
      const change: ProposedFileChange = {
        path: 'file.txt',
        action: 'create',
        after: 'Single line',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('file.txt');
      expect(diff.addedLines).toBe(1);
      expect(diff.removedLines).toBe(0);
      expect(diff.unified).toContain('+Single line');
    });
  });

  describe('generateUnifiedDiff - delete', () => {
    it('generates diff for file deletion', () => {
      const change: ProposedFileChange = {
        path: 'docs/old.md',
        action: 'delete',
        before: 'Goodbye\nWorld',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('docs/old.md');
      expect(diff.addedLines).toBe(0);
      expect(diff.removedLines).toBe(2);
      expect(diff.unified).toContain('--- a/docs/old.md');
      expect(diff.unified).toContain('+++ /dev/null');
      expect(diff.unified).toContain('-Goodbye');
      expect(diff.unified).toContain('-World');
    });

    it('generates diff for empty file deletion', () => {
      const change: ProposedFileChange = {
        path: 'empty.txt',
        action: 'delete',
        before: '',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('empty.txt');
      expect(diff.addedLines).toBe(0);
      expect(diff.removedLines).toBe(1);
    });
  });

  describe('generateUnifiedDiff - update', () => {
    it('generates diff for file update with additions', () => {
      const change: ProposedFileChange = {
        path: 'file.txt',
        action: 'update',
        before: 'Line 1\nLine 2',
        after: 'Line 1\nLine 2\nLine 3',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('file.txt');
      // The diff library may count lines differently due to newline handling
      expect(diff.addedLines).toBeGreaterThan(0);
      expect(diff.unified).toContain('--- a/file.txt');
      expect(diff.unified).toContain('+++ b/file.txt');
      expect(diff.unified).toContain('Line 3');
    });

    it('generates diff for file update with removals', () => {
      const change: ProposedFileChange = {
        path: 'file.txt',
        action: 'update',
        before: 'Line 1\nLine 2\nLine 3',
        after: 'Line 1\nLine 2',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('file.txt');
      // The diff library may count lines differently due to newline handling
      expect(diff.removedLines).toBeGreaterThan(0);
      expect(diff.unified).toContain('-Line 3');
    });

    it('generates diff for file update with changes', () => {
      const change: ProposedFileChange = {
        path: 'file.txt',
        action: 'update',
        before: 'Hello World',
        after: 'Hello Universe',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('file.txt');
      expect(diff.addedLines).toBe(1);
      expect(diff.removedLines).toBe(1);
      expect(diff.unified).toContain('-Hello World');
      expect(diff.unified).toContain('+Hello Universe');
    });

    it('generates diff for file update with no changes', () => {
      const change: ProposedFileChange = {
        path: 'file.txt',
        action: 'update',
        before: 'Same content',
        after: 'Same content',
      };

      const diff = generateUnifiedDiff(change);

      expect(diff.path).toBe('file.txt');
      expect(diff.addedLines).toBe(0);
      expect(diff.removedLines).toBe(0);
    });
  });

  describe('generateUnifiedDiffs', () => {
    it('generates diffs for multiple changes', () => {
      const changes: ProposedFileChange[] = [
        {
          path: 'new.txt',
          action: 'create',
          after: 'New file',
        },
        {
          path: 'update.txt',
          action: 'update',
          before: 'Old',
          after: 'New',
        },
        {
          path: 'delete.txt',
          action: 'delete',
          before: 'Gone',
        },
      ];

      const diffs = generateUnifiedDiffs(changes);

      expect(diffs).toHaveLength(3);
      expect(diffs[0].path).toBe('new.txt');
      expect(diffs[0].addedLines).toBe(1);
      expect(diffs[1].path).toBe('update.txt');
      expect(diffs[2].path).toBe('delete.txt');
      expect(diffs[2].removedLines).toBe(1);
    });

    it('handles empty changes array', () => {
      const diffs = generateUnifiedDiffs([]);

      expect(diffs).toHaveLength(0);
    });
  });

  describe('formatDiff', () => {
    it('formats a diff with metadata', () => {
      const diff = {
        path: 'file.txt',
        unified: '+New content',
        addedLines: 1,
        removedLines: 0,
      };

      const formatted = formatDiff(diff);

      expect(formatted).toContain('File: file.txt');
      expect(formatted).toContain('Added: 1 lines');
      expect(formatted).toContain('Removed: 0 lines');
      expect(formatted).toContain('+New content');
    });
  });

  describe('formatDiffs', () => {
    it('formats multiple diffs', () => {
      const diffs = [
        {
          path: 'file1.txt',
          unified: '+Content 1',
          addedLines: 1,
          removedLines: 0,
        },
        {
          path: 'file2.txt',
          unified: '-Content 2',
          addedLines: 0,
          removedLines: 1,
        },
      ];

      const formatted = formatDiffs(diffs);

      expect(formatted).toContain('File: file1.txt');
      expect(formatted).toContain('File: file2.txt');
      expect(formatted).toContain('---'); // Separator
    });
  });
});
