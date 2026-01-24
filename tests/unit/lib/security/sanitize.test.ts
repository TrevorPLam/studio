/**
 * Unit tests for input sanitization module
 * @file tests/unit/lib/security/sanitize.test.ts
 * @epic BP-SEC-004, AI-SAFETY-002
 */

import {
  sanitizeString,
  sanitizeHtml,
  sanitise,
  detectSqlInjection,
  detectCommandInjection,
  sanitizeAndLog,
} from '@/lib/security/sanitize';

describe('BP-SEC-004 — Input Sanitization Tests', () => {
  describe('sanitizeString()', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeString(input);
      expect(result.clean).toBe('Hello');
      expect(result.modified).toBe(true);
      expect(result.removed.length).toBeGreaterThan(0);
    });

    it('removes iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Content';
      const result = sanitizeString(input);
      expect(result.clean).toBe('Content');
      expect(result.modified).toBe(true);
    });

    it('removes javascript: URLs', () => {
      const input = 'Click <a href="javascript:alert(1)">here</a>';
      const result = sanitizeString(input);
      expect(result.clean).not.toContain('javascript:');
      expect(result.modified).toBe(true);
    });

    it('removes event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeString(input);
      expect(result.clean).not.toContain('onclick');
      expect(result.modified).toBe(true);
    });

    it('escapes HTML entities', () => {
      const input = '<div>Hello & World</div>';
      const result = sanitizeString(input, { escapeHtml: true });
      expect(result.clean).toContain('&amp;');
      expect(result.modified).toBe(true);
    });

    it('removes control characters', () => {
      const input = 'Hello\x00\x01\x02World';
      const result = sanitizeString(input, { removeControlChars: true });
      expect(result.clean).toBe('HelloWorld');
      expect(result.modified).toBe(true);
    });

    it('preserves newlines and tabs', () => {
      const input = 'Line 1\nLine 2\tTabbed';
      const result = sanitizeString(input);
      expect(result.clean).toContain('\n');
      expect(result.clean).toContain('\t');
    });

    it('truncates to maxLength', () => {
      const input = 'A'.repeat(200);
      const result = sanitizeString(input, { maxLength: 100 });
      expect(result.clean.length).toBe(100);
      expect(result.modified).toBe(true);
    });

    it('does not modify safe input', () => {
      const input = 'Hello, World!';
      const result = sanitizeString(input);
      expect(result.clean).toBe(input);
      expect(result.modified).toBe(false);
    });
  });

  describe('sanitizeHtml()', () => {
    it('removes script tags and content', () => {
      const html = '<div>Hello</div><script>alert("xss")</script><p>World</p>';
      const clean = sanitizeHtml(html);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('<div>Hello</div>');
      expect(clean).toContain('<p>World</p>');
    });

    it('removes iframe tags', () => {
      const html = '<iframe src="evil.com"></iframe><p>Content</p>';
      const clean = sanitizeHtml(html);
      expect(clean).not.toContain('<iframe');
      expect(clean).toContain('<p>Content</p>');
    });

    it('removes event handlers', () => {
      const html = '<div onclick="alert(1)" onerror="evil()">Click</div>';
      const clean = sanitizeHtml(html);
      expect(clean).not.toContain('onclick');
      expect(clean).not.toContain('onerror');
    });

    it('removes javascript: URLs', () => {
      const html = '<a href="javascript:alert(1)">Link</a>';
      const clean = sanitizeHtml(html);
      expect(clean).not.toContain('javascript:');
    });
  });

  describe('sanitise() — Hidden Unicode Sanitization', () => {
    it('removes zero-width space', () => {
      const input = 'delete\u200bFiles()';
      const result = sanitise(input);
      expect(result.clean).toBe('deleteFiles()');
      expect(result.rejected).toContain('ZERO WIDTH SPACE');
    });

    it('removes zero-width non-joiner', () => {
      const input = 'test\u200Ctext';
      const result = sanitise(input);
      expect(result.clean).toBe('testtext');
      expect(result.rejected.length).toBeGreaterThan(0);
    });

    it('removes bidirectional markers', () => {
      const input = 'Hello\u202E\u202DWorld';
      const result = sanitise(input);
      expect(result.clean).toBe('HelloWorld');
      expect(result.rejected.length).toBeGreaterThan(0);
    });

    it('removes C0 control codes (except tab, newline, carriage return)', () => {
      const input = 'Hello\x00\x01\x02World';
      const result = sanitise(input);
      expect(result.clean).toBe('HelloWorld');
      expect(result.rejected.length).toBeGreaterThan(0);
    });

    it('preserves tab, newline, and carriage return', () => {
      const input = 'Line1\nLine2\tTabbed\rReturn';
      const result = sanitise(input);
      expect(result.clean).toContain('\n');
      expect(result.clean).toContain('\t');
      expect(result.clean).toContain('\r');
    });

    it('normalizes to NFC', () => {
      // Test that normalization happens (accented characters)
      const input = 'café'; // Could be composed or decomposed
      const result = sanitise(input);
      expect(result.clean).toBeTruthy();
    });

    it('allows printable ASCII', () => {
      const input = 'Hello, World! 123 @#$%^&*()';
      const result = sanitise(input);
      expect(result.clean).toBe(input);
      expect(result.rejected.length).toBe(0);
    });

    it('flags non-Latin scripts but allows them', () => {
      const input = 'Hello 世界 🌍';
      const result = sanitise(input);
      // Non-Latin scripts should pass through (flagged, not blocked)
      expect(result.clean.length).toBeGreaterThan(0);
    });
  });

  describe('detectSqlInjection()', () => {
    it('detects SQL keywords', () => {
      const input = "SELECT * FROM users WHERE id = '1'";
      const detected = detectSqlInjection(input);
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some(d => d.includes('SELECT'))).toBe(true);
    });

    it('detects SQL injection patterns', () => {
      const input = "'; DROP TABLE users; --";
      const detected = detectSqlInjection(input);
      expect(detected.length).toBeGreaterThan(0);
    });

    it('does not detect safe input', () => {
      const input = 'Hello, World!';
      const detected = detectSqlInjection(input);
      expect(detected.length).toBe(0);
    });
  });

  describe('detectCommandInjection()', () => {
    it('detects command separators', () => {
      const input = 'ls; rm -rf /';
      const detected = detectCommandInjection(input);
      expect(detected.length).toBeGreaterThan(0);
    });

    it('detects dangerous commands', () => {
      const input = 'rm -rf /';
      const detected = detectCommandInjection(input);
      expect(detected.length).toBeGreaterThan(0);
    });

    it('does not detect safe input', () => {
      const input = 'Hello, World!';
      const detected = detectCommandInjection(input);
      expect(detected.length).toBe(0);
    });
  });

  describe('sanitizeAndLog()', () => {
    it('sanitizes and logs modifications', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeAndLog(input, { field: 'content' });
      
      expect(result).toBe('Hello');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('does not log when no modifications', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const input = 'Hello, World!';
      const result = sanitizeAndLog(input);
      
      expect(result).toBe(input);
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
