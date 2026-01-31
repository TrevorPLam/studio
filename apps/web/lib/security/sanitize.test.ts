import { describe, expect, it } from 'vitest';
import { sanitise, sanitizeString } from './sanitize';

describe('sanitizeString', () => {
  it('removes dangerous script tags', () => {
    const result = sanitizeString('<script>alert("xss")</script>Hello');

    expect(result.clean).toBe('Hello');
    expect(result.modified).toBe(true);
  });

  it('removes onclick event handlers', () => {
    const result = sanitizeString('<div onclick="alert(1)">Click me</div>');

    expect(result.clean).not.toContain('onclick');
    expect(result.modified).toBe(true);
  });

  it('escapes HTML entities', () => {
    const result = sanitizeString('<img src=x onerror=alert(1)>');

    expect(result.modified).toBe(true);
    expect(result.clean).not.toContain('onerror');
  });

  it('handles SQL injection patterns', () => {
    const result = sanitizeString("'; DROP TABLE users--");

    expect(result.warnings).toContain('SQL_INJECTION');
    expect(result.clean).not.toContain('DROP TABLE');
  });

  it('returns unmodified safe strings', () => {
    const result = sanitizeString('Hello, world!');

    expect(result.clean).toBe('Hello, world!');
    expect(result.modified).toBe(false);
  });

  it('removes control characters', () => {
    const result = sanitizeString('Hello\x00World\x01');

    expect(result.clean).not.toContain('\x00');
    expect(result.clean).not.toContain('\x01');
    expect(result.modified).toBe(true);
  });
});

describe('sanitise', () => {
  it('strips hidden unicode characters', () => {
    const result = sanitise('delete\u200bFiles()');

    expect(result.clean).toBe('deleteFiles()');
    expect(result.rejected).toContain('ZERO WIDTH SPACE');
  });

  it('detects zero-width joiners', () => {
    const result = sanitise('test\u200dstring');

    expect(result.clean).toBe('teststring');
    expect(result.rejected).toContain('ZERO WIDTH JOINER');
  });

  it('handles multiple hidden characters', () => {
    const result = sanitise('a\u200bb\u200cc\u200dd');

    expect(result.clean).toBe('abcd');
    expect(result.rejected.length).toBeGreaterThan(0);
  });

  it('returns safe strings unchanged', () => {
    const result = sanitise('normal text');

    expect(result.clean).toBe('normal text');
    expect(result.rejected).toEqual([]);
  });

  it('handles empty strings', () => {
    const result = sanitise('');

    expect(result.clean).toBe('');
    expect(result.rejected).toEqual([]);
  });
});
