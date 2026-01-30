#!/bin/bash
# Validation script for ALIGNMENT Section 13: Quality & Health Checks
# Usage: ./scripts/validate-section-13.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 13: Quality & Health Checks"
echo "================================================="
echo ""

ERRORS=0
WARNINGS=0

# Check if repository builds from scratch (basic check - look for build files)
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json 2>/dev/null || grep -q '"compile"' package.json 2>/dev/null; then
        echo "✅ Build script found in package.json"
    else
        echo "⚠️  WARNING: No build script found in package.json"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

if [ -f "Makefile" ] || [ -f "makefile" ]; then
    echo "✅ Makefile found"
fi

if [ -f "go.mod" ]; then
    echo "✅ Go module found (go build should work)"
fi

if [ -f "Cargo.toml" ]; then
    echo "✅ Cargo.toml found (cargo build should work)"
fi

# Check for test configuration
if [ -f "package.json" ]; then
    if grep -q '"test"' package.json 2>/dev/null; then
        echo "✅ Test script found in package.json"
    fi
fi

# Check for test coverage reporting
if [ -f "package.json" ]; then
    if grep -qiE "coverage|istanbul|nyc|jest.*coverage" package.json 2>/dev/null; then
        echo "✅ Test coverage tool configured"
    fi
fi

if [ -f ".coveragerc" ] || [ -f "pyproject.toml" ] && grep -q "coverage" pyproject.toml 2>/dev/null; then
    echo "✅ Python coverage configuration found"
fi

# Check for coverage reports directory
if [ -d "coverage" ] || [ -d ".coverage" ] || [ -f "coverage.xml" ] || [ -f "coverage.json" ]; then
    echo "✅ Coverage reports directory/file found"
    
    # Check if coverage is in .gitignore
    if [ -f ".gitignore" ]; then
        if grep -q "coverage" .gitignore 2>/dev/null || grep -q ".coverage" .gitignore 2>/dev/null; then
            echo "✅ Coverage reports excluded in .gitignore"
        else
            echo "⚠️  WARNING: Coverage reports not excluded in .gitignore"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi

# Check for linting configuration
if [ -f ".eslintrc" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
    echo "✅ ESLint configuration found"
fi

if [ -f ".pylintrc" ] || [ -f "pylintrc" ] || [ -f "pyproject.toml" ] && grep -q "pylint\|ruff\|flake8" pyproject.toml 2>/dev/null; then
    echo "✅ Python linter configuration found"
fi

if [ -f ".golangci.yml" ] || [ -f ".golangci.yaml" ] || [ -f "golangci.yml" ]; then
    echo "✅ golangci-lint configuration found"
fi

# Check for formatting configuration
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f "prettier.config.js" ] || [ -f ".prettierrc.js" ]; then
    echo "✅ Prettier configuration found"
fi

if [ -f ".editorconfig" ]; then
    echo "✅ EditorConfig found"
fi

if [ -f "pyproject.toml" ] && grep -q "black\|autopep8\|yapf" pyproject.toml 2>/dev/null; then
    echo "✅ Python formatter configuration found"
fi

if [ -f "rustfmt.toml" ] || [ -f ".rustfmt.toml" ]; then
    echo "✅ rustfmt configuration found"
fi

# Check for CI/CD (should be validated in Section 5, but check here too)
if [ -d ".github/workflows" ]; then
    WORKFLOWS=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$WORKFLOWS" -gt 0 ]; then
        echo "✅ GitHub Actions workflows found ($WORKFLOWS workflow(s))"
    fi
fi

if [ -f ".gitlab-ci.yml" ]; then
    echo "✅ GitLab CI configuration found"
fi

if [ -f "Jenkinsfile" ]; then
    echo "✅ Jenkinsfile found"
fi

# Check for repository health documentation
if [ -f "docs/repository-health.md" ] || [ -f "docs/health.md" ] || [ -f "HEALTH.md" ]; then
    echo "✅ Repository health documentation found"
else
    echo "ℹ️  INFO: Consider creating repository health documentation (docs/repository-health.md)"
fi

# Check for health scoring script/tool
if [ -f "scripts/health-check.sh" ] || [ -f "scripts/check-health.sh" ] || [ -f "tools/health-check.*" ]; then
    echo "✅ Health check script found"
fi

# Check for quality gates in CI (can't validate directly, but check for docs)
if [ -f "docs/quality-gates.md" ] || grep -qiE "quality gate|health score|compliance check" README.md docs/*.md 2>/dev/null; then
    echo "✅ Quality gates documented"
fi

# Check for dependency health tools
if [ -f "package.json" ]; then
    if grep -qiE "npm audit|snyk|dependabot|renovate" package.json 2>/dev/null || [ -f ".github/dependabot.yml" ] || [ -f "renovate.json" ]; then
        echo "✅ Dependency health tool configured"
    fi
fi

# Check for code complexity tools
if [ -f "package.json" ]; then
    if grep -qiE "complexity|cyclomatic|sonar" package.json 2>/dev/null; then
        echo "✅ Code complexity tool found"
    fi
fi

# Check for documentation coverage
if [ -d "docs" ]; then
    DOC_FILES=$(find docs -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DOC_FILES" -gt 0 ]; then
        echo "✅ Documentation found ($DOC_FILES file(s) in docs/)"
    fi
fi

# Check for broken link checker configuration
if [ -f "package.json" ]; then
    if grep -qiE "linkinator|markdown-link-check|broken-link-checker" package.json 2>/dev/null; then
        echo "✅ Link checker tool configured"
    fi
fi

# Check for security scanning (should be in Section 10, but verify here)
if [ -f ".github/dependabot.yml" ] || [ -f "dependabot.yml" ]; then
    echo "✅ Dependabot configuration found"
fi

if [ -f ".snyk" ] || [ -f "snyk.yaml" ]; then
    echo "✅ Snyk configuration found"
fi

# Check for performance testing
if [ -f "package.json" ]; then
    if grep -qiE "lighthouse|webpagetest|k6|artillery" package.json 2>/dev/null; then
        echo "✅ Performance testing tool found"
    fi
fi

# Check for accessibility testing
if [ -f "package.json" ]; then
    if grep -qiE "axe|pa11y|accessibility|a11y" package.json 2>/dev/null; then
        echo "✅ Accessibility testing tool found"
    fi
fi

# Check for health badge/shield (if documented)
if [ -f "README.md" ]; then
    if grep -qiE "shields\.io|badge.*health|health.*score" README.md 2>/dev/null; then
        echo "✅ Health badge documented"
    fi
fi

echo ""
echo "================================================="
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
