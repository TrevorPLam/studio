import { describe, expect, it } from 'vitest';
import {
  isPathAllowed,
  isPathForbidden,
  validatePath,
  ALLOWED_PREFIXES,
  FORBIDDEN_PREFIXES,
} from './path-policy';

describe('isPathAllowed', () => {
  it('allows paths with allowed prefixes', () => {
    expect(isPathAllowed('docs/README.md')).toBe(true);
    expect(isPathAllowed('.repo/config.json')).toBe(true);
    expect(isPathAllowed('README.md')).toBe(true);
  });

  it('rejects paths without allowed prefixes', () => {
    expect(isPathAllowed('src/index.ts')).toBe(false);
    expect(isPathAllowed('lib/utils.js')).toBe(false);
  });

  it('handles paths with slashes correctly', () => {
    expect(isPathAllowed('docs/guides/setup.md')).toBe(true);
    expect(isPathAllowed('.repo/nested/file.txt')).toBe(true);
  });

  it('is case-sensitive', () => {
    expect(isPathAllowed('DOCS/README.md')).toBe(false);
    expect(isPathAllowed('readme.md')).toBe(false);
  });
});

describe('isPathForbidden', () => {
  it('detects forbidden workflow paths', () => {
    expect(isPathForbidden('.github/workflows/ci.yml')).toBe(true);
    expect(isPathForbidden('.github/workflows/deploy.yaml')).toBe(true);
  });

  it('detects forbidden package files', () => {
    expect(isPathForbidden('package.json')).toBe(true);
    expect(isPathForbidden('package-lock.json')).toBe(true);
    expect(isPathForbidden('pnpm-lock.yaml')).toBe(true);
    expect(isPathForbidden('yarn.lock')).toBe(true);
  });

  it('detects forbidden env files', () => {
    expect(isPathForbidden('.env')).toBe(true);
    expect(isPathForbidden('.env.local')).toBe(true);
    expect(isPathForbidden('.env.production')).toBe(true);
  });

  it('allows non-forbidden paths', () => {
    expect(isPathForbidden('src/index.ts')).toBe(false);
    expect(isPathForbidden('.github/README.md')).toBe(false);
    expect(isPathForbidden('docs/package.md')).toBe(false);
  });

  it('handles exact match vs prefix correctly', () => {
    expect(isPathForbidden('.github/workflows/ci.yml')).toBe(true);
    expect(isPathForbidden('.github/other/file.txt')).toBe(false);
  });
});

describe('validatePath', () => {
  it('accepts allowed and non-forbidden paths', () => {
    const result = validatePath('docs/guide.md');

    expect(result.allowed).toBe(true);
    expect(result.forbidden).toBe(false);
    expect(result.valid).toBe(true);
  });

  it('rejects forbidden paths by default', () => {
    const result = validatePath('.github/workflows/ci.yml');

    expect(result.allowed).toBe(false);
    expect(result.forbidden).toBe(true);
    expect(result.valid).toBe(false);
  });

  it('rejects non-allowed paths by default', () => {
    const result = validatePath('src/index.ts');

    expect(result.allowed).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('accepts forbidden paths with allowForbidden option', () => {
    const result = validatePath('.github/workflows/ci.yml', {
      allowForbidden: true,
    });

    expect(result.forbidden).toBe(true);
    expect(result.valid).toBe(false); // Still invalid because not in allowlist
  });

  it('accepts non-allowed paths with allowNonAllowed option', () => {
    const result = validatePath('src/index.ts', {
      allowNonAllowed: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.forbidden).toBe(false);
    expect(result.valid).toBe(true);
  });

  it('combines both options correctly', () => {
    const result = validatePath('.github/workflows/ci.yml', {
      allowForbidden: true,
      allowNonAllowed: true,
    });

    expect(result.valid).toBe(true);
  });

  it('provides reason for rejection', () => {
    const result = validatePath('.github/workflows/ci.yml');

    expect(result.reason).toContain('forbidden');
  });

  it('handles allowed prefix in README.md', () => {
    const result = validatePath('README.md');

    expect(result.allowed).toBe(true);
    expect(result.valid).toBe(true);
  });
});

describe('path policy constants', () => {
  it('has correct allowed prefixes', () => {
    expect(ALLOWED_PREFIXES).toContain('docs/');
    expect(ALLOWED_PREFIXES).toContain('.repo/');
    expect(ALLOWED_PREFIXES).toContain('README.md');
  });

  it('has correct forbidden prefixes', () => {
    expect(FORBIDDEN_PREFIXES).toContain('.github/workflows/');
    expect(FORBIDDEN_PREFIXES).toContain('package.json');
    expect(FORBIDDEN_PREFIXES).toContain('.env');
  });

  it('includes all lockfile variations', () => {
    expect(FORBIDDEN_PREFIXES).toContain('package-lock.json');
    expect(FORBIDDEN_PREFIXES).toContain('yarn.lock');
    expect(FORBIDDEN_PREFIXES).toContain('pnpm-lock.yaml');
  });
});
