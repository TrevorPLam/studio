#!/bin/bash
# Master validation script for ALIGNMENT standard
# Runs all available validation scripts
# Usage: ./scripts/validate-all.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 ALIGNMENT Standard Validation"
echo "================================="
echo "Repository: $REPO_ROOT"
echo ""

TOTAL_ERRORS=0
TOTAL_WARNINGS=0

# Run all validation scripts in order
VALIDATION_SCRIPTS=(
    "validate-section-1.sh"
    "validate-section-2.sh"
    "validate-section-3.sh"
    "validate-section-4.sh"
    "validate-section-5.sh"
    "validate-section-6.sh"
    "validate-section-7.sh"
    "validate-section-8.sh"
    "validate-section-9.sh"
    "validate-section-10.sh"
    "validate-section-11.sh"
    "validate-section-12.sh"
    "validate-section-13.sh"
)

for script_name in "${VALIDATION_SCRIPTS[@]}"; do
    script="$SCRIPT_DIR/$script_name"
    if [ -f "$script" ]; then
        # Make executable if not already
        [ ! -x "$script" ] && chmod +x "$script"
        
        echo ""
        if "$script" "$REPO_ROOT"; then
            # Script succeeded
            :
        else
            EXIT_CODE=$?
            if [ $EXIT_CODE -eq 1 ]; then
                TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
            fi
        fi
    fi
done

echo ""
echo "================================="
echo "Overall Summary:"
echo "  Sections with errors: $TOTAL_ERRORS"
echo ""

if [ $TOTAL_ERRORS -gt 0 ]; then
    echo "❌ Some sections failed validation"
    echo "   Review errors above and fix before proceeding"
    exit 1
else
    echo "✅ All validations passed!"
    exit 0
fi
