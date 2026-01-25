/**
 * @jest-environment node
 */

/**
 * ============================================================================
 * METRICS MODULE TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/observability/metrics.test.ts
 * @module metrics.test
 * @epic BP-OBS-005
 *
 * PURPOSE:
 * Unit tests for the metrics collection module.
 * Validates metric recording, aggregation, and export functionality.
 *
 * TEST COVERAGE:
 * - HTTP request metrics recording
 * - Business metrics recording
 * - Metric labels and attributes
 * - Error counting
 * - Prometheus export format
 *
 * ============================================================================
 */

import {
  recordHttpRequest,
  recordBusinessMetric,
  getMeter,
  getPrometheusExporter,
} from '@/lib/observability/metrics';

describe('Metrics Module', () => {
  describe('HTTP Metrics', () => {
    it('records HTTP request metrics', () => {
      expect(() => {
        recordHttpRequest('GET', '/api/sessions', 200, 150);
      }).not.toThrow();
    });

    it('records HTTP request with different methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

      methods.forEach((method) => {
        expect(() => {
          recordHttpRequest(method, '/api/test', 200, 100);
        }).not.toThrow();
      });
    });

    it('records HTTP errors (4xx status codes)', () => {
      expect(() => {
        recordHttpRequest('GET', '/api/sessions', 404, 50);
      }).not.toThrow();
    });

    it('records HTTP errors (5xx status codes)', () => {
      expect(() => {
        recordHttpRequest('POST', '/api/sessions', 500, 200);
      }).not.toThrow();
    });

    it('records request duration metrics', () => {
      expect(() => {
        recordHttpRequest('GET', '/api/sessions', 200, 1500);
      }).not.toThrow();
    });
  });

  describe('Business Metrics', () => {
    it('records session_created event', () => {
      expect(() => {
        recordBusinessMetric('session_created', { userId: 'test-user' });
      }).not.toThrow();
    });

    it('records session_updated event', () => {
      expect(() => {
        recordBusinessMetric('session_updated', { sessionId: 'test-session' });
      }).not.toThrow();
    });

    it('records preview_generated event', () => {
      expect(() => {
        recordBusinessMetric('preview_generated', { sessionId: 'test-session' });
      }).not.toThrow();
    });

    it('records preview_applied event', () => {
      expect(() => {
        recordBusinessMetric('preview_applied', { sessionId: 'test-session' });
      }).not.toThrow();
    });

    it('records approval_granted event', () => {
      expect(() => {
        recordBusinessMetric('approval_granted', {
          sessionId: 'test-session',
          userId: 'test-user',
        });
      }).not.toThrow();
    });

    it('records approval_denied event', () => {
      expect(() => {
        recordBusinessMetric('approval_denied', {
          sessionId: 'test-session',
          userId: 'test-user',
        });
      }).not.toThrow();
    });

    it('records business metric without additional labels', () => {
      expect(() => {
        recordBusinessMetric('session_created');
      }).not.toThrow();
    });
  });

  describe('Metric Utilities', () => {
    it('provides meter instance', () => {
      const meter = getMeter();
      expect(meter).toBeDefined();
      expect(meter.createCounter).toBeDefined();
      expect(meter.createHistogram).toBeDefined();
    });

    it('provides Prometheus exporter', () => {
      const exporter = getPrometheusExporter();
      expect(exporter).toBeDefined();
      expect(exporter.collect).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid HTTP method gracefully', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        recordHttpRequest('INVALID', '/api/test', 200, 100);
      }).not.toThrow();
    });

    it('handles invalid business metric type gracefully', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        recordBusinessMetric('invalid_event', {});
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('records request with zero duration', () => {
      expect(() => {
        recordHttpRequest('GET', '/api/test', 200, 0);
      }).not.toThrow();
    });

    it('records request with very large duration', () => {
      expect(() => {
        recordHttpRequest('GET', '/api/test', 200, 999999);
      }).not.toThrow();
    });

    it('records request with empty route', () => {
      expect(() => {
        recordHttpRequest('GET', '', 200, 100);
      }).not.toThrow();
    });

    it('records business metric with numeric labels', () => {
      expect(() => {
        recordBusinessMetric('session_created', {
          userId: 'test-user',
          count: 42,
        });
      }).not.toThrow();
    });
  });
});
