#!/usr/bin/env bash
# filepath: scripts/automation/check-task-quality.sh
# purpose: Automated task quality verification for TODO.toon files.
# last updated: 2026-01-30
# related tasks: Workflow automation enhancement

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TODO_FILE="agents/tasks/TODO.toon"
BACKLOG_FILE="agents/tasks/BACKLOG.toon"
ARCHIVE_FILE="agents/tasks/ARCHIVE.toon"

echo "==> Task Quality Check"

# Check if TODO.toon exists
if [[ ! -f "$TODO_FILE" ]]; then
    echo -e "${RED}ERROR: $TODO_FILE not found${NC}"
    exit 1
fi

# Function to validate task structure
validate_task_structure() {
    local file="$1"
    local errors=0
    
    echo "Checking $file..."
    
    # Check for required headers
    if ! grep -q "^active_work\[" "$file"; then
        echo -e "${RED}ERROR: Missing active_work header${NC}"
        ((errors++))
    fi
    
    # Check task format (basic validation)
    while IFS= read -r line; do
        # Skip comments and headers
        if [[ "$line" =~ ^# ]] || [[ "$line" =~ ^meta ]] || [[ "$line" =~ ^active_work ]] || [[ -z "$line" ]]; then
            continue
        fi
        
        # Basic task format check
        if [[ ! "$line" =~ ^TASK-[0-9]+,.*,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,.*,[^,]+,.*,[^,]*$ ]]; then
            echo -e "${YELLOW}WARNING: Task format may be invalid: $line${NC}"
        fi
    done < "$file"
    
    return $errors
}

# Function to check for duplicate task IDs
check_duplicate_ids() {
    local file="$1"
    local duplicates
    
    duplicates=$(grep "^TASK-" "$file" | cut -d',' -f1 | sort | uniq -d)
    
    if [[ -n "$duplicates" ]]; then
        echo -e "${RED}ERROR: Duplicate task IDs found:${NC}"
        echo "$duplicates"
        return 1
    fi
    
    return 0
}

# Function to check task dependencies
check_dependencies() {
    local file="$1"
    local errors=0
    
    echo "Checking task dependencies..."
    
    # Extract all task IDs
    local all_tasks
    all_tasks=$(grep "^TASK-" "$file" | cut -d',' -f1 | sort)
    
    # Check each task's dependencies
    while IFS= read -r task_line; do
        if [[ "$task_line" =~ ^TASK- ]]; then
            local task_id
            task_id=$(echo "$task_line" | cut -d',' -f1)
            local dependencies
            dependencies=$(echo "$task_line" | cut -d',' -f11)
            
            if [[ -n "$dependencies" && "$dependencies" != " " ]]; then
                # Split dependencies by space and check each
                IFS=' ' read -ra deps <<< "$dependencies"
                for dep in "${deps[@]}"; do
                    if [[ "$dep" =~ TASK-[0-9]+ ]]; then
                        if ! echo "$all_tasks" | grep -q "^$dep$"; then
                            echo -e "${RED}ERROR: Task $task_id depends on non-existent task $dep${NC}"
                            ((errors++))
                        fi
                    fi
                done
            fi
        fi
    done < "$file"
    
    return $errors
}

# Function to check actor consistency
check_actor_consistency() {
    local file="$1"
    local errors=0
    
    echo "Checking actor consistency..."
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^TASK- ]]; then
            local actor
            actor=$(echo "$line" | cut -d',' -f7)
            
            if [[ ! "$actor" =~ ^(AGENT|USER)$ ]]; then
                echo -e "${RED}ERROR: Invalid actor '$actor' in task line${NC}"
                echo "  $line"
                ((errors++))
            fi
        fi
    done < "$file"
    
    return $errors
}

# Function to check priority levels
check_priority_levels() {
    local file="$1"
    local errors=0
    
    echo "Checking priority levels..."
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^TASK- ]]; then
            local priority
            priority=$(echo "$line" | cut -d',' -f6)
            
            if [[ ! "$priority" =~ ^P[0-3]$ ]]; then
                echo -e "${RED}ERROR: Invalid priority '$priority' in task line${NC}"
                echo "  $line"
                ((errors++))
            fi
        fi
    done < "$file"
    
    return $errors
}

# Run all checks
total_errors=0

validate_task_structure "$TODO_FILE" || ((total_errors += $?))
check_duplicate_ids "$TODO_FILE" || ((total_errors += $?))
check_dependencies "$TODO_FILE" || ((total_errors += $?))
check_actor_consistency "$TODO_FILE" || ((total_errors += $?))
check_priority_levels "$TODO_FILE" || ((total_errors += $?))

# Check other files if they exist
if [[ -f "$BACKLOG_FILE" ]]; then
    validate_task_structure "$BACKLOG_FILE" || ((total_errors += $?))
fi

if [[ -f "$ARCHIVE_FILE" ]]; then
    validate_task_structure "$ARCHIVE_FILE" || ((total_errors += $?))
fi

# Summary
if [[ $total_errors -eq 0 ]]; then
    echo -e "${GREEN}✓ Task quality check passed${NC}"
    exit 0
else
    echo -e "${RED}✗ Task quality check failed with $total_errors errors${NC}"
    exit 1
fi
