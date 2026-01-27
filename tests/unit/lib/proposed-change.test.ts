/**
 * @jest-environment node
 */

/**
 * ============================================================================
 * PROPOSED CHANGE MODULE TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/proposed-change.test.ts
 * @module proposed-change.test
 * @epic RA-PREV-003
 *
 * PURPOSE:
 * Unit tests for proposed change module.
 * Validates change models, validation, and statistics calculation.
 *
 * TEST COVERAGE:
 * - RA-07: Proposed change representation
 * - RA-09: Change statistics calculation
 * - Validation logic
 * - Helper functions
 *
 * ============================================================================
 */

import {
  validateProposedChange,
  validatePreviewPayload,
  calculateChangeStatistics,
  createFileChange,
  updateFileChange,
  deleteFileChange,
  type ProposedFileChange,
  type PreviewPayload,
} from '@/lib/agent/proposed-change';

// Mock path policy
jest.mock('@/lib/security/path-policy', () => ({
  assertPathAllowed: jest.fn().mockReturnValue({ allowed: true }),
}));

describe('Proposed Change Module', () => {
  describe('validateProposedChange', () => {
    it('validates a valid create change', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'create',
        after: 'New content',
      };

      expect(() => validateProposedChange(change)).not.toThrow();
    });

    it('validates a valid update change', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'update',
        before: 'Old content',
        after: 'New content',
      };

      expect(() => validateProposedChange(change)).not.toThrow();
    });

    it('validates a valid delete change', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'delete',
        before: 'Content to delete',
      };

      expect(() => validateProposedChange(change)).not.toThrow();
    });

    it('rejects empty path', () => {
      const change: ProposedFileChange = {
        path: '',
        action: 'create',
        after: 'Content',
      };

      expect(() => validateProposedChange(change)).toThrow('path cannot be empty');
    });

    it('rejects path with ..', () => {
      const change: ProposedFileChange = {
        path: '../etc/passwd',
        action: 'create',
        after: 'Content',
      };

      expect(() => validateProposedChange(change)).toThrow('Invalid file path');
    });

    it('rejects absolute path', () => {
      const change: ProposedFileChange = {
        path: '/etc/passwd',
        action: 'create',
        after: 'Content',
      };

      expect(() => validateProposedChange(change)).toThrow('Invalid file path');
    });

    it('rejects create without after', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'create',
      };

      expect(() => validateProposedChange(change)).toThrow('Create action requires "after"');
    });

    it('rejects create with before', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'create',
        before: 'Old content',
        after: 'New content',
      };

      expect(() => validateProposedChange(change)).toThrow('should not have "before"');
    });

    it('rejects update without after', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'update',
        before: 'Old content',
      };

      expect(() => validateProposedChange(change)).toThrow('Update action requires "after"');
    });

    it('rejects delete with after', () => {
      const change: ProposedFileChange = {
        path: 'docs/guide.md',
        action: 'delete',
        before: 'Old content',
        after: 'New content',
      };

      expect(() => validateProposedChange(change)).toThrow('should not have "after"');
    });
  });

  describe('calculateChangeStatistics', () => {
    it('calculates stats for empty changes', () => {
      const stats = calculateChangeStatistics([]);

      expect(stats).toEqual({
        files: 0,
        addedChars: 0,
        removedChars: 0,
        created: 0,
        updated: 0,
        deleted: 0,
      });
    });

    it('calculates stats for file creation', () => {
      const changes: ProposedFileChange[] = [
        {
          path: 'new.txt',
          action: 'create',
          after: 'Hello World', // 11 chars
        },
      ];

      const stats = calculateChangeStatistics(changes);

      expect(stats).toEqual({
        files: 1,
        addedChars: 11,
        removedChars: 0,
        created: 1,
        updated: 0,
        deleted: 0,
      });
    });

    it('calculates stats for file update', () => {
      const changes: ProposedFileChange[] = [
        {
          path: 'file.txt',
          action: 'update',
          before: 'Hi', // 2 chars
          after: 'Hello World', // 11 chars
        },
      ];

      const stats = calculateChangeStatistics(changes);

      expect(stats).toEqual({
        files: 1,
        addedChars: 9, // 11 - 2
        removedChars: 0,
        created: 0,
        updated: 1,
        deleted: 0,
      });
    });

    it('calculates stats for file deletion', () => {
      const changes: ProposedFileChange[] = [
        {
          path: 'old.txt',
          action: 'delete',
          before: 'Goodbye', // 7 chars
        },
      ];

      const stats = calculateChangeStatistics(changes);

      expect(stats).toEqual({
        files: 1,
        addedChars: 0,
        removedChars: 7,
        created: 0,
        updated: 0,
        deleted: 1,
      });
    });

    it('calculates stats for content reduction', () => {
      const changes: ProposedFileChange[] = [
        {
          path: 'file.txt',
          action: 'update',
          before: 'Very long content', // 17 chars
          after: 'Short', // 5 chars
        },
      ];

      const stats = calculateChangeStatistics(changes);

      expect(stats).toEqual({
        files: 1,
        addedChars: 0,
        removedChars: 12, // 17 - 5
        created: 0,
        updated: 1,
        deleted: 0,
      });
    });

    it('calculates stats for mixed changes', () => {
      const changes: ProposedFileChange[] = [
        {
          path: 'new.txt',
          action: 'create',
          after: 'New', // 3 chars
        },
        {
          path: 'update.txt',
          action: 'update',
          before: 'Old', // 3 chars
          after: 'Updated', // 7 chars
        },
        {
          path: 'delete.txt',
          action: 'delete',
          before: 'Gone', // 4 chars
        },
      ];

      const stats = calculateChangeStatistics(changes);

      expect(stats).toEqual({
        files: 3,
        addedChars: 7, // 3 (new) + 4 (update: 7-3)
        removedChars: 4, // 4 (delete)
        created: 1,
        updated: 1,
        deleted: 1,
      });
    });
  });

  describe('Helper Functions', () => {
    it('createFileChange creates proper change', () => {
      const change = createFileChange('docs/new.md', 'Content');

      expect(change).toEqual({
        path: 'docs/new.md',
        action: 'create',
        after: 'Content',
      });
    });

    it('updateFileChange creates proper change', () => {
      const change = updateFileChange('docs/file.md', 'Old', 'New');

      expect(change).toEqual({
        path: 'docs/file.md',
        action: 'update',
        before: 'Old',
        after: 'New',
      });
    });

    it('deleteFileChange creates proper change', () => {
      const change = deleteFileChange('docs/old.md', 'Content');

      expect(change).toEqual({
        path: 'docs/old.md',
        action: 'delete',
        before: 'Content',
      });
    });
  });

  describe('validatePreviewPayload', () => {
    it('validates valid preview', () => {
      const preview: PreviewPayload = {
        sessionId: 'session-123',
        plan: ['Step 1', 'Step 2'],
        changes: [
          {
            path: 'docs/file.md',
            action: 'create',
            after: 'Content',
          },
        ],
        diffs: [
          {
            path: 'docs/file.md',
            unified: '+ Content',
            addedLines: 1,
            removedLines: 0,
          },
        ],
        stats: {
          files: 1,
          addedChars: 7,
          removedChars: 0,
          created: 1,
          updated: 0,
          deleted: 0,
        },
        createdAt: new Date().toISOString(),
      };

      expect(() => validatePreviewPayload(preview)).not.toThrow();
    });

    it('rejects preview without session ID', () => {
      const preview: PreviewPayload = {
        sessionId: '',
        plan: [],
        changes: [],
        diffs: [],
        stats: {
          files: 0,
          addedChars: 0,
          removedChars: 0,
          created: 0,
          updated: 0,
          deleted: 0,
        },
        createdAt: new Date().toISOString(),
      };

      expect(() => validatePreviewPayload(preview)).toThrow('Session ID is required');
    });

    it('rejects preview with mismatched diffs', () => {
      const preview: PreviewPayload = {
        sessionId: 'session-123',
        plan: [],
        changes: [
          {
            path: 'file.txt',
            action: 'create',
            after: 'Content',
          },
        ],
        diffs: [], // Should have 1 diff
        stats: {
          files: 1,
          addedChars: 7,
          removedChars: 0,
          created: 1,
          updated: 0,
          deleted: 0,
        },
        createdAt: new Date().toISOString(),
      };

      expect(() => validatePreviewPayload(preview)).toThrow('Number of diffs must match');
    });

    it('rejects preview with mismatched stats', () => {
      const preview: PreviewPayload = {
        sessionId: 'session-123',
        plan: [],
        changes: [
          {
            path: 'file.txt',
            action: 'create',
            after: 'Content',
          },
        ],
        diffs: [
          {
            path: 'file.txt',
            unified: '+ Content',
            addedLines: 1,
            removedLines: 0,
          },
        ],
        stats: {
          files: 2, // Should be 1
          addedChars: 7,
          removedChars: 0,
          created: 1,
          updated: 0,
          deleted: 0,
        },
        createdAt: new Date().toISOString(),
      };

      expect(() => validatePreviewPayload(preview)).toThrow('Stats file count must match');
    });
  });
});
