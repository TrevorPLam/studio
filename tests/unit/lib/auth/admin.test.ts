/**
 * ============================================================================
 * ADMIN ROLE CHECK UTILITY TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/auth/admin.test.ts
 * @epic BP-DEP-008 (related to security)
 *
 * Tests for admin role checking functionality.
 *
 * ============================================================================
 */

import { isAdmin, _resetAdminCache } from '@/lib/auth/admin';

describe('Admin Role Check', () => {
  // Save original environment variable
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    // Reset cache before each test to ensure fresh state
    _resetAdminCache();
  });

  afterEach(() => {
    // Restore original environment variable
    if (originalAdminEmails === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = originalAdminEmails;
    }
    // Reset cache after each test
    _resetAdminCache();
  });

  describe('isAdmin', () => {
    it('should return false when ADMIN_EMAILS is not set', () => {
      delete process.env.ADMIN_EMAILS;
      expect(isAdmin('admin@example.com')).toBe(false);
    });

    it('should return false when ADMIN_EMAILS is empty', () => {
      process.env.ADMIN_EMAILS = '';
      expect(isAdmin('admin@example.com')).toBe(false);
    });

    it('should return false when ADMIN_EMAILS is whitespace only', () => {
      process.env.ADMIN_EMAILS = '   ';
      expect(isAdmin('admin@example.com')).toBe(false);
    });

    it('should return false for null userId', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin(null)).toBe(false);
    });

    it('should return false for undefined userId', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin(undefined)).toBe(false);
    });

    it('should return false for empty userId', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin('')).toBe(false);
    });

    it('should return false for whitespace-only userId', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin('   ')).toBe(false);
    });

    it('should return true for exact email match', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin('admin@example.com')).toBe(true);
    });

    it('should return true for case-insensitive email match', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin('ADMIN@EXAMPLE.COM')).toBe(true);
      expect(isAdmin('Admin@Example.Com')).toBe(true);
    });

    it('should return true for email with whitespace (trimmed)', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin('  admin@example.com  ')).toBe(true);
    });

    it('should return false for non-matching email', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin('user@example.com')).toBe(false);
    });

    it('should handle comma-separated admin emails', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com,superuser@example.com,root@example.com';
      expect(isAdmin('admin@example.com')).toBe(true);
      expect(isAdmin('superuser@example.com')).toBe(true);
      expect(isAdmin('root@example.com')).toBe(true);
      expect(isAdmin('user@example.com')).toBe(false);
    });

    it('should handle admin emails with whitespace', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com, superuser@example.com , root@example.com';
      expect(isAdmin('admin@example.com')).toBe(true);
      expect(isAdmin('superuser@example.com')).toBe(true);
      expect(isAdmin('root@example.com')).toBe(true);
    });

    it('should ignore empty entries in comma-separated list', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com,,superuser@example.com,';
      expect(isAdmin('admin@example.com')).toBe(true);
      expect(isAdmin('superuser@example.com')).toBe(true);
    });

    it('should cache admin emails list', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';

      // First call should compute and cache
      expect(isAdmin('admin@example.com')).toBe(true);

      // Change environment variable (should not affect cached value)
      process.env.ADMIN_EMAILS = 'newadmin@example.com';

      // Should still use cached value (old admin)
      expect(isAdmin('admin@example.com')).toBe(true);
      expect(isAdmin('newadmin@example.com')).toBe(false);
    });
  });
});
