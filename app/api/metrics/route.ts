/**
 * ============================================================================
 * METRICS API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/metrics/route.ts
 * @module api/metrics
 * @epic BP-OBS-005
 *
 * PURPOSE:
 * Exposes Prometheus-compatible metrics endpoint for scraping.
 * Provides HTTP access to collected metrics data.
 *
 * FEATURES:
 * - Prometheus text format export
 * - HTTP request metrics
 * - Business metrics
 * - System health indicators
 *
 * RELATED FILES:
 * - src/lib/observability/metrics.ts (Metrics collection)
 *
 * ENDPOINT:
 * GET /api/metrics - Returns metrics in Prometheus text format
 *
 * RESPONSE FORMAT:
 * text/plain; version=0.0.4; charset=utf-8
 *
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { getPrometheusExporter } from '@/lib/observability/metrics';

/**
 * GET /api/metrics
 *
 * Returns Prometheus-compatible metrics in text format.
 *
 * @returns Metrics in Prometheus text format
 */
export async function GET(): Promise<NextResponse> {
  try {
    const exporter = getPrometheusExporter();

    // Get metrics from Prometheus exporter
    const { resourceMetrics } = await exporter.collect();

    // Convert to Prometheus text format
    let metricsText = '';

    if (resourceMetrics) {
      for (const rm of resourceMetrics.scopeMetrics) {
        for (const metric of rm.metrics) {
          const metricName = metric.descriptor.name;
          const metricType = metric.descriptor.type;
          const description = metric.descriptor.description;

          // Add metric metadata
          if (description) {
            metricsText += `# HELP ${metricName} ${description}\n`;
          }
          metricsText += `# TYPE ${metricName} ${metricType.toLowerCase()}\n`;

          // Add metric data points
          for (const dataPoint of metric.dataPoints) {
            const labels = Object.entries(dataPoint.attributes || {})
              .map(([key, value]) => `${key}="${value}"`)
              .join(',');

            const labelStr = labels ? `{${labels}}` : '';
            const value =
              typeof dataPoint.value === 'number' ? dataPoint.value : dataPoint.value.toString();

            metricsText += `${metricName}${labelStr} ${value}\n`;
          }
        }
      }
    }

    // Return metrics in Prometheus text format
    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Metrics] Error exporting metrics:', error);

    return NextResponse.json({ error: 'Failed to export metrics' }, { status: 500 });
  }
}
