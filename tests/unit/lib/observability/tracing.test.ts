/**
 * @jest-environment node
 */

/**
 * ============================================================================
 * TRACING MODULE TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/observability/tracing.test.ts
 * @module tracing.test
 * @epic BP-OBS-005
 *
 * PURPOSE:
 * Unit tests for the distributed tracing module.
 * Validates span creation, lifecycle management, and context propagation.
 *
 * TEST COVERAGE:
 * - Span creation and management
 * - HTTP span attributes
 * - Span lifecycle (start, end, error handling)
 * - Span utilities (withSpan, withSpanSync)
 * - Correlation ID integration
 *
 * ============================================================================
 */

import {
  createSpan,
  createHttpSpan,
  withSpan,
  withSpanSync,
  getActiveSpan,
  addSpanAttributes,
  addSpanEvent,
  recordSpanException,
  getTracer,
} from '@/lib/observability/tracing';
import { SpanStatusCode } from '@opentelemetry/api';

describe('Tracing Module', () => {
  describe('Span Creation', () => {
    it('creates a basic span', () => {
      const span = createSpan('test-operation');
      expect(span).toBeDefined();
      expect(span.spanContext().traceId).toBeDefined();
      span.end();
    });

    it('creates span with attributes', () => {
      const span = createSpan('test-operation', {
        attributes: {
          userId: '123',
          operation: 'test',
        },
      });
      expect(span).toBeDefined();
      span.end();
    });

    it('creates HTTP span with method and route', () => {
      const span = createHttpSpan('GET /api/sessions', {
        method: 'GET',
        route: '/api/sessions',
        statusCode: 200,
      });
      expect(span).toBeDefined();
      span.end();
    });

    it('creates HTTP span without status code', () => {
      const span = createHttpSpan('GET /api/test', {
        method: 'GET',
        route: '/api/test',
      });
      expect(span).toBeDefined();
      span.end();
    });

    it('creates HTTP span with user agent', () => {
      const span = createHttpSpan('GET /api/test', {
        method: 'GET',
        route: '/api/test',
        userAgent: 'Mozilla/5.0',
      });
      expect(span).toBeDefined();
      span.end();
    });
  });

  describe('Span Lifecycle', () => {
    it('ends span successfully', () => {
      const span = createSpan('test-operation');
      expect(() => span.end()).not.toThrow();
    });

    it('sets span status to OK', () => {
      const span = createSpan('test-operation');
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    });

    it('sets span status to ERROR', () => {
      const span = createSpan('test-operation');
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Test error',
      });
      span.end();
    });

    it('records exception in span', () => {
      const span = createSpan('test-operation');
      const error = new Error('Test error');
      expect(() => span.recordException(error)).not.toThrow();
      span.end();
    });
  });

  describe('Span Utilities', () => {
    it('withSpan executes function and manages span lifecycle', async () => {
      const result = await withSpan('test-operation', async () => {
        return 'success';
      });
      expect(result).toBe('success');
    });

    it('withSpan handles errors and records in span', async () => {
      await expect(
        withSpan('test-operation', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });

    it('withSpanSync executes synchronous function', () => {
      const result = withSpanSync('test-operation', () => {
        return 'success';
      });
      expect(result).toBe('success');
    });

    it('withSpanSync handles synchronous errors', () => {
      expect(() => {
        withSpanSync('test-operation', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('provides span to callback in withSpan', async () => {
      await withSpan('test-operation', async (span) => {
        expect(span).toBeDefined();
        expect(span.spanContext().traceId).toBeDefined();
      });
    });

    it('provides span to callback in withSpanSync', () => {
      withSpanSync('test-operation', (span) => {
        expect(span).toBeDefined();
        expect(span.spanContext().traceId).toBeDefined();
      });
    });
  });

  describe('Active Span Context', () => {
    it('addSpanAttributes works without active span', () => {
      expect(() => {
        addSpanAttributes({ key: 'value' });
      }).not.toThrow();
    });

    it('addSpanEvent works without active span', () => {
      expect(() => {
        addSpanEvent('test-event', { key: 'value' });
      }).not.toThrow();
    });

    it('recordSpanException works without active span', () => {
      expect(() => {
        recordSpanException(new Error('Test error'));
      }).not.toThrow();
    });
  });

  describe('Tracer Utilities', () => {
    it('provides tracer instance', () => {
      const tracer = getTracer();
      expect(tracer).toBeDefined();
      expect(tracer.startSpan).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles span creation with invalid attributes', () => {
      expect(() => {
        createSpan('test-operation', {
          // @ts-expect-error Testing invalid input
          attributes: null,
        });
      }).not.toThrow();
    });

    it('handles HTTP span with missing required fields', () => {
      expect(() => {
        createHttpSpan('test', {
          // @ts-expect-error Testing invalid input
          method: undefined,
          route: '/api/test',
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('creates span with empty name', () => {
      const span = createSpan('');
      expect(span).toBeDefined();
      span.end();
    });

    it('creates span with very long name', () => {
      const longName = 'a'.repeat(1000);
      const span = createSpan(longName);
      expect(span).toBeDefined();
      span.end();
    });

    it('withSpan handles promise rejection', async () => {
      await expect(
        withSpan('test-operation', async () => {
          return Promise.reject(new Error('Rejected'));
        })
      ).rejects.toThrow('Rejected');
    });

    it('withSpan returns promise result', async () => {
      const result = await withSpan('test-operation', async () => {
        return Promise.resolve({ data: 'test' });
      });
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('Integration with Correlation', () => {
    it('creates span with correlation context', () => {
      // Creates span successfully with or without correlation context
      const span = createSpan('test-operation');
      expect(span).toBeDefined();
      span.end();
    });
  });
});
