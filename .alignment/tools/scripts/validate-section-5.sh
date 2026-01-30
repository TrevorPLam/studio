#!/bin/bash
# Validation script for ALIGNMENT Section 5: CI/CD Structure
# Usage: ./scripts/validate-section-5.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 5: CI/CD Structure"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check for CI/CD configuration files
echo "Checking CI/CD configuration..."

CI_CONFIG_FOUND=false

# GitHub Actions
if [ -f ".github/workflows/ci.yml" ] || [ -f ".github/workflows/main.yml" ]; then
    echo "✅ GitHub Actions configured"
    CI_CONFIG_FOUND=true
    CI_FILE=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | head -1)
    
    # Check for required steps
    if grep -qi "build\|compile\|install" "$CI_FILE" 2>/dev/null; then
        echo "  ✅ Build step found"
    else
        echo "  ⚠️  WARNING: Build step not found"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -qi "lint\|eslint\|prettier\|black\|gofmt" "$CI_FILE" 2>/dev/null; then
        echo "  ✅ Lint step found"
    else
        echo "  ⚠️  WARNING: Lint step not found"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -qi "test\|jest\|pytest\|go test" "$CI_FILE" 2>/dev/null; then
        echo "  ✅ Test step found"
    else
        echo "  ℹ️  INFO: Test step not found (add in Phase 2)"
    fi
    
    if grep -qi "audit\|snyk\|security\|scan" "$CI_FILE" 2>/dev/null; then
        echo "  ✅ Security scanning found"
    else
        echo "  ⚠️  WARNING: Security scanning not found"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# GitLab CI
if [ -f ".gitlab-ci.yml" ]; then
    echo "✅ GitLab CI configured"
    CI_CONFIG_FOUND=true
    
    if grep -qi "build\|compile" .gitlab-ci.yml 2>/dev/null; then
        echo "  ✅ Build step found"
    else
        echo "  ⚠️  WARNING: Build step not found"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Jenkins
if [ -f "Jenkinsfile" ]; then
    echo "✅ Jenkins configured"
    CI_CONFIG_FOUND=true
fi

# CircleCI
if [ -f ".circleci/config.yml" ]; then
    echo "✅ CircleCI configured"
    CI_CONFIG_FOUND=true
fi

# Azure DevOps
if [ -f "azure-pipelines.yml" ]; then
    echo "✅ Azure DevOps configured"
    CI_CONFIG_FOUND=true
fi

if [ "$CI_CONFIG_FOUND" = false ]; then
    echo "❌ ERROR: No CI/CD configuration found"
    echo "   Create CI/CD config (see Section 5)"
    ERRORS=$((ERRORS + 1))
fi

# Check CI/CD documentation
echo ""
echo "Checking CI/CD documentation..."
if [ -f "docs/ci-cd.md" ]; then
    echo "✅ CI/CD documentation exists"
elif grep -qi "ci\|cd\|pipeline\|workflow" README.md 2>/dev/null; then
    echo "✅ CI/CD mentioned in README"
else
    echo "ℹ️  INFO: CI/CD documentation not found (recommended)"
fi

# Check branch protection (if GitHub)
if [ -d ".github" ] && [ -f ".github/workflows/ci.yml" ]; then
    echo ""
    echo "ℹ️  INFO: Verify branch protection rules in GitHub:"
    echo "   - Require CI to pass before merging"
    echo "   - Require pull request reviews"
fi

echo ""
echo "=========================================="
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
