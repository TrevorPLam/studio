#!/bin/bash
# Enhanced validation script for ALIGNMENT Section 7: Documentation Standards
# Usage: ./scripts/validate-section-7-enhanced.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 7: Documentation Standards (Enhanced)"
echo "============================================================"
echo ""

ERRORS=0
WARNINGS=0

# Check README.md
echo "📄 Checking README.md..."
if [ ! -f "README.md" ]; then
    echo "❌ ERROR: README.md is missing (P0 requirement)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ README.md exists"
    
    # Content quality checks
    README_LINES=$(wc -l < README.md)
    README_WORDS=$(wc -w < README.md)
    
    if [ "$README_LINES" -lt 20 ]; then
        echo "⚠️  WARNING: README.md is short ($README_LINES lines). Consider adding more detail."
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ "$README_WORDS" -lt 50 ]; then
        echo "⚠️  WARNING: README.md has few words ($README_WORDS). Should be more descriptive."
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for essential sections
    echo "  Checking for essential sections..."
    
    MISSING_SECTIONS=()
    
    if ! grep -qi "^#.*install\|^#.*setup\|^#.*getting started" README.md; then
        MISSING_SECTIONS+=("Installation/Setup")
    fi
    
    if ! grep -qi "^#.*usage\|^#.*example\|^#.*quick.*start" README.md; then
        MISSING_SECTIONS+=("Usage/Examples")
    fi
    
    if ! grep -qi "^#.*about\|^#.*overview\|^#.*description" README.md; then
        MISSING_SECTIONS+=("Project Description")
    fi
    
    if [ ${#MISSING_SECTIONS[@]} -gt 0 ]; then
        echo "⚠️  WARNING: README.md missing recommended sections:"
        for section in "${MISSING_SECTIONS[@]}"; do
            echo "     - $section"
        done
        WARNINGS=$((WARNINGS + 1))
    else
        echo "  ✅ All essential sections present"
    fi
    
    # Check for title
    if ! head -5 README.md | grep -q "^# "; then
        echo "⚠️  WARNING: README.md should start with a title (# heading)"
        WARNINGS=$((WARNINGS + 1))
    else
        TITLE=$(head -5 README.md | grep "^# " | head -1 | sed 's/^# //')
        echo "  ✅ Title found: $TITLE"
    fi
    
    # Check for links to other docs
    if ! grep -q "\[.*\](.*\.md)" README.md; then
        echo "⚠️  WARNING: README.md has no links to other documentation"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for badges (common in good READMEs)
    if grep -q "!\[.*\](https://.*badge" README.md || grep -q "!\[.*\](https://img.shields.io" README.md; then
        echo "  ✅ Badges present (good practice)"
    fi
fi

echo ""
echo "📄 Checking CONTRIBUTING.md..."
# Check for CONTRIBUTING.md (required if accepting contributions)
if [ -d ".git" ]; then
    # Git repo, should have CONTRIBUTING.md
    if [ ! -f "CONTRIBUTING.md" ]; then
        echo "⚠️  WARNING: CONTRIBUTING.md missing (P0 for repos accepting contributions)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ CONTRIBUTING.md exists"
        
        # Check content
        CONTRIB_LINES=$(wc -l < CONTRIBUTING.md)
        if [ "$CONTRIB_LINES" -lt 20 ]; then
            echo "⚠️  WARNING: CONTRIBUTING.md is brief ($CONTRIB_LINES lines)"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        # Check for essential contribution sections
        if ! grep -qi "pull request\|pr process" CONTRIBUTING.md; then
            echo "⚠️  WARNING: CONTRIBUTING.md should explain PR process"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi

echo ""
echo "📄 Checking CHANGELOG.md..."
# Check for CHANGELOG.md (required for versioned projects)
if [ -f "package.json" ] || [ -f "setup.py" ] || [ -f "Cargo.toml" ] || [ -f "go.mod" ]; then
    if [ ! -f "CHANGELOG.md" ]; then
        echo "⚠️  WARNING: CHANGELOG.md missing (P0 for versioned projects)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ CHANGELOG.md exists"
        
        # Check if follows Keep a Changelog format
        if grep -qi "keep a changelog\|keepachangelog" CHANGELOG.md; then
            echo "  ✅ Follows Keep a Changelog format"
        else
            echo "⚠️  WARNING: CHANGELOG.md should follow Keep a Changelog format"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        # Check for version entries
        if ! grep -q "^## \[" CHANGELOG.md && ! grep -q "^## [0-9]" CHANGELOG.md; then
            echo "⚠️  WARNING: CHANGELOG.md should have version entries (## [X.Y.Z])"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi

echo ""
echo "📄 Checking CODE_OF_CONDUCT.md..."
# Check for CODE_OF_CONDUCT.md (P1 for public/community projects)
if [ -f "CODE_OF_CONDUCT.md" ]; then
    echo "✅ CODE_OF_CONDUCT.md exists"
    
    if grep -qi "contributor covenant" CODE_OF_CONDUCT.md; then
        echo "  ✅ Uses Contributor Covenant (recommended)"
    fi
else
    echo "ℹ️  INFO: CODE_OF_CONDUCT.md not found (P1 for public projects)"
fi

echo ""
echo "📂 Checking docs/ directory..."
# Check for docs directory
if [ -d "docs" ] || [ -d "doc" ]; then
    DOC_DIR="docs"
    [ -d "doc" ] && DOC_DIR="doc"
    echo "✅ $DOC_DIR/ directory exists"
    
    # Check for docs README
    if [ ! -f "$DOC_DIR/README.md" ]; then
        echo "⚠️  WARNING: $DOC_DIR/README.md missing (helps with navigation)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "  ✅ $DOC_DIR/README.md exists"
    fi
    
    # Count documentation files
    DOC_COUNT=$(find "$DOC_DIR" -name "*.md" | wc -l | tr -d ' ')
    echo "  📝 Found $DOC_COUNT markdown files in $DOC_DIR/"
    
    if [ "$DOC_COUNT" -eq 0 ]; then
        echo "⚠️  WARNING: $DOC_DIR/ directory is empty"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "ℹ️  INFO: No docs/ directory (consider creating for additional documentation)"
fi

echo ""
echo "📝 Checking inline documentation..."
# Check for inline documentation in code files
CODE_FILES=()

# Find code files
if [ -d "src" ]; then
    while IFS= read -r -d '' file; do
        CODE_FILES+=("$file")
    done < <(find src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" \) -print0 2>/dev/null | head -20 -z)
fi

if [ ${#CODE_FILES[@]} -gt 0 ]; then
    echo "✅ Found ${#CODE_FILES[@]} code files (checking sample)"
    
    COMMENTED_FILES=0
    for file in "${CODE_FILES[@]:0:5}"; do
        # Check if file has comments (basic check)
        if grep -q "^[[:space:]]*\/\/\|^[[:space:]]*\/\*\|^[[:space:]]*#\|^[[:space:]]*\"\"\"\|^[[:space:]]*'''" "$file" 2>/dev/null; then
            COMMENTED_FILES=$((COMMENTED_FILES + 1))
        fi
    done
    
    if [ "$COMMENTED_FILES" -lt 3 ] && [ ${#CODE_FILES[@]} -ge 5 ]; then
        echo "⚠️  WARNING: Few code files have comments (checked 5 files, $COMMENTED_FILES had comments)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "  ✅ Code files appear to have inline documentation"
    fi
else
    echo "ℹ️  INFO: No code files found to check"
fi

echo ""
echo "📊 Checking API documentation..."
# Check for API documentation (if applicable)
if [ -f "openapi.yaml" ] || [ -f "openapi.yml" ] || [ -f "swagger.yaml" ] || [ -f "swagger.yml" ]; then
    echo "✅ API specification found (OpenAPI/Swagger)"
elif [ -f "api.md" ] || [ -f "docs/api.md" ] || [ -f "docs/API.md" ]; then
    echo "✅ API documentation found"
elif grep -qi "api" README.md 2>/dev/null; then
    echo "ℹ️  INFO: API mentioned in README (ensure API docs exist)"
else
    echo "ℹ️  INFO: No API documentation detected (skip if not applicable)"
fi

echo ""
echo "🔗 Checking documentation links..."
# Check for broken internal links in README
if [ -f "README.md" ]; then
    BROKEN_LINKS=0
    while IFS= read -r link; do
        # Extract path from markdown link
        path=$(echo "$link" | sed -n 's/.*(\([^)]*\)).*/\1/p')
        
        # Skip external links
        if [[ "$path" =~ ^https?:// ]] || [[ "$path" =~ ^# ]]; then
            continue
        fi
        
        # Check if file exists
        if [ ! -f "$path" ] && [ ! -d "$path" ]; then
            echo "⚠️  WARNING: Broken link in README.md: $path"
            BROKEN_LINKS=$((BROKEN_LINKS + 1))
        fi
    done < <(grep -o '\[.*\](.*\.md[^)]*)' README.md 2>/dev/null || true)
    
    if [ "$BROKEN_LINKS" -eq 0 ]; then
        echo "✅ No broken links detected in README.md"
    else
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "=================================================="
echo "📊 Validation Summary"
echo "=================================================="
echo "✅ Checks passed: $(($(grep -c "^✅" <<< "$(cat)" || true) + ERRORS + WARNINGS))"
echo "⚠️  Warnings: $WARNINGS"
echo "❌ Errors: $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ FAIL: $ERRORS error(s) found"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  PASS WITH WARNINGS: $WARNINGS warning(s) found"
    exit 0
else
    echo "✅ PASS: All checks passed"
    exit 0
fi
