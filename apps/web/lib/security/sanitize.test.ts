import { describe, expect, it } from 'vitest';
import { sanitise, sanitizeString } from './sanitize';

describe('sanitizeString', () => {
  it('removes dangerous script tags', () => {
    const result = sanitizeString('<script>alert("xss")</script>Hello');

    expect(result.clean).toBe('Hello');
    expect(result.modified).toBe(true);
  });
});

describe('sanitise', () => {
  it('strips hidden unicode characters', () => {
    const result = sanitise('delete\u200bFiles()');

    expect(result.clean).toBe('deleteFiles()');
    expect(result.rejected).toContain('ZERO WIDTH SPACE');
  });
});
