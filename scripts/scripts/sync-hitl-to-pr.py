#!/usr/bin/env python3
"""
Sync HITL Status to PR Description

Syncs HITL item status from .repo/policy/HITL.md to PR description.
Reads HITL index table and updates PR body with current status.

Usage:
    python3 .repo/automation/scripts/sync-hitl-to-pr.py \
        --pr-number <number> \
        --hitl-file .repo/policy/HITL.md \
        [--github-token <token>] \
        [--dry-run]

Exit codes:
    0 - Success
    1 - Error
"""

import argparse
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional

try:
    import requests
except ImportError:
    print("Error: requests library required. Install with: pip install requests")
    sys.exit(1)


def parse_hitl_table(content: str, table_name: str = "Active") -> List[Dict[str, str]]:
    """Parse HITL items from markdown table."""
    items = []
    
    # Find the table section
    pattern = rf"### {table_name}\s*\n\|[^\n]+\n\|[^\n]+\n((?:\|[^\n]+\n?)+)"
    match = re.search(pattern, content, re.MULTILINE)
    
    if not match:
        return items
    
    # Parse table rows
    rows = match.group(1).strip().split("\n")
    for row in rows:
        if not row.strip().startswith("|"):
            continue
        
        cells = [cell.strip() for cell in row.split("|")[1:-1]]  # Remove empty first/last
        if len(cells) >= 4:
            items.append({
                "id": cells[0],
                "category": cells[1],
                "status": cells[2],
                "summary": cells[3],
                "filepath": cells[4] if len(cells) > 4 else ""
            })
    
    return items


def format_hitl_section(items: List[Dict[str, str]]) -> str:
    """Format HITL items as markdown section for PR description."""
    if not items:
        return "## HITL Items\n\nNo active HITL items.\n"
    
    lines = ["## HITL Items\n"]
    lines.append("| ID | Category | Status | Summary |")
    lines.append("|---|---|---|---|")
    
    for item in items:
        status_emoji = {
            "Pending": "⏳",
            "In Progress": "🔄",
            "Blocked": "🚫",
            "Completed": "✅",
            "Superseded": "↩️"
        }.get(item["status"], "❓")
        
        lines.append(
            f"| {item['id']} | {item['category']} | {status_emoji} {item['status']} | {item['summary']} |"
        )
    
    return "\n".join(lines)


def update_pr_description(
    pr_number: int,
    hitl_section: str,
    github_token: Optional[str] = None,
    repo_owner: str = "",
    repo_name: str = "",
    dry_run: bool = False
) -> bool:
    """Update PR description with HITL section."""
    
    if dry_run:
        print("DRY RUN: Would update PR description with:")
        print(hitl_section)
        return True
    
    if not github_token:
        print("Error: GitHub token required for PR updates")
        return False
    
    # Get current PR body
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    pr_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/pulls/{pr_number}"
    
    try:
        response = requests.get(pr_url, headers=headers)
        response.raise_for_status()
        pr_data = response.json()
        current_body = pr_data.get("body", "")
        
        # Replace or add HITL section
        hitl_pattern = r"## HITL Items\n.*?(?=\n## |$)"
        if re.search(hitl_pattern, current_body, re.DOTALL):
            new_body = re.sub(hitl_pattern, hitl_section, current_body, flags=re.DOTALL)
        else:
            new_body = current_body + "\n\n" + hitl_section if current_body else hitl_section
        
        # Update PR
        update_response = requests.patch(
            pr_url,
            headers=headers,
            json={"body": new_body}
        )
        update_response.raise_for_status()
        
        print(f"✅ Updated PR #{pr_number} with HITL status")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"Error updating PR: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Sync HITL status to PR description")
    parser.add_argument("--pr-number", type=int, help="PR number (auto-detected from CI if not provided)")
    parser.add_argument("--hitl-file", type=str, default=".repo/policy/HITL.md", help="Path to HITL index file")
    parser.add_argument("--github-token", type=str, help="GitHub token for API access (auto-detected from GITHUB_TOKEN env var)")
    parser.add_argument("--repo-owner", type=str, default="", help="Repository owner (auto-detected from GITHUB_REPOSITORY)")
    parser.add_argument("--repo-name", type=str, default="", help="Repository name (auto-detected from GITHUB_REPOSITORY)")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode (no API calls)")
    
    args = parser.parse_args()
    
    # Auto-detect GitHub environment variables (provided in CI)
    import os
    github_token = args.github_token or os.environ.get("GITHUB_TOKEN")
    github_repository = os.environ.get("GITHUB_REPOSITORY", "")
    
    # Auto-detect PR number from CI environment
    pr_number = args.pr_number
    if not pr_number:
        pr_number_str = os.environ.get("GITHUB_EVENT_PATH")
        if pr_number_str and os.path.exists(pr_number_str):
            import json
            try:
                with open(pr_number_str, 'r') as f:
                    event_data = json.load(f)
                    pr_number = event_data.get("pull_request", {}).get("number")
            except Exception:
                pass
    
    # Parse GITHUB_REPOSITORY (format: owner/repo)
    if github_repository and not args.repo_owner:
        parts = github_repository.split("/")
        if len(parts) == 2:
            args.repo_owner = parts[0]
            args.repo_name = parts[1]
    
    # Validate required arguments
    if not pr_number and not args.dry_run:
        print("Error: PR number required. Provide --pr-number or run in CI environment.")
        sys.exit(1)
    
    if not github_token and not args.dry_run:
        print("Warning: GitHub token not found. Cannot update PR. Use --dry-run to see what would be synced.")
        args.dry_run = True
    
    # Read HITL file
    hitl_path = Path(args.hitl_file)
    if not hitl_path.exists():
        print(f"Error: HITL file not found: {hitl_path}")
        sys.exit(1)
    
    content = hitl_path.read_text(encoding="utf-8")
    
    # Parse active HITL items
    active_items = parse_hitl_table(content, "Active")
    
    # Format HITL section
    hitl_section = format_hitl_section(active_items)
    
    # Update PR if not dry run
    if not args.dry_run and github_token and pr_number:
        # Try to detect repo from git if not provided
        if not args.repo_owner or not args.repo_name:
            import subprocess
            try:
                remote_url = subprocess.check_output(
                    ["git", "config", "--get", "remote.origin.url"],
                    text=True
                ).strip()
                # Parse git@github.com:owner/repo.git or https://github.com/owner/repo.git
                match = re.search(r"github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$", remote_url)
                if match:
                    repo_owner = args.repo_owner or match.group(1)
                    repo_name = args.repo_name or match.group(2).replace(".git", "")
                else:
                    print("Error: Could not detect repository from git remote")
                    sys.exit(1)
            except subprocess.CalledProcessError:
                print("Error: Could not detect repository. Provide --repo-owner and --repo-name")
                sys.exit(1)
        else:
            repo_owner = args.repo_owner
            repo_name = args.repo_name
        
        success = update_pr_description(
            pr_number,
            hitl_section,
            github_token,
            repo_owner,
            repo_name,
            args.dry_run
        )
        
        if not success:
            sys.exit(1)
    else:
        if args.dry_run:
            print("DRY RUN: HITL Section to sync:")
        else:
            print("HITL Section to sync:")
        print(hitl_section)
    
    sys.exit(0)


if __name__ == "__main__":
    main()
