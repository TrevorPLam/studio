#!/bin/bash
# Validation script for ALIGNMENT Section 3: Configuration & Environment
# Usage: ./scripts/validate-section-3.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 3: Configuration & Environment"
echo "===================================================="
echo ""

ERRORS=0
WARNINGS=0

# CRITICAL: Check for secrets in repository
echo "Checking for secrets..."

# Check if .env file exists (should not be committed)
if [ -f ".env" ]; then
    echo "❌ ERROR: .env file found in repository (CRITICAL SECURITY ISSUE)"
    echo "   Action required:"
    echo "   1. Rotate all secrets in .env immediately"
    echo "   2. Remove .env from git history"
    echo "   3. Add .env to .gitignore"
    ERRORS=$((ERRORS + 1))
fi

# Check if .env is in .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "\.env" .gitignore 2>/dev/null; then
        echo "❌ ERROR: .env not excluded in .gitignore"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ .env excluded in .gitignore"
    fi
    
    # Check for other common secret patterns
    if ! grep -q "\.env\." .gitignore 2>/dev/null; then
        echo "⚠️  WARNING: .env.* patterns not excluded in .gitignore"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ ERROR: .gitignore file missing"
    ERRORS=$((ERRORS + 1))
fi

# Check for .env.example (recommended if using env vars)
if grep -q "\.env" .gitignore 2>/dev/null; then
    if [ ! -f ".env.example" ]; then
        echo "⚠️  WARNING: .env.example missing (recommended if using environment variables)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ .env.example exists"
        
        # Check if .env.example contains actual secrets (common mistake)
        if grep -qi "password\|secret\|key.*=" .env.example 2>/dev/null; then
            if grep -qi "example\|placeholder\|your-" .env.example 2>/dev/null; then
                echo "✅ .env.example appears to use placeholders"
            else
                echo "⚠️  WARNING: .env.example may contain actual secrets (review carefully)"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    fi
fi

# Check for config/ directory (P1 recommendation)
if [ -d "config" ]; then
    echo "✅ config/ directory exists"
else
    echo "ℹ️  INFO: config/ directory not found (P1 recommendation)"
fi

# Check for pre-commit hooks (P1 recommendation)
if [ -d ".git/hooks" ]; then
    if [ -f ".git/hooks/pre-commit" ] || [ -f ".husky/pre-commit" ] || [ -f ".pre-commit-config.yaml" ]; then
        echo "✅ Pre-commit hooks configured"
    else
        echo "ℹ️  INFO: Pre-commit hooks not configured (P1 recommendation)"
    fi
else
    echo "ℹ️  INFO: Not a git repository (skipping pre-commit check)"
fi

# Check for hardcoded secrets in common files (basic check)
echo ""
echo "Scanning for potential hardcoded secrets..."
SECRET_PATTERNS=("password.*=.*['\"][^'\"]" "api[_-]?key.*=.*['\"][^'\"]" "secret.*=.*['\"][^'\"]")

FOUND_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    # Search in common source files, excluding node_modules, .git, etc.
    MATCHES=$(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.java" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        -exec grep -lE "$pattern" {} \; 2>/dev/null | head -5)
    
    if [ -n "$MATCHES" ]; then
        echo "⚠️  WARNING: Potential hardcoded secrets found in:"
        echo "$MATCHES" | while read -r file; do
            echo "   - $file"
        done
        echo "   Review these files for hardcoded credentials"
        FOUND_SECRETS=$((FOUND_SECRETS + 1))
    fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
    echo "✅ No obvious hardcoded secrets found (manual review still recommended)"
fi

# Check for Docker Compose (P1 recommendation)
if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
    echo "✅ Docker Compose configuration found"
fi

# Check for Dev Container config (P1 recommendation)
if [ -d ".devcontainer" ]; then
    echo "✅ Dev Container configuration found"
fi

echo ""
echo "===================================================="
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
