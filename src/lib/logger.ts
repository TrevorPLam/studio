/**
 * ============================================================================
 * LOGGING MODULE
 * ============================================================================
 *
 * @file src/lib/logger.ts
 * @module logger
 *
 * PURPOSE:
 * Structured logging utility with context support and environment-aware output.
 * Provides consistent logging interface across the application.
 *
 * FEATURES:
 * - Structured logging with context objects
 * - Environment-aware (debug only in development)
 * - Timestamp and log level formatting
 * - Error stack trace support
 *
 * RELATED FILES:
 * - src/lib/github-app.ts (Uses logger for token operations)
 * - All API routes (Use logger for request/response logging)
 *
 * FUTURE ENHANCEMENTS:
 * - Integration with error tracking (Sentry, etc.)
 * - Structured logging to external service
 * - Log correlation IDs (sessionId, requestId)
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Log level severity.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure.
 */
interface LogEntry {
  /** Log severity level */
  level: LogLevel;

  /** Log message */
  message: string;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Additional context data */
  context?: Record<string, unknown>;

  /** Error object (for error logs) */
  error?: Error;
}

// ============================================================================
// SECTION: LOGGER CLASS
// ============================================================================

/**
 * Logger class providing structured logging functionality.
 *
 * Features:
 * - Environment-aware output (debug only in development)
 * - Context support for structured data
 * - Error stack trace logging
 * - Consistent formatting
 */
class Logger {
  /** Whether running in development mode */
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log entry into human-readable string.
   *
   * @param entry - Log entry to format
   * @returns Formatted log string
   */
  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? ` Error: ${entry.error.message}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}`;
  }

  /**
   * Internal log method handling all log levels.
   *
   * @param level - Log severity level
   * @param message - Log message
   * @param context - Optional context data
   * @param error - Optional error object
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        // Debug logs only in development
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted, error?.stack);
        // TODO: In production, send to error tracking service (Sentry, etc.)
        break;
    }
  }

  /**
   * Log debug message (development only).
   *
   * @param message - Debug message
   * @param context - Optional context data
   */
  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  /**
   * Log info message.
   *
   * @param message - Info message
   * @param context - Optional context data
   */
  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  /**
   * Log warning message.
   *
   * @param message - Warning message
   * @param context - Optional context data
   */
  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  /**
   * Log error message with error object.
   *
   * @param message - Error message
   * @param error - Error object (optional)
   * @param context - Optional context data
   */
  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, context, error);
  }
}

// ============================================================================
// SECTION: EXPORT
// ============================================================================

/**
 * Singleton logger instance.
 *
 * Use this throughout the application for consistent logging.
 *
 * @example
 * ```typescript
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API request failed', error, { endpoint: '/api/sessions' });
 * ```
 */
export const logger = new Logger();
