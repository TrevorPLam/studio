/**
 * Unit tests for path policy module
 * @file tests/unit/lib/security/path-policy.test.ts
 * @epic RA-SAFE-004
 */

import {
  assertPathAllowed,
  validatePath,
  validatePaths,
  isForbiddenPath,
  isAllowedPath,
} from '@/lib/security/path-policy';

describe('RA-SAFE-004 — Path Policy Tests', () => {
  describe('assertPathAllowed()', () => {
    it('allows docs/ prefix', () => {
      const result = assertPathAllowed('docs/guide.md');
      expect(result.allowed).toBe(true);
    });

    it('allows .repo/ prefix', () => {
      const result = assertPathAllowed('.repo/config.json');
      expect(result.allowed).toBe(true);
    });

    it('allows README.md exact match', () => {
      const result = assertPathAllowed('README.md');
      expect(result.allowed).toBe(true);
    });

    it('allows nested paths under allowed prefixes', () => {
      const result = assertPathAllowed('docs/subfolder/deep/nested/file.md');
      expect(result.allowed).toBe(true);
    });

    it('rejects paths not in allowlist', () => {
      const result = assertPathAllowed('src/components/Button.tsx');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not in the allowed list');
    });

    it('rejects .github/workflows/ prefix', () => {
      const result = assertPathAllowed('.github/workflows/ci.yml');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('forbidden');
    });

    it('rejects package.json exact match', () => {
      const result = assertPathAllowed('package.json');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('forbidden');
    });

    it('rejects lockfile patterns', () => {
      const lockfiles = [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'pnpm-lock.yml',
      ];

      lockfiles.forEach((lockfile) => {
        const result = assertPathAllowed(lockfile);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('forbidden');
      });
    });

    it('allows forbidden with override flag', () => {
      const result = assertPathAllowed('package.json', {
        allowForbidden: true,
      });
      expect(result.allowed).toBe(true);
    });

    it('allows non-whitelisted with override flag', () => {
      const result = assertPathAllowed('src/components/Button.tsx', {
        allowNonWhitelisted: true,
      });
      expect(result.allowed).toBe(true);
    });
  });

  describe('validatePath()', () => {
    it('throws error for disallowed paths', () => {
      expect(() => {
        validatePath('package.json');
      }).toThrow('forbidden');
    });

    it('does not throw for allowed paths', () => {
      expect(() => {
        validatePath('docs/guide.md');
      }).not.toThrow();
    });
  });

  describe('validatePaths()', () => {
    it('validates multiple paths', () => {
      expect(() => {
        validatePaths(['docs/file1.md', 'docs/file2.md']);
      }).not.toThrow();
    });

    it('collects all errors before throwing', () => {
      expect(() => {
        validatePaths(['package.json', 'yarn.lock', 'docs/file.md']);
      }).toThrow('Path policy violations');
    });
  });

  describe('isForbiddenPath()', () => {
    it('correctly identifies forbidden paths', () => {
      expect(isForbiddenPath('package.json')).toBe(true);
      expect(isForbiddenPath('.github/workflows/ci.yml')).toBe(true);
      expect(isForbiddenPath('docs/guide.md')).toBe(false);
    });
  });

  describe('isAllowedPath()', () => {
    it('correctly identifies allowed paths', () => {
      expect(isAllowedPath('docs/guide.md')).toBe(true);
      expect(isAllowedPath('.repo/config.json')).toBe(true);
      expect(isAllowedPath('README.md')).toBe(true);
      expect(isAllowedPath('src/components/Button.tsx')).toBe(false);
    });
  });

  describe('Path normalization', () => {
    it('handles leading/trailing slashes', () => {
      expect(assertPathAllowed('/docs/file.md').allowed).toBe(true);
      expect(assertPathAllowed('docs/file.md/').allowed).toBe(true);
      expect(assertPathAllowed('/docs/file.md/').allowed).toBe(true);
    });

    it('handles Windows path separators', () => {
      expect(assertPathAllowed('docs\\file.md').allowed).toBe(true);
      expect(assertPathAllowed('.repo\\config.json').allowed).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('empty string', () => {
      const result = assertPathAllowed('');
      expect(result.allowed).toBe(false);
    });

    it('root path "/"', () => {
      const result = assertPathAllowed('/');
      expect(result.allowed).toBe(false);
    });

    it('very long paths', () => {
      const longPath = 'docs/' + 'a'.repeat(1000) + '.md';
      const result = assertPathAllowed(longPath);
      expect(result.allowed).toBe(true);
    });
  });
});
