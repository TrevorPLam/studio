#!/usr/bin/env bash
# filepath: scripts/automation/sync-workflows.sh
# purpose: Cross-repository workflow synchronization.
# last updated: 2026-01-30
# related tasks: Workflow automation enhancement

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SOURCE_REPO="c:/dev/OS"
TARGET_REPOS=("c:/dev/aios" "c:/dev/studio" "c:/dev/firm-template")
SYNC_ITEMS=(
    "agents/hitl/templates"
    "agents/tasks/templates"
    "scripts/automation"
)

echo -e "${BLUE}==> Cross-Repository Workflow Sync${NC}"

# Function to sync directory
sync_directory() {
    local source_dir="$1"
    local target_dir="$2"
    local item_name="$3"
    
    echo "Syncing $item_name..."
    
    # Create target directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy files recursively
    if cp -r "$source_dir"/* "$target_dir/" 2>/dev/null; then
        echo -e "${GREEN}✓ Synced $item_name${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to sync $item_name${NC}"
        return 1
    fi
}

# Function to check if repository exists
check_repo_exists() {
    local repo_path="$1"
    
    if [[ -d "$repo_path" ]]; then
        return 0
    else
        echo -e "${YELLOW}WARNING: Repository $repo_path not found, skipping${NC}"
        return 1
    fi
}

# Function to verify sync integrity
verify_sync() {
    local source_file="$1"
    local target_file="$2"
    
    if [[ -f "$source_file" && -f "$target_file" ]]; then
        # Simple file size comparison for integrity check
        local source_size
        local target_size
        source_size=$(stat -f%z "$source_file" 2>/dev/null || stat -c%s "$source_file" 2>/dev/null || echo "0")
        target_size=$(stat -f%z "$target_file" 2>/dev/null || stat -c%s "$target_file" 2>/dev/null || echo "0")
        
        if [[ "$source_size" -eq "$target_size" ]]; then
            return 0
        fi
    fi
    
    return 1
}

# Main sync process
total_errors=0
synced_repos=0

echo "Starting workflow synchronization..."

for target_repo in "${TARGET_REPOS[@]}"; do
    if check_repo_exists "$target_repo"; then
        echo -e "${BLUE}Syncing to $(basename "$target_repo")...${NC}"
        repo_errors=0
        
        for item in "${SYNC_ITEMS[@]}"; do
            source_path="$SOURCE_REPO/$item"
            target_path="$target_repo/$item"
            
            if [[ -d "$source_path" ]]; then
                if sync_directory "$source_path" "$target_path" "$item"; then
                    # Verify a few key files
                    if [[ "$item" == "agents/hitl/templates" ]]; then
                        if verify_sync "$source_path/README.md" "$target_path/README.md"; then
                            echo -e "${GREEN}  ✓ Verified HITL templates${NC}"
                        else
                            echo -e "${YELLOW}  ⚠ HITL templates verification warning${NC}"
                        fi
                    elif [[ "$item" == "agents/tasks/templates" ]]; then
                        if verify_sync "$source_path/README.md" "$target_path/README.md"; then
                            echo -e "${GREEN}  ✓ Verified task templates${NC}"
                        else
                            echo -e "${YELLOW}  ⚠ Task templates verification warning${NC}"
                        fi
                    fi
                else
                    ((repo_errors++))
                fi
            else
                echo -e "${YELLOW}WARNING: Source $item not found, skipping${NC}"
            fi
        done
        
        if [[ $repo_errors -eq 0 ]]; then
            echo -e "${GREEN}✓ Successfully synced $(basename "$target_repo")${NC}"
            ((synced_repos++))
        else
            echo -e "${RED}✗ Sync failed for $(basename "$target_repo") with $repo_errors errors${NC}"
            ((total_errors += repo_errors))
        fi
    fi
done

# Summary
echo
echo -e "${BLUE}=== Sync Summary ===${NC}"
echo "Repositories attempted: ${#TARGET_REPOS[@]}"
echo "Repositories synced: $synced_repos"
echo "Total errors: $total_errors"

if [[ $total_errors -eq 0 ]]; then
    echo -e "${GREEN}✓ All repositories synced successfully${NC}"
    
    # Run quick verification on synced repositories
    echo
    echo -e "${BLUE}=== Post-Sync Verification ===${NC}"
    
    for target_repo in "${TARGET_REPOS[@]}"; do
        if check_repo_exists "$target_repo"; then
            echo "Checking $(basename "$target_repo")..."
            
            # Check if key files exist
            local checks=0
            local total_checks=3
            
            if [[ -f "$target_repo/agents/hitl/templates/README.md" ]]; then
                ((checks++))
            fi
            
            if [[ -f "$target_repo/agents/tasks/templates/README.md" ]]; then
                ((checks++))
            fi
            
            if [[ -f "$target_repo/scripts/automation/check-task-quality.sh" ]]; then
                ((checks++))
            fi
            
            if [[ $checks -eq $total_checks ]]; then
                echo -e "${GREEN}  ✓ All key files present${NC}"
            else
                echo -e "${YELLOW}  ⚠ $checks/$total_checks key files present${NC}"
            fi
        fi
    done
    
    exit 0
else
    echo -e "${RED}✗ Sync completed with errors${NC}"
    exit 1
fi
