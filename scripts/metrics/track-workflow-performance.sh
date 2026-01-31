#!/usr/bin/env bash
# filepath: scripts/metrics/track-workflow-performance.sh
# purpose: Track and analyze workflow performance metrics.
# last updated: 2026-01-30
# related tasks: Workflow performance metrics tracking

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
METRICS_DIR="agents/metrics"
METRICS_FILE="$METRICS_DIR/workflow-performance.json"
TASK_FILE="agents/tasks/TODO.toon"
HITL_DIR="agents/hitl"

echo -e "${BLUE}==> Workflow Performance Metrics${NC}"

# Create metrics directory if it doesn't exist
mkdir -p "$METRICS_DIR"

# Function to get current timestamp
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Function to count tasks by status
count_tasks_by_status() {
    local status="$1"
    if [[ -f "$TASK_FILE" ]]; then
        grep ",$status," "$TASK_FILE" | wc -l || echo "0"
    else
        echo "0"
    fi
}

# Function to count tasks by priority
count_tasks_by_priority() {
    local priority="$1"
    if [[ -f "$TASK_FILE" ]]; then
        grep ",$priority," "$TASK_FILE" | wc -l || echo "0"
    else
        echo "0"
    fi
}

# Function to count HITL items by status
count_hitl_by_status() {
    local status="$1"
    local count=0
    
    if [[ -d "$HITL_DIR" ]]; then
        for file in "$HITL_DIR"/HITL-*.md; do
            if [[ -f "$file" && ! "$file" =~ -template ]]; then
                if grep -q "^**Status**:.*$status" "$file"; then
                    ((count++))
                fi
            fi
        done
    fi
    
    echo "$count"
}

# Function to calculate task completion rate
calculate_completion_rate() {
    local total_tasks
    local completed_tasks
    
    total_tasks=$(count_tasks_by_status "Completed")
    completed_tasks=$(count_tasks_by_status "Completed")
    
    if [[ $total_tasks -gt 0 ]]; then
        echo "scale=2; ($completed_tasks / $total_tasks) * 100" | bc
    else
        echo "0"
    fi
}

# Function to get repository age in days
get_repo_age() {
    local repo_root
    repo_root=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
    
    if [[ -d "$repo_root/.git" ]]; then
        local first_commit
        first_commit=$(git log --reverse --format=%ct | head -1 2>/dev/null || echo "0")
        local current_time
        current_time=$(date +%s)
        local age_days
        age_days=$(( (current_time - first_commit) / 86400 ))
        echo "$age_days"
    else
        echo "0"
    fi
}

# Function to get last verification time
get_last_verification() {
    local verify_file="scripts/verify.sh"
    
    if [[ -f "$verify_file" ]]; then
        stat -f %m "$verify_file" 2>/dev/null || stat -c %Y "$verify_file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to collect current metrics
collect_metrics() {
    local timestamp
    timestamp=$(get_timestamp)
    
    local total_tasks
    total_tasks=$(count_tasks_by_status "Not Started")
    total_tasks=$((total_tasks + $(count_tasks_by_status "In Progress")))
    total_tasks=$((total_tasks + $(count_tasks_by_status "Completed")))
    total_tasks=$((total_tasks + $(count_tasks_by_status "Blocked")))
    
    local completion_rate
    completion_rate=$(calculate_completion_rate)
    
    local repo_age
    repo_age=$(get_repo_age)
    
    local last_verification
    last_verification=$(get_last_verification)
    
    # Create JSON metrics
    cat << EOF
{
  "timestamp": "$timestamp",
  "repository": "$(basename "$(pwd)")",
  "tasks": {
    "total": $total_tasks,
    "not_started": $(count_tasks_by_status "Not Started"),
    "in_progress": $(count_tasks_by_status "In Progress"),
    "completed": $(count_tasks_by_status "Completed"),
    "blocked": $(count_tasks_by_status "Blocked"),
    "completion_rate": $completion_rate,
    "by_priority": {
      "p0": $(count_tasks_by_priority "P0"),
      "p1": $(count_tasks_by_priority "P1"),
      "p2": $(count_tasks_by_priority "P2"),
      "p3": $(count_tasks_by_priority "P3")
    }
  },
  "hitl": {
    "total": $(find "$HITL_DIR" -name "HITL-*.md" -not -name "*-template.md" 2>/dev/null | wc -l),
    "pending": $(count_hitl_by_status "Pending"),
    "approved": $(count_hitl_by_status "Approved"),
    "rejected": $(count_hitl_by_status "Rejected"),
    "resolved": $(count_hitl_by_status "Resolved")
  },
  "repository": {
    "age_days": $repo_age,
    "last_verification": $last_verification
  }
}
EOF
}

# Function to analyze trends
analyze_trends() {
    if [[ ! -f "$METRICS_FILE" ]]; then
        echo "No historical data available for trend analysis"
        return
    fi
    
    echo -e "${BLUE}=== Trend Analysis ===${NC}"
    
    # Get current and previous metrics
    local current_metrics
    current_metrics=$(collect_metrics)
    
    local previous_metrics
    previous_metrics=$(tail -n 1 "$METRICS_FILE" 2>/dev/null || echo "{}")
    
    # Extract key metrics (simplified parsing)
    local current_completion_rate
    current_completion_rate=$(echo "$current_metrics" | grep -o '"completion_rate": [0-9.]*' | cut -d':' -f2 | tr -d ' ')
    
    local previous_completion_rate
    previous_completion_rate=$(echo "$previous_metrics" | grep -o '"completion_rate": [0-9.]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
    
    local current_blocked
    current_blocked=$(echo "$current_metrics" | grep -o '"blocked": [0-9]*' | cut -d':' -f2 | tr -d ' ')
    
    local previous_blocked
    previous_blocked=$(echo "$previous_metrics" | grep -o '"blocked": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
    
    # Calculate changes
    local completion_change
    completion_change=$(echo "scale=2; $current_completion_rate - $previous_completion_rate" | bc)
    
    local blocked_change
    blocked_change=$((current_blocked - previous_blocked))
    
    # Report trends
    echo "Completion rate change: ${completion_change}%"
    echo "Blocked tasks change: $blocked_change"
    
    if (( $(echo "$completion_change > 0" | bc -l) )); then
        echo -e "${GREEN}✓ Completion rate improved${NC}"
    elif (( $(echo "$completion_change < 0" | bc -l) )); then
        echo -e "${RED}✗ Completion rate declined${NC}"
    else
        echo -e "${YELLOW}→ Completion rate unchanged${NC}"
    fi
    
    if [[ $blocked_change -lt 0 ]]; then
        echo -e "${GREEN}✓ Blocked tasks reduced${NC}"
    elif [[ $blocked_change -gt 0 ]]; then
        echo -e "${RED}✗ Blocked tasks increased${NC}"
    else
        echo -e "${YELLOW}→ Blocked tasks unchanged${NC}"
    fi
}

# Function to generate performance report
generate_report() {
    echo -e "${BLUE}=== Performance Report ===${NC}"
    
    local metrics
    metrics=$(collect_metrics)
    
    echo "Repository: $(echo "$metrics" | grep -o '"repository": "[^"]*"' | cut -d'"' -f4)"
    echo "Timestamp: $(echo "$metrics" | grep -o '"timestamp": "[^"]*"' | cut -d'"' -f4)"
    echo
    
    echo "Task Summary:"
    echo "  Total tasks: $(echo "$metrics" | grep -o '"total": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Not started: $(echo "$metrics" | grep -o '"not_started": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  In progress: $(echo "$metrics" | grep -o '"in_progress": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Completed: $(echo "$metrics" | grep -o '"completed": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Blocked: $(echo "$metrics" | grep -o '"blocked": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Completion rate: $(echo "$metrics" | grep -o '"completion_rate": [0-9.]*' | cut -d':' -f2 | tr -d ' ')%"
    echo
    
    echo "Priority Breakdown:"
    echo "  P0 (Critical): $(echo "$metrics" | grep -o '"p0": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  P1 (High): $(echo "$metrics" | grep -o '"p1": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  P2 (Medium): $(echo "$metrics" | grep -o '"p2": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  P3 (Low): $(echo "$metrics" | grep -o '"p3": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo
    
    echo "HITL Summary:"
    echo "  Total HITL items: $(echo "$metrics" | grep -o '"total": [0-9]*' | grep -v "tasks" | head -1 | cut -d':' -f2 | tr -d ' ')"
    echo "  Pending: $(echo "$metrics" | grep -o '"pending": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Approved: $(echo "$metrics" | grep -o '"approved": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Rejected: $(echo "$metrics" | grep -o '"rejected": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo "  Resolved: $(echo "$metrics" | grep -o '"resolved": [0-9]*' | cut -d':' -f2 | tr -d ' ')"
    echo
    
    echo "Repository Info:"
    echo "  Age: $(echo "$metrics" | grep -o '"age_days": [0-9]*' | cut -d':' -f2 | tr -d ' ') days"
    echo "  Last verification: $(date -r "$(echo "$metrics" | grep -o '"last_verification": [0-9]*' | cut -d':' -f2 | tr -d ' ')" 2>/dev/null || echo "Unknown")"
}

# Main execution
case "${1:-collect}" in
    "collect")
        echo "Collecting metrics..."
        collect_metrics >> "$METRICS_FILE"
        echo "Metrics saved to $METRICS_FILE"
        ;;
    "report")
        generate_report
        ;;
    "trends")
        analyze_trends
        ;;
    "full")
        echo "Collecting metrics..."
        collect_metrics >> "$METRICS_FILE"
        echo
        generate_report
        echo
        analyze_trends
        ;;
    *)
        echo "Usage: $0 {collect|report|trends|full}"
        echo "  collect - Save current metrics"
        echo "  report  - Generate performance report"
        echo "  trends  - Analyze trends from historical data"
        echo "  full    - Collect, report, and analyze"
        exit 1
        ;;
esac
