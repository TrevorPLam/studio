#!/bin/bash
# Validation script for ALIGNMENT Section 2: Source Code Layout
# Usage: ./scripts/validate-section-2.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 2: Source Code Layout"
echo "==========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check if source code exists in root directory (should be moved)
SOURCE_FILES_IN_ROOT=$(find . -maxdepth 1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.rb" -o -name "*.php" \) ! -name ".*" ! -name "*.config.*" ! -name "*.test.*" ! -name "*.spec.*" 2>/dev/null | wc -l | tr -d ' ')

if [ "$SOURCE_FILES_IN_ROOT" -gt 0 ]; then
    echo "❌ ERROR: Found $SOURCE_FILES_IN_ROOT source file(s) in root directory"
    echo "   Source code should be in src/, cmd/, pkg/, apps/, or packages/ directories"
    echo "   Files found:"
    find . -maxdepth 1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.rb" -o -name "*.php" \) ! -name ".*" ! -name "*.config.*" ! -name "*.test.*" ! -name "*.spec.*" 2>/dev/null | sed 's|^\./|   - |'
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No source files in root directory"
fi

# Check for proper source directories
HAS_SRC=false
HAS_CMD=false
HAS_PKG=false
HAS_APPS=false
HAS_PACKAGES=false

if [ -d "src" ]; then
    HAS_SRC=true
    echo "✅ src/ directory exists"
    
    # Check if src/ is empty
    if [ -z "$(find src -type f -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" 2>/dev/null | head -1)" ]; then
        echo "⚠️  WARNING: src/ directory exists but appears empty"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

if [ -d "cmd" ]; then
    HAS_CMD=true
    echo "✅ cmd/ directory exists (Go convention)"
fi

if [ -d "pkg" ]; then
    HAS_PKG=true
    echo "✅ pkg/ directory exists (Go convention)"
fi

if [ -d "apps" ]; then
    HAS_APPS=true
    echo "✅ apps/ directory exists (monorepo convention)"
fi

if [ -d "packages" ]; then
    HAS_PACKAGES=true
    echo "✅ packages/ directory exists (monorepo convention)"
fi

# Check if we have at least one source directory
if [ "$HAS_SRC" = false ] && [ "$HAS_CMD" = false ] && [ "$HAS_APPS" = false ]; then
    echo "⚠️  WARNING: No standard source directory found (src/, cmd/, or apps/)"
    echo "   Consider creating appropriate source directory structure"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for Go-specific structure
if [ -f "go.mod" ]; then
    if [ "$HAS_CMD" = false ] && [ "$HAS_PKG" = false ]; then
        echo "⚠️  WARNING: Go project detected but cmd/ or pkg/ directories not found"
        echo "   Go projects typically use cmd/ for executables and pkg/ for libraries"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for monorepo structure
if [ -f "pnpm-workspace.yaml" ] || [ -f "lerna.json" ] || [ -f "turbo.json" ] || [ -f "nx.json" ]; then
    echo "ℹ️  INFO: Monorepo detected (workspace config found)"
    if [ "$HAS_APPS" = false ] && [ "$HAS_PACKAGES" = false ]; then
        echo "⚠️  WARNING: Monorepo detected but apps/ or packages/ directories not found"
        echo "   Monorepos typically use apps/ for applications and packages/ for shared libraries"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for test files in proper location
TEST_FILES_IN_ROOT=$(find . -maxdepth 1 -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" \) ! -name ".*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TEST_FILES_IN_ROOT" -gt 0 ]; then
    echo "⚠️  WARNING: Found $TEST_FILES_IN_ROOT test file(s) in root directory"
    echo "   Test files should be in tests/, __tests__/, or alongside source files"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for proper test directory structure
if [ -d "tests" ] || [ -d "__tests__" ] || [ -d "test" ]; then
    echo "✅ Test directory exists"
else
    # Check if tests are alongside source (also valid)
    TESTS_WITH_SOURCE=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$TESTS_WITH_SOURCE" -eq 0 ]; then
        echo "ℹ️  INFO: No test directory or test files found (tests recommended)"
    fi
fi

# Check for proper import/package structure (language-specific)
if [ -f "package.json" ]; then
    # Check if package.json has proper main/module/exports
    if grep -q '"main":' package.json 2>/dev/null || grep -q '"module":' package.json 2>/dev/null || grep -q '"exports":' package.json 2>/dev/null; then
        echo "✅ package.json has entry points configured"
    else
        echo "⚠️  WARNING: package.json missing main/module/exports (may affect package usability)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for circular dependencies warning (common issue)
if [ -d "src" ] || [ -d "packages" ]; then
    echo "ℹ️  INFO: Check for circular dependencies manually (use tools like madge, dependency-cruiser)"
fi

echo ""
echo "==========================================="
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
