# Monitoring & Logging Guide

## Table of Contents

- [Overview](#overview)
- [Logging](#logging)
- [Correlation IDs](#correlation-ids)
- [Monitoring](#monitoring)
- [Error Tracking](#error-tracking)
- [Observability Tools](#observability-tools)
- [Logging Best Practices](#logging-best-practices)
- [Monitoring Setup](#monitoring-setup)
- [Alerting](#alerting)
- [Debugging](#debugging)
- [Performance Monitoring](#performance-monitoring)
- [Log Retention](#log-retention)
- [Related Documentation](#related-documentation)

---

## Overview

This guide covers logging, monitoring, and observability for Firebase Studio.

## Logging

### Logging Module

**Location:** `src/lib/logger.ts`

Structured logging with levels and context.

### Log Levels

```typescript
logger.debug('Debug information', { context });
logger.info('Informational message', { context });
logger.warn('Warning message', { context });
logger.error('Error occurred', error, { context });
```

### Usage Examples

```typescript
import { logger } from '@/lib/logger';

// Info log
logger.info('Session created', {
  sessionId: 'session-id',
  userId: 'user@example.com'
});

// Error log
logger.error('Failed to create session', error, {
  userId: 'user@example.com',
  input: sanitizedInput
});
```

### Log Format

**Development:**
- Human-readable format
- Debug logs enabled
- Console output

**Production:**
- JSON format (structured)
- Info level and above
- Centralized logging

### Context

Always include relevant context:

```typescript
// ✅ Good: Include context
logger.info('Session updated', {
  sessionId,
  userId,
  state: newState,
  previousState: oldState
});

// ❌ Bad: Missing context
logger.info('Session updated');
```

## Correlation IDs

### Session ID

Track operations by session:

```typescript
logger.info('Operation started', {
  sessionId: 'session-id',
  operation: 'createPreview'
});
```

### User ID

Track operations by user:

```typescript
logger.info('User action', {
  userId: 'user@example.com',
  action: 'createSession'
});
```

### Request ID (Future)

Track requests across services:

```typescript
const requestId = randomUUID();
logger.info('Request started', { requestId });
```

## Monitoring

### Health Checks

**Endpoint:** `/api/health` (to be implemented)

```typescript
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

### Metrics to Monitor

1. **Application Metrics:**
   - Request rate
   - Response times
   - Error rate
   - Success rate

2. **Resource Metrics:**
   - Memory usage
   - CPU usage
   - File I/O
   - Cache hit rate

3. **Business Metrics:**
   - Sessions created
   - Sessions completed
   - Average session duration
   - Error rate by operation

## Error Tracking

### Error Logging

```typescript
try {
  // Operation
} catch (error) {
  logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)), {
    context: 'value',
    userId: 'user@example.com'
  });
  throw error;
}
```

### Error Classification

```typescript
if (error instanceof ValidationError) {
  // Validation error
} else if (error instanceof GitHubAPIError) {
  // GitHub API error
} else if (error instanceof AIAPIError) {
  // AI API error
} else {
  // Unknown error
}
```

## Observability Tools

### Recommended Tools

1. **Error Tracking:**
   - Sentry
   - Rollbar
   - Bugsnag

2. **Logging:**
   - Logtail
   - Datadog
   - CloudWatch

3. **Metrics:**
   - Datadog
   - New Relic
   - Prometheus

### Integration Example (Sentry)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// In error handler
Sentry.captureException(error, {
  tags: { userId, sessionId },
  extra: { context }
});
```

## Logging Best Practices

### Do's

- ✅ Log at appropriate levels
- ✅ Include relevant context
- ✅ Use structured logging
- ✅ Log errors with stack traces
- ✅ Sanitize sensitive data

### Don'ts

- ❌ Log secrets or tokens
- ❌ Log full request bodies (may contain secrets)
- ❌ Over-log (too verbose)
- ❌ Under-log (missing important info)
- ❌ Log PII unnecessarily

## Monitoring Setup

### Development

```typescript
// src/lib/logger.ts
export const logger = {
  debug: (message: string, context?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', message, context);
    }
  },
  // ...
};
```

### Production

```typescript
// Send to logging service
export const logger = {
  info: (message: string, context?: object) => {
    logService.log('info', message, context);
  },
  // ...
};
```

## Alerting

### Recommended Alerts

1. **Error Rate:**
   - Alert if error rate > 5%
   - Alert if critical errors occur

2. **Response Time:**
   - Alert if P95 > 1s
   - Alert if P99 > 5s

3. **Resource Usage:**
   - Alert if memory > 80%
   - Alert if CPU > 80%

4. **Business Metrics:**
   - Alert if session creation fails
   - Alert if API rate limits hit

## Debugging

### Using Logs

1. **Filter by Session ID:**
   ```bash
   grep "session-id" logs.json
   ```

2. **Filter by User ID:**
   ```bash
   grep "user@example.com" logs.json
   ```

3. **Filter by Error:**
   ```bash
   grep '"level":"error"' logs.json
   ```

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
```

## Performance Monitoring

### Response Time Tracking

```typescript
const startTime = Date.now();
// ... operation
const duration = Date.now() - startTime;

logger.info('Operation completed', {
  duration,
  operation: 'createSession'
});
```

### Cache Performance

```typescript
logger.debug('Cache operation', {
  operation: 'get',
  key: 'cache-key',
  hit: cacheHit,
  duration: cacheDuration
});
```

## Log Retention

### Current

- Logs stored in console (development)
- No retention policy

### Production Recommendations

- **Retention:** 30-90 days
- **Archival:** Older logs archived
- **Compression:** Compress old logs

## Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance considerations
- **[SECURITY.md](./SECURITY.md)** - Security monitoring
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Debugging with logs

## Observability Stack

```
┌─────────────────────────────────────┐
│   Application (Firebase Studio)     │
│   - Structured Logging              │
│   - Correlation IDs                 │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│   Logging   │  │  Metrics   │
│   Service   │  │  Service    │
│  (Logtail)  │  │ (Datadog)   │
└─────────────┘  └─────────────┘
       │               │
       └───────┬───────┘
               ▼
      ┌─────────────────┐
      │  Error Tracking │
      │    (Sentry)     │
      └─────────────────┘
```

## Logging Flow

```
Application Event
    │
    ▼
Logger (with context)
    │
    ├─→ Development: Console
    │
    └─→ Production: Logging Service
            │
            ▼
        Centralized Logs
            │
            ├─→ Search/Filter
            ├─→ Alerts
            └─→ Analytics
```
