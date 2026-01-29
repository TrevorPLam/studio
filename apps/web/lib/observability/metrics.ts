/**
 * ============================================================================
 * METRICS MODULE - OpenTelemetry Metrics Collection
 * ============================================================================
 *
 * @file src/lib/observability/metrics.ts
 * @module metrics
 * @epic BP-OBS-005
 *
 * PURPOSE:
 * Implements metrics collection using OpenTelemetry for production observability.
 * Tracks request counts, latency, error rates, and business metrics.
 *
 * FEATURES:
 * - HTTP request metrics (count, duration, error rate)
 * - Business metrics (sessions created, previews generated)
 * - Prometheus-compatible export format
 * - Metric aggregation and labels
 *
 * RELATED FILES:
 * - src/lib/observability/tracing.ts (Distributed tracing)
 * - src/lib/observability/correlation.ts (Correlation IDs)
 * - All API routes (instrumented with metrics)
 *
 * IMPLEMENTATION NOTES:
 * - Uses OpenTelemetry SDK for metrics collection
 * - Exports to Prometheus format via /api/metrics endpoint
 * - Includes request, latency, and error histograms
 * - Business metrics for domain events
 *
 * ============================================================================
 */

import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { Counter, Histogram, Meter } from '@opentelemetry/api';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * HTTP method types for metrics labels.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Metric labels for HTTP requests.
 */
interface HttpMetricLabels {
  /** HTTP method */
  method: HttpMethod;
  /** Route path pattern */
  route: string;
  /** HTTP status code */
  statusCode: number;
}

/**
 * Business metric types.
 */
type BusinessMetric =
  | 'session_created'
  | 'session_updated'
  | 'session_deleted'
  | 'preview_generated'
  | 'preview_applied'
  | 'approval_granted'
  | 'approval_denied';

// ============================================================================
// SECTION: CONFIGURATION
// ============================================================================

/**
 * Service metadata for metrics.
 */
const SERVICE_NAME = 'firebase-studio';
const SERVICE_VERSION = process.env.npm_package_version || '0.1.0';

/**
 * Prometheus exporter configuration.
 * Exposes metrics at /metrics endpoint on port 9464.
 */
const prometheusExporter = new PrometheusExporter(
  {
    port: Number(process.env.METRICS_PORT) || 9464,
    endpoint: '/metrics',
  },
  () => {
    console.log(
      '[Metrics] Prometheus exporter listening on port',
      Number(process.env.METRICS_PORT) || 9464
    );
  }
);

/**
 * OpenTelemetry resource with service metadata.
 */
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
});

/**
 * Metric reader for periodic export.
 */
const metricReader = new PeriodicExportingMetricReader({
  exporter: prometheusExporter,
  exportIntervalMillis: 10000, // Export every 10 seconds
});

/**
 * Meter provider for metrics collection.
 */
const meterProvider = new MeterProvider({
  resource,
  readers: [metricReader],
});

/**
 * Default meter instance.
 */
const meter: Meter = meterProvider.getMeter(SERVICE_NAME);

// ============================================================================
// SECTION: HTTP METRICS
// ============================================================================

/**
 * Counter for HTTP requests.
 * Tracks total number of HTTP requests by method, route, and status code.
 */
const httpRequestCounter: Counter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
  unit: 'requests',
});

/**
 * Histogram for HTTP request duration.
 * Tracks latency distribution of HTTP requests.
 */
const httpRequestDuration: Histogram = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
  unit: 'ms',
});

/**
 * Counter for HTTP errors.
 * Tracks total number of HTTP errors (4xx, 5xx status codes).
 */
const httpErrorCounter: Counter = meter.createCounter('http_errors_total', {
  description: 'Total number of HTTP errors',
  unit: 'errors',
});

// ============================================================================
// SECTION: BUSINESS METRICS
// ============================================================================

/**
 * Counter for business events.
 * Tracks domain-specific events like sessions created, previews generated.
 */
const businessMetricCounter: Counter = meter.createCounter('business_events_total', {
  description: 'Total number of business events',
  unit: 'events',
});

// ============================================================================
// SECTION: METRIC RECORDING FUNCTIONS
// ============================================================================

/**
 * Record an HTTP request metric.
 *
 * @param method - HTTP method
 * @param route - Route path pattern (e.g., "/api/sessions/[id]")
 * @param statusCode - HTTP status code
 * @param durationMs - Request duration in milliseconds
 *
 * @example
 * ```typescript
 * const startTime = Date.now();
 * // ... handle request ...
 * recordHttpRequest('GET', '/api/sessions', 200, Date.now() - startTime);
 * ```
 */
export function recordHttpRequest(
  method: HttpMethod,
  route: string,
  statusCode: number,
  durationMs: number
): void {
  const labels: HttpMetricLabels = { method, route, statusCode };

  // Record request count
  httpRequestCounter.add(1, labels);

  // Record request duration
  httpRequestDuration.record(durationMs, labels);

  // Record error if status code indicates error
  if (statusCode >= 400) {
    httpErrorCounter.add(1, labels);
  }
}

/**
 * Record a business metric event.
 *
 * @param event - Business event type
 * @param labels - Additional labels for the event
 *
 * @example
 * ```typescript
 * recordBusinessMetric('session_created', { userId: '123' });
 * recordBusinessMetric('preview_generated', { sessionId: '456' });
 * ```
 */
export function recordBusinessMetric(
  event: BusinessMetric,
  labels?: Record<string, string | number>
): void {
  businessMetricCounter.add(1, { event, ...labels });
}

// ============================================================================
// SECTION: METRIC UTILITIES
// ============================================================================

/**
 * Get the Prometheus exporter instance.
 * Useful for accessing metrics programmatically.
 *
 * @returns Prometheus exporter instance
 */
export function getPrometheusExporter(): PrometheusExporter {
  return prometheusExporter;
}

/**
 * Get the meter provider instance.
 * Useful for creating custom meters.
 *
 * @returns Meter provider instance
 */
export function getMeterProvider(): MeterProvider {
  return meterProvider;
}

/**
 * Get the default meter instance.
 * Useful for creating custom metrics.
 *
 * @returns Default meter instance
 */
export function getMeter(): Meter {
  return meter;
}

/**
 * Shutdown metrics collection gracefully.
 * Should be called on application shutdown.
 *
 * @returns Promise that resolves when shutdown is complete
 */
export async function shutdownMetrics(): Promise<void> {
  await meterProvider.shutdown();
}

// ============================================================================
// SECTION: INITIALIZATION
// ============================================================================

/**
 * Initialize metrics collection.
 * Called automatically when module is imported.
 */
export function initializeMetrics(): void {
  console.log('[Metrics] Initialized OpenTelemetry metrics collection');
  console.log(`[Metrics] Service: ${SERVICE_NAME} v${SERVICE_VERSION}`);
}

// Auto-initialize when module is loaded
initializeMetrics();
