#!/bin/bash
# Validation script for ALIGNMENT Section 7: Documentation Standards
# Usage: ./scripts/validate-section-7.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 7: Documentation Standards"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# Check if README.md exists
if [ ! -f "README.md" ]; then
    echo "❌ ERROR: README.md is missing (required)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ README.md exists"
    
    # Check README.md content quality
    README_SIZE=$(wc -l < README.md | tr -d ' ')
    if [ "$README_SIZE" -lt 10 ]; then
        echo "⚠️  WARNING: README.md is very short ($README_SIZE lines, recommend 20+ lines)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for essential sections
    if ! grep -qiE "installation|setup|getting started" README.md 2>/dev/null; then
        echo "⚠️  WARNING: README.md missing installation/setup section"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if ! grep -qiE "usage|example|how to" README.md 2>/dev/null; then
        echo "⚠️  WARNING: README.md missing usage/example section"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for project description
    if [ "$README_SIZE" -gt 0 ]; then
        FIRST_LINE=$(head -n 1 README.md)
        if echo "$FIRST_LINE" | grep -qE "^# "; then
            echo "✅ README.md has proper title"
        else
            echo "⚠️  WARNING: README.md should start with # Title"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi

# Check for CONTRIBUTING.md (P0 requirement)
if [ ! -f "CONTRIBUTING.md" ]; then
    echo "⚠️  WARNING: CONTRIBUTING.md missing (P0 requirement for projects accepting contributions)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ CONTRIBUTING.md exists"
fi

# Check for docs/ directory (P1 recommendation)
if [ -d "docs" ]; then
    echo "✅ docs/ directory exists"
    
    # Check if docs/ is empty
    DOC_FILES=$(find docs -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DOC_FILES" -eq 0 ]; then
        echo "⚠️  WARNING: docs/ directory exists but contains no markdown files"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ docs/ contains $DOC_FILES documentation file(s)"
    fi
else
    echo "ℹ️  INFO: docs/ directory not found (P1 recommendation for larger projects)"
fi

# Check for API documentation (if applicable)
if [ -f "package.json" ] || [ -f "go.mod" ] || [ -f "Cargo.toml" ]; then
    # Check for API docs
    if [ -f "docs/api.md" ] || [ -f "docs/API.md" ] || [ -f "API.md" ] || [ -d "docs/api" ]; then
        echo "✅ API documentation found"
    elif [ -f "openapi.yaml" ] || [ -f "openapi.yml" ] || [ -f "swagger.yaml" ] || [ -f "swagger.yml" ]; then
        echo "✅ OpenAPI/Swagger specification found"
    else
        # Check if it's a library/API project that should have API docs
        if grep -qiE "library|api|sdk|package" README.md 2>/dev/null || [ -f "package.json" ]; then
            echo "ℹ️  INFO: Consider adding API documentation for library/API projects"
        fi
    fi
fi

# Check for architecture documentation (P1 recommendation)
if [ -f "docs/architecture.md" ] || [ -f "docs/ARCHITECTURE.md" ] || [ -f "ARCHITECTURE.md" ]; then
    echo "✅ Architecture documentation found"
elif [ -d "docs" ]; then
    echo "ℹ️  INFO: Consider adding architecture documentation (docs/architecture.md)"
fi

# Check for code comments (basic check - look for files with no comments)
if [ -d "src" ] || [ -d "lib" ]; then
    echo "ℹ️  INFO: Review code comments manually (ensure public APIs are documented)"
fi

# Check for inline documentation generation
if [ -f "jsdoc.json" ] || [ -f ".jsdocrc" ] || [ -f "typedoc.json" ]; then
    echo "✅ JSDoc/TypeDoc configuration found"
fi

if [ -f "sphinx" ] || [ -f "docs/conf.py" ] || [ -f "setup.py" ] && grep -q "sphinx" setup.py 2>/dev/null; then
    echo "✅ Sphinx documentation configuration found"
fi

# Check for broken links in README (basic check)
if [ -f "README.md" ]; then
    # Check for markdown links
    MARKDOWN_LINKS=$(grep -oE '\[.*\]\([^)]+\)' README.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$MARKDOWN_LINKS" -gt 0 ]; then
        echo "ℹ️  INFO: Found $MARKDOWN_LINKS markdown link(s) in README.md (verify manually or use link checker)"
    fi
fi

# Check for SECURITY.md (if public repo - should be checked in Section 10)
if [ -f "SECURITY.md" ] || [ -f "docs/SECURITY.md" ]; then
    echo "✅ SECURITY.md found"
fi

# Check for CHANGELOG.md (if versioned project)
if [ -f "CHANGELOG.md" ]; then
    echo "✅ CHANGELOG.md found"
    
    # Check CHANGELOG format (basic)
    if grep -qE "^## \[.*\]" CHANGELOG.md 2>/dev/null || grep -qE "^# Changelog" CHANGELOG.md 2>/dev/null; then
        echo "✅ CHANGELOG.md appears properly formatted"
    else
        echo "⚠️  WARNING: CHANGELOG.md format may not follow standard (check Keep a Changelog format)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for license in README
if [ -f "README.md" ]; then
    if grep -qiE "license|licence" README.md 2>/dev/null; then
        echo "✅ README.md mentions license"
    else
        echo "⚠️  WARNING: README.md should mention license (especially for public repos)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "================================================"
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
