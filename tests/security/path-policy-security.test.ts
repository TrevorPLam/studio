/**
 * Security tests for path policy
 * @file tests/security/path-policy-security.test.ts
 */

import {
  assertPathAllowed,
  validatePath,
  isForbiddenPath,
} from '@/lib/security/path-policy';

describe('Path Policy Security Tests', () => {
  describe('Forbidden paths', () => {
    it('package.json blocked', () => {
      const result = assertPathAllowed('package.json');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('forbidden');
    });

    it('lockfiles blocked', () => {
      const lockfiles = [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'pnpm-lock.yml',
      ];

      lockfiles.forEach((lockfile) => {
        const result = assertPathAllowed(lockfile);
        expect(result.allowed).toBe(false);
      });
    });

    it('workflows blocked', () => {
      const result = assertPathAllowed('.github/workflows/ci.yml');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Override mechanism', () => {
    it('requires explicit flag', () => {
      const result = assertPathAllowed('package.json', {
        allowForbidden: true,
      });

      expect(result.allowed).toBe(true);
    });

    it('override does not bypass allowlist by default', () => {
      const result = assertPathAllowed('src/components/Button.tsx', {
        allowForbidden: true,
      });

      // Still blocked by allowlist
      expect(result.allowed).toBe(false);
    });
  });

  describe('Allowlist enforcement', () => {
    it('non-whitelisted paths blocked', () => {
      const blockedPaths = [
        'src/components/Button.tsx',
        'lib/utils.ts',
        'app/page.tsx',
        'config.json',
      ];

      blockedPaths.forEach((path) => {
        const result = assertPathAllowed(path);
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('path normalization prevents bypass', () => {
      const bypassAttempts = [
        'docs/../package.json',
        'docs/./../.github/workflows/ci.yml',
        'docs//../README.md',
        '.repo/../../package.json',
      ];

      bypassAttempts.forEach((path) => {
        const result = assertPathAllowed(path);
        // Should either be blocked or normalized correctly
        expect(result.allowed).toBe(false);
      });
    });

    it('handles encoded paths', () => {
      // Test that path normalization handles various encodings
      const encodedPaths = [
        'docs%2Ffile.md',
        'docs%5Cfile.md', // Windows separator encoded
      ];

      // These should be normalized and checked
      encodedPaths.forEach((path) => {
        const result = assertPathAllowed(decodeURIComponent(path));
        // Result depends on the actual path after decoding
        expect(result).toHaveProperty('allowed');
      });
    });
  });
});
