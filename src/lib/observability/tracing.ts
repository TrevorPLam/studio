/**
 * ============================================================================
 * TRACING MODULE - OpenTelemetry Distributed Tracing
 * ============================================================================
 *
 * @file src/lib/observability/tracing.ts
 * @module tracing
 * @epic BP-OBS-005
 *
 * PURPOSE:
 * Implements distributed tracing using OpenTelemetry for request flow tracking.
 * Enables end-to-end visibility across service boundaries.
 *
 * FEATURES:
 * - Distributed trace context propagation
 * - Span creation and management
 * - Integration with correlation IDs
 * - Automatic instrumentation support
 *
 * RELATED FILES:
 * - src/lib/observability/metrics.ts (Metrics collection)
 * - src/lib/observability/correlation.ts (Correlation IDs)
 * - All API routes (instrumented with tracing)
 *
 * IMPLEMENTATION NOTES:
 * - Uses OpenTelemetry SDK for tracing
 * - Integrates with correlation IDs (requestId, sessionId)
 * - Supports span attributes and events
 * - Exports traces to OTLP endpoint (configurable)
 *
 * ============================================================================
 */

import { trace, Span, SpanStatusCode, Tracer, context, Context } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import { getCorrelationContext } from './correlation';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Span attributes for HTTP requests.
 */
interface HttpSpanAttributes {
  /** HTTP method */
  method: string;
  /** Route path pattern */
  route: string;
  /** HTTP status code */
  statusCode?: number;
  /** User agent */
  userAgent?: string;
}

/**
 * Span options for creating spans.
 */
interface CreateSpanOptions {
  /** Span attributes */
  attributes?: Record<string, string | number | boolean>;
  /** Parent span or context */
  parent?: Span | Context;
}

// ============================================================================
// SECTION: CONFIGURATION
// ============================================================================

/**
 * Service metadata for tracing.
 */
const SERVICE_NAME = 'firebase-studio';
const SERVICE_VERSION = process.env.npm_package_version || '0.1.0';

/**
 * OpenTelemetry resource with service metadata.
 */
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
});

/**
 * Tracer provider for distributed tracing.
 */
const tracerProvider = new BasicTracerProvider({
  resource,
});

/**
 * Console exporter for local development.
 * In production, replace with OTLP exporter to send to observability backend.
 */
const consoleExporter = new ConsoleSpanExporter();

/**
 * Batch span processor for efficient export.
 */
const spanProcessor = new BatchSpanProcessor(consoleExporter);
tracerProvider.addSpanProcessor(spanProcessor);

/**
 * Register the tracer provider globally.
 */
tracerProvider.register();

/**
 * Default tracer instance.
 */
const tracer: Tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION);

// ============================================================================
// SECTION: SPAN CREATION
// ============================================================================

/**
 * Create a new span for tracing.
 *
 * @param name - Span name (operation name)
 * @param options - Span creation options
 * @returns Created span
 *
 * @example
 * ```typescript
 * const span = createSpan('fetch-user', {
 *   attributes: { userId: '123' }
 * });
 * try {
 *   // ... perform operation ...
 *   span.setStatus({ code: SpanStatusCode.OK });
 * } catch (error) {
 *   span.setStatus({ code: SpanStatusCode.ERROR });
 * } finally {
 *   span.end();
 * }
 * ```
 */
export function createSpan(name: string, options?: CreateSpanOptions): Span {
  const parentContext = options?.parent
    ? typeof options.parent === 'object' && 'spanContext' in options.parent
      ? trace.setSpan(context.active(), options.parent as Span)
      : (options.parent as Context)
    : context.active();

  // Add correlation IDs as span attributes
  const correlationCtx = getCorrelationContext();
  const attributes = {
    ...options?.attributes,
    ...(correlationCtx?.requestId && { 'request.id': correlationCtx.requestId }),
    ...(correlationCtx?.sessionId && { 'session.id': correlationCtx.sessionId }),
    ...(correlationCtx?.userId && { 'user.id': correlationCtx.userId }),
    ...(correlationCtx?.deliveryId && { 'webhook.delivery_id': correlationCtx.deliveryId }),
  };

  return tracer.startSpan(name, { attributes }, parentContext);
}

/**
 * Create a span for an HTTP request.
 *
 * @param name - Span name
 * @param attributes - HTTP span attributes
 * @returns Created span
 *
 * @example
 * ```typescript
 * const span = createHttpSpan('GET /api/sessions', {
 *   method: 'GET',
 *   route: '/api/sessions',
 *   statusCode: 200,
 * });
 * span.end();
 * ```
 */
export function createHttpSpan(name: string, attributes: HttpSpanAttributes): Span {
  const spanAttributes: Record<string, string | number> = {
    [ATTR_HTTP_REQUEST_METHOD]: attributes.method,
    [ATTR_HTTP_ROUTE]: attributes.route,
  };

  if (attributes.statusCode !== undefined) {
    spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] = attributes.statusCode;
  }

  if (attributes.userAgent) {
    spanAttributes[ATTR_USER_AGENT_ORIGINAL] = attributes.userAgent;
  }

  return createSpan(name, { attributes: spanAttributes });
}

// ============================================================================
// SECTION: SPAN UTILITIES
// ============================================================================

/**
 * Execute a function within a span context.
 * Automatically handles span lifecycle and error handling.
 *
 * @param name - Span name
 * @param fn - Function to execute
 * @param options - Span creation options
 * @returns Result of the function
 *
 * @example
 * ```typescript
 * const result = await withSpan('fetch-user', async () => {
 *   return await fetchUser('123');
 * }, { attributes: { userId: '123' } });
 * ```
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: CreateSpanOptions
): Promise<T> {
  const span = createSpan(name, options);

  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Execute a synchronous function within a span context.
 *
 * @param name - Span name
 * @param fn - Function to execute
 * @param options - Span creation options
 * @returns Result of the function
 */
export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  options?: CreateSpanOptions
): T {
  const span = createSpan(name, options);

  try {
    const result = fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Get the active span from the current context.
 *
 * @returns Active span or undefined if no active span
 */
export function getActiveSpan(): Span | undefined {
  return trace.getSpan(context.active());
}

/**
 * Add attributes to the active span.
 *
 * @param attributes - Attributes to add
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Add an event to the active span.
 *
 * @param name - Event name
 * @param attributes - Event attributes
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Record an exception in the active span.
 *
 * @param error - Error to record
 */
export function recordSpanException(error: Error): void {
  const span = getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  }
}

// ============================================================================
// SECTION: TRACER UTILITIES
// ============================================================================

/**
 * Get the tracer provider instance.
 *
 * @returns Tracer provider instance
 */
export function getTracerProvider(): BasicTracerProvider {
  return tracerProvider;
}

/**
 * Get the default tracer instance.
 *
 * @returns Default tracer instance
 */
export function getTracer(): Tracer {
  return tracer;
}

/**
 * Shutdown tracing gracefully.
 * Should be called on application shutdown.
 *
 * @returns Promise that resolves when shutdown is complete
 */
export async function shutdownTracing(): Promise<void> {
  await tracerProvider.shutdown();
}

// ============================================================================
// SECTION: INITIALIZATION
// ============================================================================

/**
 * Initialize distributed tracing.
 * Called automatically when module is imported.
 */
export function initializeTracing(): void {
  console.log('[Tracing] Initialized OpenTelemetry distributed tracing');
  console.log(`[Tracing] Service: ${SERVICE_NAME} v${SERVICE_VERSION}`);
}

// Auto-initialize when module is loaded
initializeTracing();
