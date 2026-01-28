/**
 * ============================================================================
 * INPUT SANITIZATION MODULE
 * ============================================================================
 *
 * @file src/lib/security/sanitize.ts
 * @module sanitize
 * @epic BP-SEC-004, AI-SAFETY-002
 *
 * PURPOSE:
 * Sanitize user input to prevent XSS, injection attacks, and other security vulnerabilities.
 * Provides utilities for sanitizing strings, HTML content, and structured data.
 * Includes hidden Unicode character removal per AI-SAFETY-002.
 *
 * DEPENDENCIES:
 * - None (pure functions, no external libraries for basic sanitization)
 *
 * RELATED FILES:
 * - src/lib/validation.ts (Integrates sanitization into validation layer)
 * - All API routes (Use sanitization before processing user input)
 *
 * SECURITY NOTES:
 * - All user input must be sanitized before processing or storage
 * - HTML content requires special handling (strip tags or escape)
 * - SQL injection prevention via parameterized queries (not handled here)
 * - Command injection prevention via input validation (not handled here)
 * - Hidden Unicode characters removed per AI-SAFETY-002
 *
 * ============================================================================
 */

import { logger } from '@/lib/logger';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Sanitization result with cleaned input and metadata.
 */
export interface SanitizationResult {
  /** Sanitized string */
  clean: string;
  /** Characters/patterns that were removed or modified */
  removed: string[];
  /** Whether any sanitization occurred */
  modified: boolean;
}

// ============================================================================
// SECTION: XSS PREVENTION
// ============================================================================

/**
 * Dangerous HTML/JavaScript patterns to remove.
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi, // CSS expressions
];

/**
 * HTML entities that should be escaped.
 */
const HTML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '&': '&amp;',
  '/': '&#x2F;',
};

// ============================================================================
// SECTION: INJECTION PREVENTION
// ============================================================================

/**
 * SQL injection patterns (for detection/warning, not prevention - use parameterized queries).
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/gi,
  /[';+\-%]|--|\/\*|\*\//gi,
];

/**
 * Command injection patterns (for detection/warning).
 */
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]]/g,
  /\b(rm|del|delete|format|mkfs|dd|shutdown|reboot)\b/gi,
];

// ============================================================================
// SECTION: STRING SANITIZATION
// ============================================================================

/**
 * Sanitize a string by removing dangerous patterns and escaping special characters.
 *
 * This is a basic sanitization. For production use with HTML content,
 * consider using a library like DOMPurify.
 *
 * @param input - String to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string and metadata
 *
 * @example
 * ```typescript
 * const result = sanitizeString('<script>alert("xss")</script>Hello');
 * // result.clean = 'Hello'
 * // result.modified = true
 * ```
 */
export function sanitizeString(
  input: string,
  options: {
    /** Remove HTML tags (default: true) */
    removeHtml?: boolean;
    /** Escape HTML entities (default: true) */
    escapeHtml?: boolean;
    /** Remove control characters (default: true) */
    removeControlChars?: boolean;
    /** Maximum length (default: no limit) */
    maxLength?: number;
  } = {}
): SanitizationResult {
  const { removeHtml = true, escapeHtml = true, removeControlChars = true, maxLength } = options;

  let clean = input;
  const removed: string[] = [];
  let modified = false;

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    const matches = clean.match(pattern);
    if (matches) {
      removed.push(...matches);
      clean = clean.replace(pattern, '');
      modified = true;
    }
  }

  // Remove HTML tags if requested
  if (removeHtml) {
    const htmlTagPattern = /<[^>]+>/g;
    const matches = clean.match(htmlTagPattern);
    if (matches) {
      removed.push(...matches);
      clean = clean.replace(htmlTagPattern, '');
      modified = true;
    }
  }

  // Escape HTML entities if requested
  if (escapeHtml) {
    let escaped = clean;
    for (const [char, entity] of Object.entries(HTML_ENTITIES)) {
      if (escaped.includes(char)) {
        escaped = escaped.replace(
          new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          entity
        );
        modified = true;
      }
    }
    clean = escaped;
  }

  // Remove control characters (except newlines and tabs)
  if (removeControlChars) {
    const controlCharPattern = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g;
    const matches = clean.match(controlCharPattern);
    if (matches) {
      removed.push(...matches);
      clean = clean.replace(controlCharPattern, '');
      modified = true;
    }
  }

  // Truncate if maxLength specified
  if (maxLength !== undefined && clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
    modified = true;
  }

  return { clean, removed, modified };
}

/**
 * Sanitize HTML content by removing dangerous tags and attributes.
 *
 * For production use, consider using DOMPurify library.
 * This is a basic implementation that removes dangerous patterns.
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  let clean = html;

  // Remove script tags and content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove iframe tags
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: and data: URLs
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/data:text\/html/gi, '');

  // Remove style attributes with expressions
  clean = clean.replace(/style\s*=\s*["'][^"']*expression[^"']*["']/gi, '');

  return clean;
}

// ============================================================================
// SECTION: INJECTION DETECTION
// ============================================================================

/**
 * Detect potential SQL injection patterns in input.
 *
 * Note: This is for logging/warning only. Always use parameterized queries
 * to prevent SQL injection. This function does NOT prevent SQL injection.
 *
 * @param input - String to check
 * @returns Array of detected patterns
 */
export function detectSqlInjection(input: string): string[] {
  const detected: string[] = [];

  for (const pattern of SQL_INJECTION_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      detected.push(...matches);
    }
  }

  return detected;
}

/**
 * Detect potential command injection patterns in input.
 *
 * Note: This is for logging/warning only. Always validate and sanitize
 * input before using in shell commands. This function does NOT prevent
 * command injection.
 *
 * @param input - String to check
 * @returns Array of detected patterns
 */
export function detectCommandInjection(input: string): string[] {
  const detected: string[] = [];

  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      detected.push(...matches);
    }
  }

  return detected;
}

// ============================================================================
// SECTION: HIDDEN UNICODE SANITIZATION
// ============================================================================

/**
 * Allowed characters: printable ASCII (0x20-0x7E), tabs, newlines, carriage returns.
 * This pattern allows:
 * - Printable ASCII: space through tilde (32-126)
 * - Tab (0x09, \t)
 * - Newline (0x0A, \n)
 * - Carriage return (0x0D, \r)
 *
 * Rejects all C0 control codes (0x00-0x1F except tab/newline/carriage return)
 * and C1 control codes (0x80-0x9F).
 */
const ALLOWED_CHARS = /^[\x20-\x7E\t\n\r]$/;

/**
 * Zero-width and bidirectional Unicode characters that can hide malicious content.
 */
const HIDDEN_UNICODE_CHARS = [
  '\u200B', // Zero-width space
  '\u200C', // Zero-width non-joiner
  '\u200D', // Zero-width joiner
  '\uFEFF', // Zero-width no-break space (BOM)
  '\u202A', // Left-to-right embedding
  '\u202B', // Right-to-left embedding
  '\u202C', // Pop directional formatting
  '\u202D', // Left-to-right override
  '\u202E', // Right-to-left override
  '\u2060', // Word joiner
  '\u2061', // Function application
  '\u2062', // Invisible times
  '\u2063', // Invisible separator
  '\u2064', // Invisible plus
];

/**
 * Get Unicode character name for logging.
 * Falls back to code point if name unavailable.
 */
function getUnicodeName(char: string): string {
  try {
    // Use Intl.Segmenter or fallback to code point
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      return 'UNKNOWN';
    }

    // Check if it's a known hidden character
    const hiddenChar = HIDDEN_UNICODE_CHARS.find((c) => c === char);
    if (hiddenChar) {
      const names: Record<string, string> = {
        '\u200B': 'ZERO WIDTH SPACE',
        '\u200C': 'ZERO WIDTH NON-JOINER',
        '\u200D': 'ZERO WIDTH JOINER',
        '\uFEFF': 'ZERO WIDTH NO-BREAK SPACE',
        '\u202A': 'LEFT-TO-RIGHT EMBEDDING',
        '\u202B': 'RIGHT-TO-LEFT EMBEDDING',
        '\u202C': 'POP DIRECTIONAL FORMATTING',
        '\u202D': 'LEFT-TO-RIGHT OVERRIDE',
        '\u202E': 'RIGHT-TO-LEFT OVERRIDE',
        '\u2060': 'WORD JOINER',
        '\u2061': 'FUNCTION APPLICATION',
        '\u2062': 'INVISIBLE TIMES',
        '\u2063': 'INVISIBLE SEPARATOR',
        '\u2064': 'INVISIBLE PLUS',
      };
      return names[char] || `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
    }

    return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Check if a character is a non-Latin script (for flagging, not blocking).
 *
 * @param char - Character to check
 * @returns true if character is non-Latin (emoji, CJK, Arabic, etc.)
 */
function isNonLatinScript(char: string): boolean {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    return false;
  }

  // Emoji ranges
  if (
    (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) || // Emoticons & Symbols
    (codePoint >= 0x1f600 && codePoint <= 0x1f64f) || // Emoticons
    (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) || // Supplemental Symbols
    (codePoint >= 0x2600 && codePoint <= 0x26ff) || // Miscellaneous Symbols
    (codePoint >= 0x2700 && codePoint <= 0x27bf) // Dingbats
  ) {
    return true;
  }

  // CJK (Chinese, Japanese, Korean)
  if (
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) || // CJK Unified Ideographs
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) || // CJK Extension A
    (codePoint >= 0x20000 && codePoint <= 0x2a6df) || // CJK Extension B
    (codePoint >= 0x3040 && codePoint <= 0x309f) || // Hiragana
    (codePoint >= 0x30a0 && codePoint <= 0x30ff) // Katakana
  ) {
    return true;
  }

  // Arabic, Hebrew, and other RTL scripts
  if (
    (codePoint >= 0x0590 && codePoint <= 0x05ff) || // Hebrew
    (codePoint >= 0x0600 && codePoint <= 0x06ff) || // Arabic
    (codePoint >= 0x0700 && codePoint <= 0x074f) // Syriac
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitize input by removing hidden Unicode characters and control codes.
 *
 * Per AI-SAFETY-002:
 * - Allow-list printable ASCII, tabs, newlines
 * - Reject all C0/C1 control codes
 * - Normalize NFC before filtering
 * - Flag (do not block) non-Latin scripts for audit
 *
 * @param input - String to sanitize
 * @returns Sanitized string and list of rejected characters
 *
 * @example
 * ```typescript
 * const result = sanitise('delete\u200bFiles()');
 * // result.clean = 'deleteFiles()'
 * // result.rejected = ['ZERO WIDTH SPACE']
 * ```
 */
export function sanitise(input: string): { clean: string; rejected: string[] } {
  // Normalize to NFC (Canonical Decomposition, followed by Canonical Composition)
  // This ensures consistent representation of accented characters
  const normalized = input.normalize('NFC');

  const rejected: string[] = [];
  const flagged: string[] = [];

  const clean = [...normalized]
    .filter((char) => {
      // Check if character is in allowed set
      if (ALLOWED_CHARS.test(char)) {
        return true;
      }

      // Check if it's a hidden Unicode character
      if (HIDDEN_UNICODE_CHARS.includes(char)) {
        rejected.push(getUnicodeName(char));
        return false;
      }

      // Check if it's a control code (C0 or C1)
      const codePoint = char.codePointAt(0);
      if (codePoint !== undefined) {
        // C0 control codes: 0x00-0x1F (except tab, newline, carriage return)
        if (codePoint >= 0x00 && codePoint <= 0x1f) {
          if (codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d) {
            rejected.push(getUnicodeName(char));
            return false;
          }
        }

        // C1 control codes: 0x80-0x9F
        if (codePoint >= 0x80 && codePoint <= 0x9f) {
          rejected.push(getUnicodeName(char));
          return false;
        }
      }

      // Flag non-Latin scripts for audit (but allow them through)
      if (isNonLatinScript(char)) {
        flagged.push(getUnicodeName(char));
        // Allow through but log for audit
        return true;
      }

      // Reject everything else (non-printable, non-allowed)
      rejected.push(getUnicodeName(char));
      return false;
    })
    .join('');

  // Log flagged characters for audit
  if (flagged.length > 0) {
    logger.warn('Non-Latin script characters detected (flagged for audit)', {
      flagged,
      inputLength: input.length,
      cleanLength: clean.length,
    });
  }

  return { clean, rejected };
}

// ============================================================================
// SECTION: VALIDATION INTEGRATION
// ============================================================================

/**
 * Sanitize a string and log if modifications were made.
 *
 * This is a convenience function that combines sanitization with logging
 * for audit purposes. Applies both XSS sanitization and hidden Unicode removal.
 *
 * @param input - String to sanitize
 * @param context - Context for logging (e.g., field name, endpoint)
 * @returns Sanitized string
 */
export function sanitizeAndLog(
  input: string,
  context?: { field?: string; endpoint?: string; userId?: string }
): string {
  // First remove hidden Unicode characters
  const unicodeResult = sanitise(input);

  // Then apply XSS sanitization
  const xssResult = sanitizeString(unicodeResult.clean);

  if (unicodeResult.rejected.length > 0 || xssResult.modified) {
    // Log sanitization for audit
    logger.warn('Input sanitized', {
      context,
      unicodeRejected: unicodeResult.rejected,
      xssRemoved: xssResult.removed,
      originalLength: input.length,
      sanitizedLength: xssResult.clean.length,
    });
  }

  return xssResult.clean;
}
