#!/bin/bash
# Validation script for ALIGNMENT Section 12: Change Management
# Usage: ./scripts/validate-section-12.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 12: Change Management"
echo "============================================"
echo ""

ERRORS=0
WARNINGS=0

# Check for CHANGELOG.md (if versioned project)
echo "Checking change management..."

# Try to detect if versioned project
VERSIONED_PROJECT=false
if [ -f "package.json" ] && grep -q '"version"' package.json 2>/dev/null; then
    VERSIONED_PROJECT=true
elif [ -f "pyproject.toml" ] && grep -q "version" pyproject.toml 2>/dev/null; then
    VERSIONED_PROJECT=true
elif [ -f "Cargo.toml" ] && grep -q "version" Cargo.toml 2>/dev/null; then
    VERSIONED_PROJECT=true
elif git tag | head -1 >/dev/null 2>&1; then
    VERSIONED_PROJECT=true
fi

if [ "$VERSIONED_PROJECT" = true ]; then
    echo "ℹ️  INFO: Versioned project detected"
    
    if [ -f "CHANGELOG.md" ]; then
        echo "✅ CHANGELOG.md exists"
        
        # Check CHANGELOG format (basic check)
        if grep -qi "unreleased\|\[.*\]\|added\|changed\|fixed\|removed\|deprecated\|security" CHANGELOG.md 2>/dev/null; then
            echo "  ✅ CHANGELOG follows Keep a Changelog format"
        else
            echo "  ⚠️  WARNING: CHANGELOG may not follow standard format"
            echo "     See: https://keepachangelog.com/"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠️  WARNING: CHANGELOG.md missing (required for versioned projects)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "ℹ️  INFO: Not a versioned project (CHANGELOG optional)"
fi

# Check commit message conventions
echo ""
echo "Checking commit message conventions..."

# Check last 10 commits for Conventional Commits format
RECENT_COMMITS=$(git log --oneline -10 2>/dev/null | head -5 || echo "")
if [ -n "$RECENT_COMMITS" ]; then
    CONVENTIONAL_COUNT=0
    TOTAL_COUNT=0
    
    while IFS= read -r commit; do
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        if echo "$commit" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?:"; then
            CONVENTIONAL_COUNT=$((CONVENTIONAL_COUNT + 1))
        fi
    done <<< "$RECENT_COMMITS"
    
    if [ $TOTAL_COUNT -gt 0 ]; then
        PERCENTAGE=$((CONVENTIONAL_COUNT * 100 / TOTAL_COUNT))
        if [ $PERCENTAGE -ge 80 ]; then
            echo "✅ Commit messages follow Conventional Commits ($PERCENTAGE%)"
        else
            echo "⚠️  WARNING: Only $PERCENTAGE% of commits follow Conventional Commits"
            echo "   Format: type(scope): description"
            echo "   Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo "ℹ️  INFO: No git history found (new repository)"
fi

# Check for commitlint or pre-commit hooks
echo ""
echo "Checking commit message validation..."
if [ -f ".commitlintrc" ] || [ -f ".commitlintrc.json" ] || [ -f "commitlint.config.js" ]; then
    echo "✅ Commitlint configured"
elif [ -f ".pre-commit-config.yaml" ] && grep -qi "commitlint\|conventional" .pre-commit-config.yaml 2>/dev/null; then
    echo "✅ Commit message validation in pre-commit hooks"
else
    echo "ℹ️  INFO: Commit message validation not configured (recommended)"
    echo "   See: https://commitlint.js.org/"
fi

# Check for semantic versioning tags
echo ""
echo "Checking version tags..."
if git tag 2>/dev/null | head -1 >/dev/null; then
    TAGS=$(git tag 2>/dev/null | head -5)
    SEMVER_COUNT=0
    TOTAL_TAGS=0
    
    while IFS= read -r tag; do
        TOTAL_TAGS=$((TOTAL_TAGS + 1))
        if echo "$tag" | grep -qE "^v?[0-9]+\.[0-9]+\.[0-9]+"; then
            SEMVER_COUNT=$((SEMVER_COUNT + 1))
        fi
    done <<< "$TAGS"
    
    if [ $TOTAL_TAGS -gt 0 ]; then
        if [ $SEMVER_COUNT -eq $TOTAL_TAGS ]; then
            echo "✅ All tags follow semantic versioning"
        else
            echo "⚠️  WARNING: Some tags don't follow semantic versioning"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo "ℹ️  INFO: No version tags found (new project)"
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
