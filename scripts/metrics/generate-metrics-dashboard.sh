#!/usr/bin/env bash
# filepath: scripts/metrics/generate-metrics-dashboard.sh
# purpose: Generate a dashboard view of workflow performance across repositories.
# last updated: 2026-01-30
# related tasks: Workflow performance metrics tracking

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPOS=("c:/dev/OS" "c:/dev/aios" "c:/dev/studio" "c:/dev/firm-template")
METRICS_DIR="agents/metrics"
DASHBOARD_FILE="$METRICS_DIR/dashboard.html"

echo -e "${BLUE}==> Generating Metrics Dashboard${NC}"

# Function to get repo metrics
get_repo_metrics() {
    local repo_path="$1"
    local repo_name
    repo_name=$(basename "$repo_path")
    
    if [[ ! -d "$repo_path" ]]; then
        echo "Repository $repo_name not found"
        return 1
    fi
    
    cd "$repo_path"
    
    if [[ -f "$METRICS_DIR/workflow-performance.json" ]]; then
        # Get latest metrics
        local latest_metrics
        latest_metrics=$(tail -n 1 "$METRICS_DIR/workflow-performance.json" 2>/dev/null || echo "{}")
        
        echo "$repo_name:$latest_metrics"
    else
        echo "$repo_name:{}"
    fi
    
    cd - > /dev/null
}

# Function to calculate health score
calculate_health_score() {
    local metrics="$1"
    
    # Extract key metrics
    local completion_rate
    completion_rate=$(echo "$metrics" | grep -o '"completion_rate": [0-9.]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
    
    local blocked_tasks
    blocked_tasks=$(echo "$metrics" | grep -o '"blocked": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
    
    local total_tasks
    total_tasks=$(echo "$metrics" | grep -o '"total": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "1")
    
    local pending_hitl
    pending_hitl=$(echo "$metrics" | grep -o '"pending": [0-9]*' | head -1 | cut -d':' -f2 | tr -d ' ' || echo "0")
    
    # Calculate health score (0-100)
    local score=100
    
    # Penalize low completion rate
    score=$(echo "scale=0; $score - ((100 - $completion_rate) * 0.5)" | bc)
    
    # Penalize blocked tasks
    if [[ $total_tasks -gt 0 ]]; then
        local blocked_ratio
        blocked_ratio=$(echo "scale=2; ($blocked_tasks / $total_tasks) * 100" | bc)
        score=$(echo "scale=0; $score - ($blocked_ratio * 0.3)" | bc)
    fi
    
    # Penalize pending HITL items
    score=$(echo "scale=0; $score - ($pending_hitl * 2)" | bc)
    
    # Ensure score is within bounds
    if [[ $score -lt 0 ]]; then
        score=0
    elif [[ $score -gt 100 ]]; then
        score=100
    fi
    
    echo "$score"
}

# Function to get health status
get_health_status() {
    local score="$1"
    
    if [[ $score -ge 80 ]]; then
        echo "Excellent"
    elif [[ $score -ge 60 ]]; then
        echo "Good"
    elif [[ $score -ge 40 ]]; then
        echo "Fair"
    else
        echo "Poor"
    fi
}

# Function to get health color
get_health_color() {
    local score="$1"
    
    if [[ $score -ge 80 ]]; then
        echo "#28a745"  # Green
    elif [[ $score -ge 60 ]]; then
        echo "#ffc107"  # Yellow
    elif [[ $score -ge 40 ]]; then
        echo "#fd7e14"  # Orange
    else
        echo "#dc3545"  # Red
    fi
}

# Generate HTML dashboard
generate_html_dashboard() {
    local html_content
    html_content=$(cat << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Performance Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .repo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .repo-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .repo-name {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .health-score {
            font-size: 2em;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
        }
        .health-status {
            text-align: center;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .metric {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .metric-label {
            font-size: 0.8em;
            color: #6c757d;
        }
        .metric-value {
            font-size: 1.2em;
            font-weight: bold;
        }
        .summary {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .timestamp {
            text-align: center;
            color: #6c757d;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>Workflow Performance Dashboard</h1>
            <p>Real-time metrics across all repositories</p>
        </div>
        
        <div class="repo-grid">
EOF
)

    # Add repository cards
    for repo_path in "${REPOS[@]}"; do
        if [[ -d "$repo_path" ]]; then
            local repo_name
            repo_name=$(basename "$repo_path")
            
            cd "$repo_path"
            
            local metrics="{}"
            if [[ -f "$METRICS_DIR/workflow-performance.json" ]]; then
                metrics=$(tail -n 1 "$METRICS_DIR/workflow-performance.json" 2>/dev/null || echo "{}")
            fi
            
            local health_score
            health_score=$(calculate_health_score "$metrics")
            
            local health_status
            health_status=$(get_health_status "$health_score")
            
            local health_color
            health_color=$(get_health_color "$health_score")
            
            # Extract metrics for display
            local total_tasks
            total_tasks=$(echo "$metrics" | grep -o '"total": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
            
            local completion_rate
            completion_rate=$(echo "$metrics" | grep -o '"completion_rate": [0-9.]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
            
            local blocked_tasks
            blocked_tasks=$(echo "$metrics" | grep -o '"blocked": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
            
            local pending_hitl
            pending_hitl=$(echo "$metrics" | grep -o '"pending": [0-9]*' | head -1 | cut -d':' -f2 | tr -d ' ' || echo "0")
            
            local p0_tasks
            p0_tasks=$(echo "$metrics" | grep -o '"p0": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
            
            # Add repository card to HTML
            html_content+=$(cat << EOF
            <div class="repo-card">
                <div class="repo-name">$repo_name</div>
                <div class="health-score" style="color: $health_color">$health_score</div>
                <div class="health-status" style="color: $health_color">$health_status</div>
                <div class="metrics-grid">
                    <div class="metric">
                        <div class="metric-label">Total Tasks</div>
                        <div class="metric-value">$total_tasks</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Completion Rate</div>
                        <div class="metric-value">${completion_rate}%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Blocked Tasks</div>
                        <div class="metric-value">$blocked_tasks</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Pending HITL</div>
                        <div class="metric-value">$pending_hitl</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Critical Tasks</div>
                        <div class="metric-value">$p0_tasks</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Age (days)</div>
                        <div class="metric-value">$(echo "$metrics" | grep -o '"age_days": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")</div>
                    </div>
                </div>
            </div>
EOF
)
            
            cd - > /dev/null
        fi
    done
    
    # Add summary section
    html_content+=$(cat << 'EOF'
        </div>
        
        <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
EOF
)

    # Calculate overall metrics
    local total_repos=0
    local total_tasks_all=0
    local total_blocked_all=0
    local total_hitl_all=0
    local total_p0_all=0
    local avg_completion_rate=0
    
    for repo_path in "${REPOS[@]}"; do
        if [[ -d "$repo_path" ]]; then
            cd "$repo_path"
            
            if [[ -f "$METRICS_DIR/workflow-performance.json" ]]; then
                local metrics
                metrics=$(tail -n 1 "$METRICS_DIR/workflow-performance.json" 2>/dev/null || echo "{}")
                
                local total_tasks
                total_tasks=$(echo "$metrics" | grep -o '"total": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
                
                local completion_rate
                completion_rate=$(echo "$metrics" | grep -o '"completion_rate": [0-9.]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
                
                local blocked_tasks
                blocked_tasks=$(echo "$metrics" | grep -o '"blocked": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
                
                local pending_hitl
                pending_hitl=$(echo "$metrics" | grep -o '"pending": [0-9]*' | head -1 | cut -d':' -f2 | tr -d ' ' || echo "0")
                
                local p0_tasks
                p0_tasks=$(echo "$metrics" | grep -o '"p0": [0-9]*' | cut -d':' -f2 | tr -d ' ' || echo "0")
                
                total_tasks_all=$((total_tasks_all + total_tasks))
                total_blocked_all=$((total_blocked_all + blocked_tasks))
                total_hitl_all=$((total_hitl_all + pending_hitl))
                total_p0_all=$((total_p0_all + p0_tasks))
                avg_completion_rate=$(echo "scale=2; $avg_completion_rate + $completion_rate" | bc)
                
                ((total_repos++))
            fi
            
            cd - > /dev/null
        fi
    done
    
    if [[ $total_repos -gt 0 ]]; then
        avg_completion_rate=$(echo "scale=2; $avg_completion_rate / $total_repos" | bc)
    fi
    
    html_content+=$(cat << EOF
                <div class="metric">
                    <div class="metric-label">Total Repositories</div>
                    <div class="metric-value">$total_repos</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Tasks</div>
                    <div class="metric-value">$total_tasks_all</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Blocked</div>
                    <div class="metric-value">$total_blocked_all</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total HITL</div>
                    <div class="metric-value">$total_hitl_all</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Critical Tasks</div>
                    <div class="metric-value">$total_p0_all</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Avg Completion</div>
                    <div class="metric-value">${avg_completion_rate}%</div>
                </div>
            </div>
        </div>
        
        <div class="timestamp">
            Last updated: $(date)
        </div>
    </div>
</body>
</html>
EOF
)

    echo "$html_content" > "$DASHBOARD_FILE"
    echo -e "${GREEN}✓ Dashboard generated: $DASHBOARD_FILE${NC}"
}

# Main execution
generate_html_dashboard

echo -e "${BLUE}=== Dashboard Summary ===${NC}"
echo "Dashboard saved to: $DASHBOARD_FILE"
echo "Open in browser to view interactive dashboard"
echo
echo "Repository Health Scores:"
for repo_path in "${REPOS[@]}"; do
    if [[ -d "$repo_path" ]]; then
        cd "$repo_path"
        
        if [[ -f "$METRICS_DIR/workflow-performance.json" ]]; then
            local metrics
            metrics=$(tail -n 1 "$METRICS_DIR/workflow-performance.json" 2>/dev/null || echo "{}")
            
            local health_score
            health_score=$(calculate_health_score "$metrics")
            
            local health_status
            health_status=$(get_health_status "$health_score")
            
            local repo_name
            repo_name=$(basename "$repo_path")
            
            echo "  $repo_name: $health_score ($health_status)"
        fi
        
        cd - > /dev/null
    fi
done
