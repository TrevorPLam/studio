#!/bin/bash
# Validation script for ALIGNMENT Section 1: Root Directory Structure
# Usage: ./scripts/validate-section-1.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 1: Root Directory Structure"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0

# Check if README.md exists
if [ ! -f "README.md" ]; then
    echo "❌ ERROR: README.md is missing (required)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ README.md exists"
    
    # Check README content quality
    README_LINES=$(wc -l < README.md)
    if [ "$README_LINES" -lt 10 ]; then
        echo "⚠️  WARNING: README.md is very short ($README_LINES lines). Should include:"
        echo "   - Project description"
        echo "   - Installation/setup instructions"
        echo "   - Usage examples"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for essential README sections
    if ! grep -qi "^#.*install\|^#.*setup\|^#.*getting started" README.md; then
        echo "⚠️  WARNING: README.md missing installation/setup section"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if ! grep -qi "^#.*usage\|^#.*example\|^#.*quick start" README.md; then
        echo "⚠️  WARNING: README.md missing usage/examples section"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for project title
    if ! head -5 README.md | grep -q "^# "; then
        echo "⚠️  WARNING: README.md should start with a # title"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "❌ ERROR: .gitignore is missing (required)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ .gitignore exists"
    
    # Check for common patterns in .gitignore
    if ! grep -q "\.env" .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: .gitignore doesn't exclude .env files"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if ! grep -q "node_modules" .gitignore 2>/dev/null && [ -f "package.json" ]; then
        echo "⚠️  WARNING: .gitignore doesn't exclude node_modules (package.json found)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if ! grep -q "dist\|build" .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: .gitignore doesn't exclude dist/ or build/ directories"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check LICENSE file (required for public repos)
if [ ! -f "LICENSE" ] && [ ! -f "LICENSE.txt" ] && [ ! -f "LICENCE" ]; then
    echo "⚠️  WARNING: LICENSE file missing (required for public repos)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ LICENSE file exists"
fi

# Count root-level files (excluding hidden files and directories)
ROOT_FILES=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l | tr -d ' ')
if [ "$ROOT_FILES" -gt 10 ]; then
    echo "⚠️  WARNING: Root directory has $ROOT_FILES files (target: ≤10)"
    echo "   Consider moving files to appropriate directories (config/, scripts/, docs/)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ Root directory has $ROOT_FILES files (target: ≤10)"
fi

# Check for common files that should be moved
if [ -f "config.js" ] || [ -f "config.py" ] || [ -f "config.json" ]; then
    echo "⚠️  WARNING: Config files in root (consider moving to config/ directory)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for source files in root (should be in src/ or appropriate directory)
SOURCE_FILES=$(find . -maxdepth 1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) ! -name ".*" | wc -l | tr -d ' ')
if [ "$SOURCE_FILES" -gt 0 ]; then
    echo "⚠️  WARNING: Found $SOURCE_FILES source file(s) in root directory"
    echo "   Consider moving to src/ or appropriate directory (see Section 2)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for .env files (should not be committed)
if [ -f ".env" ]; then
    echo "❌ ERROR: .env file found in repository (should be in .gitignore)"
    ERRORS=$((ERRORS + 1))
fi

# Check if .env.example exists (if .env patterns are in .gitignore)
if grep -q "\.env" .gitignore 2>/dev/null && [ ! -f ".env.example" ]; then
    echo "⚠️  WARNING: .env.example missing (recommended if using environment variables)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for build artifacts
if [ -d "dist" ] || [ -d "build" ] || [ -d "node_modules" ]; then
    if [ -d "dist" ] && ! grep -q "dist" .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: dist/ directory exists but not in .gitignore"
        WARNINGS=$((WARNINGS + 1))
    fi
    if [ -d "build" ] && ! grep -q "build" .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: build/ directory exists but not in .gitignore"
        WARNINGS=$((WARNINGS + 1))
    fi
    if [ -d "node_modules" ] && ! grep -q "node_modules" .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: node_modules/ directory exists but not in .gitignore"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for CHANGELOG.md (if versioned project - this is a manual check)
if [ ! -f "CHANGELOG.md" ]; then
    echo "ℹ️  INFO: CHANGELOG.md not found (required only for versioned projects)"
fi

echo ""
echo "=================================================="
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
