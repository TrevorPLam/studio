/**
 * ============================================================================
 * OBSERVABILITY MODULE - Central Export
 * ============================================================================
 *
 * @file src/lib/observability/index.ts
 * @module observability
 * @epic BP-OBS-005
 *
 * PURPOSE:
 * Central export point for observability features including metrics and tracing.
 * Provides unified interface for instrumentation across the application.
 *
 * FEATURES:
 * - Metrics collection (Prometheus-compatible)
 * - Distributed tracing (OpenTelemetry)
 * - Correlation ID management
 * - Unified observability interface
 *
 * RELATED FILES:
 * - src/lib/observability/metrics.ts (Metrics implementation)
 * - src/lib/observability/tracing.ts (Tracing implementation)
 * - src/lib/observability/correlation.ts (Correlation IDs)
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: EXPORTS
// ============================================================================

// Metrics
export {
  recordHttpRequest,
  recordBusinessMetric,
  getPrometheusExporter,
  getMeterProvider,
  getMeter,
  shutdownMetrics,
  initializeMetrics,
} from './metrics';

// Tracing
export {
  createSpan,
  createHttpSpan,
  withSpan,
  withSpanSync,
  getActiveSpan,
  addSpanAttributes,
  addSpanEvent,
  recordSpanException,
  getTracerProvider,
  getTracer,
  shutdownTracing,
  initializeTracing,
} from './tracing';

// Correlation
export {
  generateRequestId,
  getCorrelationContext,
  getRequestId,
  getSessionId,
  withCorrelationContext,
  updateCorrelationContext,
  setSessionId,
  setUserId,
  setDeliveryId,
  type CorrelationContext,
} from './correlation';

// ============================================================================
// SECTION: UNIFIED SHUTDOWN
// ============================================================================

/**
 * Shutdown all observability systems gracefully.
 * Should be called on application shutdown.
 *
 * @returns Promise that resolves when all systems are shut down
 */
export async function shutdownObservability(): Promise<void> {
  const { shutdownMetrics } = await import('./metrics');
  const { shutdownTracing } = await import('./tracing');

  await Promise.all([shutdownMetrics(), shutdownTracing()]);

  console.log('[Observability] All systems shut down gracefully');
}

// ============================================================================
// SECTION: INITIALIZATION
// ============================================================================

/**
 * Initialize all observability systems.
 * Call this early in application startup.
 */
export function initializeObservability(): void {
  console.log('[Observability] Initializing observability systems...');

  // Metrics and tracing auto-initialize via their modules
  // This function is a no-op but kept for API consistency

  console.log('[Observability] All systems initialized');
}
