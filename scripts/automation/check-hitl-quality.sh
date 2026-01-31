#!/usr/bin/env bash
# filepath: scripts/automation/check-hitl-quality.sh
# purpose: Automated HITL quality verification.
# last updated: 2026-01-30
# related tasks: Workflow automation enhancement

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HITL_DIR="agents/hitl"

echo "==> HITL Quality Check"

# Check if HITL directory exists
if [[ ! -d "$HITL_DIR" ]]; then
    echo -e "${RED}ERROR: HITL directory not found${NC}"
    exit 1
fi

# Function to validate HITL file structure
validate_hitl_file() {
    local file="$1"
    local errors=0
    
    echo "Checking $file..."
    
    # Check for required sections
    local required_sections=(
        "Status:"
        "Created:"
        "Related Tasks:"
        "Title"
        "Context"
        "Changes Made"
        "Why Human Approval is Required"
        "Impact"
        "Verification Steps Completed"
        "Recommendation"
    )
    
    for section in "${required_sections[@]}"; do
        if ! grep -q "$section" "$file"; then
            echo -e "${RED}ERROR: Missing required section: $section${NC}"
            ((errors++))
        fi
    done
    
    # Check status values
    local status
    status=$(grep "^**Status**:" "$file" | cut -d':' -f2 | tr -d ' ')
    
    if [[ ! "$status" =~ ^(Pending|Approved|Rejected|Resolved)$ ]]; then
        echo -e "${RED}ERROR: Invalid status: $status${NC}"
        ((errors++))
    fi
    
    # Check date format
    local created_date
    created_date=$(grep "^**Created**:" "$file" | cut -d':' -f2 | tr -d ' ')
    
    if [[ ! "$created_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo -e "${RED}ERROR: Invalid date format: $created_date${NC}"
        ((errors++))
    fi
    
    # Check for task references
    if ! grep -q "TASK-[0-9]" "$file"; then
        echo -e "${YELLOW}WARNING: No task references found${NC}"
    fi
    
    return $errors
}

# Function to check HITL naming convention
check_naming_convention() {
    local errors=0
    
    echo "Checking HITL naming convention..."
    
    for file in "$HITL_DIR"/*.md; do
        if [[ -f "$file" ]]; then
            local filename
            filename=$(basename "$file")
            
            # Skip README and template files
            if [[ "$filename" =~ ^(README|.*-template)\.md$ ]]; then
                continue
            fi
            
            # Check naming pattern
            if [[ ! "$filename" =~ ^HITL-[0-9]{4}\.md$ ]]; then
                echo -e "${RED}ERROR: Invalid HITL filename: $filename${NC}"
                ((errors++))
            fi
        fi
    done
    
    return $errors
}

# Function to check for duplicate HITL numbers
check_duplicate_hitl_numbers() {
    local errors=0
    
    echo "Checking for duplicate HITL numbers..."
    
    local hitl_numbers
    hitl_numbers=$(find "$HITL_DIR" -name "HITL-*.md" -not -name "*-template.md" | sed 's/.*HITL-\([0-9]*\)\.md/\1/' | sort)
    
    local duplicates
    duplicates=$(echo "$hitl_numbers" | uniq -d)
    
    if [[ -n "$duplicates" ]]; then
        echo -e "${RED}ERROR: Duplicate HITL numbers found:${NC}"
        echo "$duplicates"
        ((errors++))
    fi
    
    return $errors
}

# Function to check template consistency
check_template_consistency() {
    local errors=0
    
    echo "Checking template consistency..."
    
    # Check if templates directory exists
    if [[ ! -d "$HITL_DIR/templates" ]]; then
        echo -e "${YELLOW}WARNING: No templates directory found${NC}"
        return 0
    fi
    
    # Check required templates
    local required_templates=(
        "HITL-SEC-template.md"
        "HITL-PROT-template.md"
        "HITL-EXT-template.md"
        "HITL-UNK-template.md"
    )
    
    for template in "${required_templates[@]}"; do
        if [[ ! -f "$HITL_DIR/templates/$template" ]]; then
            echo -e "${YELLOW}WARNING: Missing template: $template${NC}"
        fi
    done
    
    return $errors
}

# Run all checks
total_errors=0

check_naming_convention || ((total_errors += $?))
check_duplicate_hitl_numbers || ((total_errors += $?))
check_template_consistency || ((total_errors += $?))

# Validate each HITL file
for file in "$HITL_DIR"/*.md; do
    if [[ -f "$file" ]]; then
        local filename
        filename=$(basename "$file")
        
        # Skip README and template files
        if [[ "$filename" =~ ^(README|.*-template)\.md$ ]]; then
            continue
        fi
        
        validate_hitl_file "$file" || ((total_errors += $?))
    fi
done

# Summary
if [[ $total_errors -eq 0 ]]; then
    echo -e "${GREEN}✓ HITL quality check passed${NC}"
    exit 0
else
    echo -e "${RED}✗ HITL quality check failed with $total_errors errors${NC}"
    exit 1
fi
