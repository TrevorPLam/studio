#!/usr/bin/env python3
"""
Waiver Management Script

Creates, validates, and tracks waivers for policy exceptions.

Usage:
    # Create a new waiver
    python3 .repo/automation/scripts/manage-waivers.py create \
        --waives <policy> \
        --why <justification> \
        --scope <scope> \
        --owner <owner> \
        --expiration <YYYY-MM-DD> \
        [--remediation-plan <plan>] \
        [--link <pr-or-issue>]
    
    # Check for expired waivers
    python3 .repo/automation/scripts/manage-waivers.py check-expired
    
    # List active waivers
    python3 .repo/automation/scripts/manage-waivers.py list

Exit codes:
    0 - Success
    1 - Error
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


def get_waiver_id(waivers_dir: Path) -> str:
    """Get the next available waiver ID."""
    if not waivers_dir.exists():
        return "WAIVER-0001"
    
    waiver_files = list(waivers_dir.glob("WAIVER-*.md"))
    if not waiver_files:
        return "WAIVER-0001"
    
    # Extract numbers from filenames
    ids = []
    for f in waiver_files:
        match = re.search(r"WAIVER-(\d+)", f.name)
        if match:
            ids.append(int(match.group(1)))
    
    if not ids:
        return "WAIVER-0001"
    
    max_num = max(ids)
    return f"WAIVER-{max_num + 1:04d}"


def create_waiver(
    waiver_id: str,
    waives: str,
    why: str,
    scope: str,
    owner: str,
    expiration: str,
    remediation_plan: Optional[str] = None,
    link: Optional[str] = None
) -> str:
    """Create waiver content from template."""
    
    remediation_section = f"\n**Remediation Plan**: {remediation_plan}\n" if remediation_plan else ""
    link_section = f"\n**Link**: {link}\n" if link else ""
    
    content = f"""# Waiver: {waives}

**Waiver ID**: {waiver_id}  
**Waives**: {waives}  
**Why**: {why}  
**Scope**: {scope}  
**Owner**: {owner}  
**Expiration**: {expiration}  
{remediation_section}{link_section}
**Notes**: Auto-generated waiver allowed for gate failures only.

## Details

**Policy Being Waived**: {waives}

**Justification**: {why}

**Scope of Exception**: {scope}

**Remediation**: {remediation_plan or "To be determined"}

**Expiration Date**: {expiration}

**Status**: Active
"""
    return content


def check_expired_waivers(waivers_dir: Path) -> List[Dict]:
    """Check for expired waivers."""
    if not waivers_dir.exists():
        return []
    
    expired = []
    today = datetime.now().date()
    
    for waiver_file in waivers_dir.glob("WAIVER-*.md"):
        content = waiver_file.read_text(encoding="utf-8")
        
        # Extract expiration date
        match = re.search(r"\*\*Expiration\*\*:\s*(\d{4}-\d{2}-\d{2})", content)
        if match:
            exp_date = datetime.strptime(match.group(1), "%Y-%m-%d").date()
            if exp_date < today:
                expired.append({
                    "file": waiver_file.name,
                    "expiration": match.group(1),
                    "content": content
                })
    
    return expired


def list_active_waivers(waivers_dir: Path) -> List[Dict]:
    """List all active (non-expired) waivers."""
    if not waivers_dir.exists():
        return []
    
    active = []
    today = datetime.now().date()
    
    for waiver_file in waivers_dir.glob("WAIVER-*.md"):
        content = waiver_file.read_text(encoding="utf-8")
        
        # Extract expiration date
        match = re.search(r"\*\*Expiration\*\*:\s*(\d{4}-\d{2}-\d{2})", content)
        if match:
            exp_date = datetime.strptime(match.group(1), "%Y-%m-%d").date()
            if exp_date >= today:
                # Extract key info
                waives_match = re.search(r"\*\*Waives\*\*:\s*(.+)", content)
                owner_match = re.search(r"\*\*Owner\*\*:\s*(.+)", content)
                
                active.append({
                    "file": waiver_file.name,
                    "waives": waives_match.group(1) if waives_match else "Unknown",
                    "owner": owner_match.group(1) if owner_match else "Unknown",
                    "expiration": match.group(1)
                })
    
    return active


def main():
    parser = argparse.ArgumentParser(description="Manage waivers")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Create command
    create_parser = subparsers.add_parser("create", help="Create a new waiver")
    create_parser.add_argument("--waives", type=str, required=True, help="Policy being waived")
    create_parser.add_argument("--why", type=str, required=True, help="Justification")
    create_parser.add_argument("--scope", type=str, required=True, help="Scope of exception")
    create_parser.add_argument("--owner", type=str, required=True, help="Owner name")
    create_parser.add_argument("--expiration", type=str, required=True, help="Expiration date (YYYY-MM-DD)")
    create_parser.add_argument("--remediation-plan", type=str, help="Remediation plan")
    create_parser.add_argument("--link", type=str, help="Link to PR or issue")
    create_parser.add_argument("--waivers-dir", type=str, default=".repo/waivers", help="Waivers directory")
    create_parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    
    # Check expired command
    check_parser = subparsers.add_parser("check-expired", help="Check for expired waivers")
    check_parser.add_argument("--waivers-dir", type=str, default=".repo/waivers", help="Waivers directory")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List active waivers")
    list_parser.add_argument("--waivers-dir", type=str, default=".repo/waivers", help="Waivers directory")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    repo_root = Path(__file__).parent.parent.parent.parent
    waivers_dir = repo_root / args.waivers_dir
    
    if args.command == "create":
        waiver_id = get_waiver_id(waivers_dir)
        waiver_content = create_waiver(
            waiver_id,
            args.waives,
            args.why,
            args.scope,
            args.owner,
            args.expiration,
            args.remediation_plan,
            args.link
        )
        
        waiver_file = waivers_dir / f"{waiver_id}.md"
        
        if not args.dry_run:
            waivers_dir.mkdir(parents=True, exist_ok=True)
            waiver_file.write_text(waiver_content, encoding="utf-8")
            print(f"✅ Created waiver: {waiver_file}")
        else:
            print("DRY RUN: Would create waiver:")
            print(f"  ID: {waiver_id}")
            print(f"  File: {waiver_file}")
            print("\nContent:")
            print(waiver_content)
        
        print(f"\nWaiver ID: {waiver_id}")
        
    elif args.command == "check-expired":
        expired = check_expired_waivers(waivers_dir)
        if expired:
            print(f"⚠️  Found {len(expired)} expired waiver(s):\n")
            for w in expired:
                print(f"  - {w['file']} (expired: {w['expiration']})")
            sys.exit(1)
        else:
            print("✅ No expired waivers found")
    
    elif args.command == "list":
        active = list_active_waivers(waivers_dir)
        if active:
            print(f"Active waivers ({len(active)}):\n")
            for w in active:
                print(f"  - {w['file']}")
                print(f"    Waives: {w['waives']}")
                print(f"    Owner: {w['owner']}")
                print(f"    Expires: {w['expiration']}\n")
        else:
            print("No active waivers")
    
    sys.exit(0)


if __name__ == "__main__":
    main()
