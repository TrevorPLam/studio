#!/bin/bash
# Validation script for ALIGNMENT Section 11: Observability & Monitoring
# Usage: ./scripts/validate-section-11.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 11: Observability & Monitoring"
echo "===================================================="
echo ""

ERRORS=0
WARNINGS=0

# Check for structured logging configuration
HAS_LOGGING=false

# Check for logging libraries/config
if [ -f "package.json" ]; then
    if grep -qiE "winston|pino|bunyan|log4js" package.json 2>/dev/null; then
        HAS_LOGGING=true
        echo "✅ Logging library found in package.json"
    fi
fi

if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "Pipfile" ]; then
    if grep -qiE "logging|structlog|loguru" requirements.txt pyproject.toml Pipfile 2>/dev/null 2>/dev/null; then
        HAS_LOGGING=true
        echo "✅ Logging library found in Python dependencies"
    fi
fi

if [ -f "go.mod" ]; then
    if grep -qiE "logrus|zap|zerolog" go.mod 2>/dev/null; then
        HAS_LOGGING=true
        echo "✅ Logging library found in go.mod"
    fi
fi

if [ -f "Cargo.toml" ]; then
    if grep -qiE "log|tracing|slog" Cargo.toml 2>/dev/null; then
        HAS_LOGGING=true
        echo "✅ Logging library found in Cargo.toml"
    fi
fi

# Check for logging configuration files
if [ -f "logging.config.js" ] || [ -f "logging.json" ] || [ -f "config/logging.*" ]; then
    echo "✅ Logging configuration file found"
    HAS_LOGGING=true
fi

# Check for error tracking (Sentry, Rollbar, etc.)
if [ -f "package.json" ]; then
    if grep -qiE "@sentry|rollbar|bugsnag|honeybadger" package.json 2>/dev/null; then
        echo "✅ Error tracking library found"
    fi
fi

if [ -f ".sentryclirc" ] || [ -f "sentry.properties" ] || [ -f ".sentryclirc.json" ]; then
    echo "✅ Sentry configuration found"
fi

# Check for metrics/monitoring libraries
if [ -f "package.json" ]; then
    if grep -qiE "prometheus|datadog|newrelic|statsd" package.json 2>/dev/null; then
        echo "✅ Metrics/monitoring library found"
    fi
fi

# Check for OpenTelemetry
if [ -f "package.json" ]; then
    if grep -qiE "@opentelemetry" package.json 2>/dev/null; then
        echo "✅ OpenTelemetry found"
    fi
fi

if [ -f "go.mod" ]; then
    if grep -qiE "go.opentelemetry.io" go.mod 2>/dev/null; then
        echo "✅ OpenTelemetry found"
    fi
fi

# Check for health check endpoints (common patterns)
if [ -d "src" ] || [ -d "app" ] || [ -d "lib" ]; then
    # Look for health check routes/files
    HEALTH_CHECK_FILES=$(find . -type f \( -name "*health*" -o -name "*ping*" -o -name "*status*" \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$HEALTH_CHECK_FILES" -gt 0 ]; then
        echo "✅ Health check implementation found ($HEALTH_CHECK_FILES file(s))"
    else
        echo "ℹ️  INFO: Consider adding health check endpoint (/health, /ping, etc.)"
    fi
fi

# Check for HEALTHCHECK.md (P1 recommendation)
if [ -f "HEALTHCHECK.md" ] || [ -f "docs/HEALTHCHECK.md" ] || [ -f "docs/health.md" ]; then
    echo "✅ HEALTHCHECK.md found"
else
    echo "ℹ️  INFO: HEALTHCHECK.md not found (P1 recommendation)"
fi

# Check for observability documentation
if [ -f "docs/observability.md" ] || [ -f "docs/monitoring.md" ] || grep -qiE "observability|monitoring|logging" README.md 2>/dev/null; then
    echo "✅ Observability documentation found"
else
    echo "ℹ️  INFO: Consider documenting observability strategy"
fi

# Check for distributed tracing (if microservices)
if [ -f "package.json" ] || [ -f "go.mod" ]; then
    if grep -qiE "jaeger|zipkin|datadog.*trace|honeycomb" package.json go.mod 2>/dev/null; then
        echo "✅ Distributed tracing library found"
    fi
fi

# Check for log aggregation configuration
if [ -f ".env.example" ] || [ -f "config/.env.example" ]; then
    if grep -qiE "LOG_|LOGGING_|ELASTIC|LOGSTASH|FLUENTD" .env.example config/.env.example 2>/dev/null; then
        echo "✅ Log aggregation configuration found in .env.example"
    fi
fi

# Check for structured logging in code (basic check - look for JSON logging)
if [ "$HAS_LOGGING" = false ]; then
    echo "⚠️  WARNING: No logging library detected"
    echo "   Consider adding structured logging (JSON format recommended)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for log levels configuration
if [ -f ".env.example" ] || [ -f "config" ]; then
    if grep -qiE "LOG_LEVEL|LOGGING_LEVEL" .env.example 2>/dev/null || find config -name "*.js" -o -name "*.ts" -o -name "*.py" 2>/dev/null | xargs grep -l "LOG_LEVEL\|logging.*level" 2>/dev/null | head -1 | grep -q .; then
        echo "✅ Log level configuration found"
    fi
fi

# Check for runbooks (P1 recommendation)
if [ -d "docs/runbooks" ] || [ -d "runbooks" ]; then
    RUNBOOKS=$(find docs/runbooks runbooks -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$RUNBOOKS" -gt 0 ]; then
        echo "✅ Runbooks found ($RUNBOOKS runbook(s))"
    fi
else
    echo "ℹ️  INFO: Consider adding runbooks for common incidents (docs/runbooks/)"
fi

# Check for incident response documentation
if [ -f "docs/incident-response.md" ] || [ -f "docs/oncall.md" ] || grep -qiE "incident|on-call|oncall" README.md docs/*.md 2>/dev/null; then
    echo "✅ Incident response documentation found"
else
    echo "ℹ️  INFO: Consider documenting incident response process"
fi

echo ""
echo "===================================================="
echo "Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed with $ERRORS error(s)"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Validation passed with $WARNINGS warning(s)"
    exit 0
else
    echo "✅ Validation passed!"
    exit 0
fi
