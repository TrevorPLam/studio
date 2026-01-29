/**
 * ============================================================================
 * CORRELATION ID UTILITIES
 * ============================================================================
 *
 * @file src/lib/observability/correlation.ts
 * @module correlation
 * @epic P0 Observability, BP-OBS-005
 *
 * PURPOSE:
 * Utilities for generating and managing correlation IDs for request tracing.
 * Enables correlated logs by sessionId + requestId + (if webhook) deliveryId.
 *
 * FEATURES:
 * - Request ID generation
 * - Correlation context management
 * - AsyncLocalStorage for request-scoped correlation
 *
 * RELATED FILES:
 * - src/lib/logger.ts (Uses correlation context)
 * - middleware.ts (Adds correlation to requests)
 * - All API routes (Use correlation IDs)
 *
 * ============================================================================
 */

import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Correlation context for a request.
 * Contains IDs that help trace requests across services and logs.
 */
export interface CorrelationContext {
  /** Unique request ID for this HTTP request */
  requestId: string;

  /** Session ID if available (from agent session) */
  sessionId?: string;

  /** Webhook delivery ID if this is a webhook request */
  deliveryId?: string;

  /** User ID if authenticated */
  userId?: string;
}

// ============================================================================
// SECTION: ASYNC LOCAL STORAGE
// ============================================================================

/**
 * AsyncLocalStorage instance for storing correlation context.
 * This allows correlation IDs to be accessible throughout the request lifecycle
 * without explicitly passing them through every function call.
 */
const correlationStorage = new AsyncLocalStorage<CorrelationContext>();

// ============================================================================
// SECTION: CORRELATION ID GENERATION
// ============================================================================

/**
 * Generate a new request ID.
 *
 * @returns Unique request ID (UUID v4)
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Get the current correlation context from AsyncLocalStorage.
 *
 * @returns Current correlation context or undefined if not set
 */
export function getCorrelationContext(): CorrelationContext | undefined {
  return correlationStorage.getStore();
}

/**
 * Get the current request ID.
 *
 * @returns Current request ID or undefined if not set
 */
export function getRequestId(): string | undefined {
  return correlationStorage.getStore()?.requestId;
}

/**
 * Get the current session ID.
 *
 * @returns Current session ID or undefined if not set
 */
export function getSessionId(): string | undefined {
  return correlationStorage.getStore()?.sessionId;
}

/**
 * Run a function with correlation context.
 * This sets up the correlation context in AsyncLocalStorage for the duration
 * of the function execution.
 *
 * @param context - Correlation context to use
 * @param fn - Function to execute with correlation context
 * @returns Result of the function
 */
export function withCorrelationContext<T>(
  context: CorrelationContext,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return correlationStorage.run(context, fn);
}

/**
 * Update the correlation context with additional fields.
 * Merges new fields into the existing context.
 *
 * @param updates - Fields to update in correlation context
 */
export function updateCorrelationContext(updates: Partial<CorrelationContext>): void {
  const current = correlationStorage.getStore();
  if (current) {
    Object.assign(current, updates);
  }
}

/**
 * Set session ID in correlation context.
 *
 * @param sessionId - Session ID to set
 */
export function setSessionId(sessionId: string): void {
  updateCorrelationContext({ sessionId });
}

/**
 * Set user ID in correlation context.
 *
 * @param userId - User ID to set
 */
export function setUserId(userId: string): void {
  updateCorrelationContext({ userId });
}

/**
 * Set webhook delivery ID in correlation context.
 *
 * @param deliveryId - Delivery ID to set
 */
export function setDeliveryId(deliveryId: string): void {
  updateCorrelationContext({ deliveryId });
}
