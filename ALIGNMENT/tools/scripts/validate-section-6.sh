#!/bin/bash
# Validation script for ALIGNMENT Section 6: Testing Structure
# Usage: ./scripts/validate-section-6.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 6: Testing Structure"
echo "============================================"
echo ""

ERRORS=0
WARNINGS=0

# Check for test directories/files
echo "Checking test structure..."

TEST_FOUND=false

# Check for common test directories
if [ -d "tests" ] || [ -d "test" ] || [ -d "__tests__" ]; then
    echo "✅ Test directory found"
    TEST_FOUND=true
fi

# Check for co-located tests (common in JS/TS)
TEST_FILES=$(find . -type f \( -name "*.test.js" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.spec.ts" -o -name "*_test.go" -o -name "*_test.py" \) ! -path "*/node_modules/*" ! -path "*/.git/*" | head -5)
if [ -n "$TEST_FILES" ]; then
    echo "✅ Test files found"
    TEST_FOUND=true
fi

if [ "$TEST_FOUND" = false ]; then
    echo "⚠️  WARNING: No test files or directories found"
    echo "   Add tests (see Section 6)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for test configuration files
echo ""
echo "Checking test configuration..."

# JavaScript/TypeScript
if [ -f "package.json" ]; then
    if grep -qi "jest\|mocha\|vitest\|ava" package.json 2>/dev/null; then
        echo "✅ Test framework configured in package.json"
    fi
    
    if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ] || [ -f "vitest.config.ts" ]; then
        echo "✅ Test configuration file found"
    fi
fi

# Python
if [ -f "pytest.ini" ] || [ -f "setup.cfg" ] || [ -f "pyproject.toml" ]; then
    if grep -qi "pytest\|unittest\|nose" pytest.ini setup.cfg pyproject.toml 2>/dev/null; then
        echo "✅ Test framework configured"
    fi
fi

# Go
if [ -f "go.mod" ]; then
    echo "✅ Go testing (built-in) available"
fi

# Rust
if [ -f "Cargo.toml" ]; then
    echo "✅ Rust testing (built-in) available"
fi

# Check if tests run in CI/CD
echo ""
echo "Checking CI/CD test integration..."
if [ -f ".github/workflows/ci.yml" ]; then
    if grep -qi "test\|jest\|pytest\|go test\|cargo test" .github/workflows/ci.yml 2>/dev/null; then
        echo "✅ Tests configured in CI/CD"
    else
        echo "⚠️  WARNING: Tests not found in CI/CD"
        echo "   Add test step to CI/CD (see Section 5 Phase 2)"
        WARNINGS=$((WARNINGS + 1))
    fi
elif [ -f ".gitlab-ci.yml" ]; then
    if grep -qi "test\|jest\|pytest" .gitlab-ci.yml 2>/dev/null; then
        echo "✅ Tests configured in CI/CD"
    else
        echo "⚠️  WARNING: Tests not found in CI/CD"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "ℹ️  INFO: CI/CD not configured (see Section 5)"
fi

# Check test scripts in package.json
if [ -f "package.json" ]; then
    if grep -qi '"test"' package.json 2>/dev/null; then
        echo "✅ Test script defined in package.json"
    else
        echo "⚠️  WARNING: Test script not found in package.json"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "============================================"
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
