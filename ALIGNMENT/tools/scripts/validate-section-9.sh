#!/bin/bash
# Validation script for ALIGNMENT Section 9: Governance & Ownership
# Usage: ./scripts/validate-section-9.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 9: Governance & Ownership"
echo "==============================================="
echo ""

ERRORS=0
WARNINGS=0

# Check for CODEOWNERS file (P0 requirement)
if [ -f ".github/CODEOWNERS" ] || [ -f "CODEOWNERS" ] || [ -f ".gitlab/CODEOWNERS" ]; then
    echo "✅ CODEOWNERS file found"
    
    # Check if CODEOWNERS has content
    CODEOWNERS_FILE=""
    if [ -f ".github/CODEOWNERS" ]; then
        CODEOWNERS_FILE=".github/CODEOWNERS"
    elif [ -f "CODEOWNERS" ]; then
        CODEOWNERS_FILE="CODEOWNERS"
    elif [ -f ".gitlab/CODEOWNERS" ]; then
        CODEOWNERS_FILE=".gitlab/CODEOWNERS"
    fi
    
    if [ -n "$CODEOWNERS_FILE" ]; then
        CODEOWNERS_LINES=$(grep -v "^#" "$CODEOWNERS_FILE" | grep -v "^$" | wc -l | tr -d ' ')
        if [ "$CODEOWNERS_LINES" -eq 0 ]; then
            echo "⚠️  WARNING: CODEOWNERS file exists but appears empty"
            WARNINGS=$((WARNINGS + 1))
        else
            echo "✅ CODEOWNERS file has $CODEOWNERS_LINES rule(s)"
        fi
    fi
else
    echo "❌ ERROR: CODEOWNERS file missing (P0 requirement)"
    echo "   Create .github/CODEOWNERS (GitHub) or CODEOWNERS (GitLab)"
    ERRORS=$((ERRORS + 1))
fi

# Check for CONTRIBUTING.md (P0 requirement)
if [ ! -f "CONTRIBUTING.md" ]; then
    echo "❌ ERROR: CONTRIBUTING.md missing (P0 requirement)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ CONTRIBUTING.md exists"
    
    # Check CONTRIBUTING.md content
    CONTRIB_SIZE=$(wc -l < CONTRIBUTING.md | tr -d ' ')
    if [ "$CONTRIB_SIZE" -lt 20 ]; then
        echo "⚠️  WARNING: CONTRIBUTING.md is very short ($CONTRIB_SIZE lines, recommend 50+ lines)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for essential sections
    if ! grep -qiE "how to contribute|contributing|pull request|pr process" CONTRIBUTING.md 2>/dev/null; then
        echo "⚠️  WARNING: CONTRIBUTING.md missing contribution process section"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if ! grep -qiE "code style|formatting|linting" CONTRIBUTING.md 2>/dev/null; then
        echo "⚠️  WARNING: CONTRIBUTING.md missing code style guidelines"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for maintainers.md (P1 recommendation)
if [ -f "maintainers.md" ] || [ -f "docs/maintainers.md" ] || [ -f "MAINTAINERS.md" ]; then
    echo "✅ maintainers.md found"
else
    echo "ℹ️  INFO: maintainers.md not found (P1 recommendation)"
fi

# Check for waiver.md (P1 recommendation)
if [ -f "waiver.md" ] || [ -f "docs/waiver.md" ] || [ -f "WAIVER.md" ]; then
    echo "✅ waiver.md found (documents intentional deviations)"
else
    echo "ℹ️  INFO: waiver.md not found (P1 recommendation for documenting deviations)"
fi

# Check for branching strategy documentation
if [ -f "CONTRIBUTING.md" ]; then
    if grep -qiE "branch|git flow|github flow|trunk" CONTRIBUTING.md 2>/dev/null; then
        echo "✅ Branching strategy documented"
    else
        echo "⚠️  WARNING: Branching strategy not documented in CONTRIBUTING.md"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for code review standards
if [ -f "CONTRIBUTING.md" ]; then
    if grep -qiE "code review|review|pull request|pr" CONTRIBUTING.md 2>/dev/null; then
        echo "✅ Code review process documented"
    else
        echo "⚠️  WARNING: Code review process not documented"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for .github/ directory (GitHub-specific)
if [ -d ".github" ]; then
    echo "✅ .github/ directory exists"
    
    # Check for pull_request_template.md
    if [ -f ".github/pull_request_template.md" ] || [ -f ".github/PULL_REQUEST_TEMPLATE.md" ]; then
        echo "✅ Pull request template found"
    else
        echo "ℹ️  INFO: Consider adding pull request template (.github/pull_request_template.md)"
    fi
    
    # Check for issue templates
    if [ -d ".github/ISSUE_TEMPLATE" ]; then
        ISSUE_TEMPLATES=$(find .github/ISSUE_TEMPLATE -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$ISSUE_TEMPLATES" -gt 0 ]; then
            echo "✅ Issue templates found ($ISSUE_TEMPLATES template(s))"
        fi
    else
        echo "ℹ️  INFO: Consider adding issue templates (.github/ISSUE_TEMPLATE/)"
    fi
fi

# Check for .gitlab/ directory (GitLab-specific)
if [ -d ".gitlab" ]; then
    echo "✅ .gitlab/ directory exists"
    
    # Check for merge request template
    if [ -f ".gitlab/merge_request_templates/default.md" ]; then
        echo "✅ Merge request template found"
    fi
fi

# Check for branch protection (can't validate directly, but check for docs)
if [ -f "docs/branch-protection.md" ] || grep -qiE "branch protection|protected branch" README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ Branch protection documented"
else
    echo "ℹ️  INFO: Consider documenting branch protection requirements"
fi

# Check for DCO or CLA (if applicable)
if [ -f ".github/DCO" ] || grep -qiE "developer certificate|DCO|CLA" CONTRIBUTING.md README.md 2>/dev/null; then
    echo "✅ Contributor agreement (DCO/CLA) configured or documented"
fi

# Check for security policy reference
if [ -f "SECURITY.md" ] || [ -f ".github/SECURITY.md" ]; then
    echo "✅ SECURITY.md found (security reporting process)"
fi

echo ""
echo "==============================================="
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
