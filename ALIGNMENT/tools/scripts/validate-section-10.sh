#!/bin/bash
# Validation script for ALIGNMENT Section 10: Security & Compliance
# Usage: ./scripts/validate-section-10.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 10: Security & Compliance"
echo "================================================="
echo ""

ERRORS=0
WARNINGS=0

# Check for SECURITY.md
echo "Checking security documentation..."
if [ -f "SECURITY.md" ]; then
    echo "✅ SECURITY.md exists"
    
    # Check for required content
    if grep -qi "vulnerability\|disclosure\|report" SECURITY.md 2>/dev/null; then
        echo "  ✅ Vulnerability disclosure process found"
    else
        echo "  ⚠️  WARNING: Vulnerability disclosure process not found"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -qi "security@\|contact\|email" SECURITY.md 2>/dev/null; then
        echo "  ✅ Security contact found"
    else
        echo "  ⚠️  WARNING: Security contact not found"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ ERROR: SECURITY.md missing (required)"
    ERRORS=$((ERRORS + 1))
fi

# Check for secret scanning (should be in Section 3, but verify here)
echo ""
echo "Checking secret scanning..."
if [ -f ".pre-commit-config.yaml" ] || [ -f ".husky/pre-commit" ]; then
    if grep -qi "git-secrets\|trufflehog\|detect-secrets" .pre-commit-config.yaml .husky/pre-commit 2>/dev/null; then
        echo "✅ Pre-commit secret scanning configured"
    else
        echo "⚠️  WARNING: Pre-commit secret scanning not found"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check CI/CD secret scanning
if [ -f ".github/workflows/ci.yml" ]; then
    if grep -qi "trufflehog\|git-secrets\|secret-scan" .github/workflows/ci.yml 2>/dev/null; then
        echo "✅ CI/CD secret scanning configured"
    else
        echo "⚠️  WARNING: CI/CD secret scanning not found"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for dependency vulnerability scanning
echo ""
echo "Checking dependency vulnerability scanning..."
if [ -f ".github/workflows/ci.yml" ] || [ -f ".gitlab-ci.yml" ]; then
    CI_FILE=""
    [ -f ".github/workflows/ci.yml" ] && CI_FILE=".github/workflows/ci.yml"
    [ -f ".gitlab-ci.yml" ] && CI_FILE=".gitlab-ci.yml"
    
    if grep -qi "npm audit\|yarn audit\|snyk\|dependabot\|renovate\|safety\|bandit" "$CI_FILE" 2>/dev/null; then
        echo "✅ Dependency vulnerability scanning configured"
    else
        echo "⚠️  WARNING: Dependency vulnerability scanning not found"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for Dependabot/Renovate
if [ -f ".github/dependabot.yml" ]; then
    echo "✅ Dependabot configured"
elif [ -f "renovate.json" ] || [ -f ".github/renovate.json" ]; then
    echo "✅ Renovate configured"
fi

# Check for license compliance (basic check)
echo ""
echo "Checking license compliance..."
if [ -f "LICENSE" ] || [ -f "LICENSE.txt" ]; then
    echo "✅ LICENSE file exists"
else
    echo "⚠️  WARNING: LICENSE file missing (required for public repos)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for SBOM generation (P0 for releases)
echo ""
echo "Checking SBOM generation..."
if [ -f ".github/workflows/release.yml" ] || [ -f ".github/workflows/ci.yml" ]; then
    if grep -qi "sbom\|spdx\|cyclonedx" .github/workflows/*.yml 2>/dev/null; then
        echo "✅ SBOM generation configured"
    else
        echo "ℹ️  INFO: SBOM generation not configured (required for releases)"
    fi
fi

# Check for .env files (should not be committed)
echo ""
echo "Checking for committed secrets..."
if [ -f ".env" ] && git ls-files | grep -q "\.env$" 2>/dev/null; then
    echo "❌ ERROR: .env file is committed (CRITICAL SECURITY ISSUE)"
    echo "   Action required:"
    echo "   1. Rotate all secrets immediately"
    echo "   2. Remove .env from git history"
    echo "   3. Add .env to .gitignore"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "================================================="
echo "Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed with $ERRORS error(s)"
    echo ""
    echo "⚠️  CRITICAL: If secrets were found, rotate them immediately!"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Validation passed with $WARNINGS warning(s)"
    exit 0
else
    echo "✅ Validation passed!"
    exit 0
fi
