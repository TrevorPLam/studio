#!/bin/bash
# Validation script for ALIGNMENT Section 4: Dependency Management
# Usage: ./scripts/validate-section-4.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 4: Dependency Management"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Check for lockfiles based on package manager
echo "Checking for lockfiles..."

# JavaScript/TypeScript
if [ -f "package.json" ]; then
    if [ -f "package-lock.json" ]; then
        echo "✅ package-lock.json exists (npm)"
    elif [ -f "yarn.lock" ]; then
        echo "✅ yarn.lock exists (yarn)"
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "✅ pnpm-lock.yaml exists (pnpm)"
    else
        echo "⚠️  WARNING: No lockfile found (npm/yarn/pnpm)"
        echo "   Run: npm install (or yarn install, or pnpm install)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if lockfile is committed
    if [ -f "package-lock.json" ] && ! git ls-files | grep -q "package-lock.json" 2>/dev/null; then
        echo "⚠️  WARNING: package-lock.json not committed to git"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Python
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    if [ -f "poetry.lock" ]; then
        echo "✅ poetry.lock exists (poetry)"
        if ! git ls-files | grep -q "poetry.lock" 2>/dev/null; then
            echo "⚠️  WARNING: poetry.lock not committed to git"
            WARNINGS=$((WARNINGS + 1))
        fi
    elif [ -f "Pipfile.lock" ]; then
        echo "✅ Pipfile.lock exists (pipenv)"
        if ! git ls-files | grep -q "Pipfile.lock" 2>/dev/null; then
            echo "⚠️  WARNING: Pipfile.lock not committed to git"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠️  WARNING: No lockfile found (consider using poetry or pipenv)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Go
if [ -f "go.mod" ]; then
    if [ -f "go.sum" ]; then
        echo "✅ go.sum exists (Go modules)"
        if ! git ls-files | grep -q "go.sum" 2>/dev/null; then
            echo "⚠️  WARNING: go.sum not committed to git"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠️  WARNING: go.sum missing (run: go mod tidy)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Rust
if [ -f "Cargo.toml" ]; then
    if [ -f "Cargo.lock" ]; then
        echo "✅ Cargo.lock exists (Rust)"
        if ! git ls-files | grep -q "Cargo.lock" 2>/dev/null; then
            echo "⚠️  WARNING: Cargo.lock not committed to git"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠️  WARNING: Cargo.lock missing"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check if lockfile is in .gitignore (should NOT be)
if [ -f ".gitignore" ]; then
    if grep -q "package-lock.json\|yarn.lock\|pnpm-lock.yaml\|poetry.lock\|Pipfile.lock\|go.sum\|Cargo.lock" .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: Lockfile patterns found in .gitignore"
        echo "   Lockfiles should be committed (remove from .gitignore)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for Dependabot/Renovate (P1)
echo ""
echo "Checking dependency automation..."
if [ -f ".github/dependabot.yml" ]; then
    echo "✅ Dependabot configured"
elif [ -f "renovate.json" ] || [ -f ".github/renovate.json" ]; then
    echo "✅ Renovate configured"
else
    echo "ℹ️  INFO: Dependency automation not configured (P1 recommendation)"
fi

# Check for dependency scanning in CI/CD (should be in Section 5)
echo ""
echo "Checking CI/CD dependency scanning..."
if [ -f ".github/workflows/ci.yml" ]; then
    if grep -qi "npm audit\|yarn audit\|snyk\|dependabot\|renovate" .github/workflows/ci.yml 2>/dev/null; then
        echo "✅ Dependency scanning configured in CI/CD"
    else
        echo "⚠️  WARNING: Dependency scanning not found in CI/CD"
        echo "   Add dependency vulnerability scanning (see Section 5)"
        WARNINGS=$((WARNINGS + 1))
    fi
elif [ -f ".gitlab-ci.yml" ]; then
    if grep -qi "npm audit\|yarn audit\|snyk" .gitlab-ci.yml 2>/dev/null; then
        echo "✅ Dependency scanning configured in CI/CD"
    else
        echo "⚠️  WARNING: Dependency scanning not found in CI/CD"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "ℹ️  INFO: CI/CD not configured (see Section 5)"
fi

echo ""
echo "=============================================="
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
