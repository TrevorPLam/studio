#!/usr/bin/env python3
"""
Archive Completed Tasks

Archives completed tasks from priority TODO files and promotes tasks from backlog.
Moves completed tasks to archive and updates priority files.

Usage:
    python3 .repo/automation/scripts/archive-task.py \
        --task-id <TASK-ID> \
        --status completed \
        [--promote-from P3] \
        [--dry-run]

Exit codes:
    0 - Success
    1 - Error
"""

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple


def find_task_in_file(file_path: Path, task_id: str) -> Optional[Tuple[int, str]]:
    """Find task in file and return line number and content."""
    try:
        content = file_path.read_text(encoding="utf-8")
        lines = content.split("\n")
        
        for i, line in enumerate(lines):
            if task_id in line and ("- [" in line or "##" in line):
                return (i, line)
        
        return None
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None


def mark_task_completed(file_path: Path, task_id: str, dry_run: bool = False) -> bool:
    """Mark task as completed in TODO file."""
    try:
        content = file_path.read_text(encoding="utf-8")
        lines = content.split("\n")
        
        # Find and update task
        updated = False
        for i, line in enumerate(lines):
            if task_id in line and "- [" in line:
                # Mark as completed: - [ ] -> - [x]
                if "- [ ]" in line:
                    lines[i] = line.replace("- [ ]", "- [x]")
                    updated = True
                elif "- [x]" in line:
                    # Already completed
                    updated = True
                    break
        
        if updated and not dry_run:
            file_path.write_text("\n".join(lines), encoding="utf-8")
            print(f"✅ Marked {task_id} as completed in {file_path}")
        elif updated:
            print(f"DRY RUN: Would mark {task_id} as completed in {file_path}")
        
        return updated
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False


def archive_task(task_id: str, task_content: str, archive_dir: Path, dry_run: bool = False) -> bool:
    """Archive task to archive directory."""
    try:
        archive_dir.mkdir(parents=True, exist_ok=True)
        
        # Create archive file with date
        today = datetime.now().strftime("%Y-%m-%d")
        archive_file = archive_dir / f"TODO_ARCHIVE_{today}.md"
        
        # Append to archive file
        archive_content = f"\n## {task_id} - Archived {today}\n\n{task_content}\n\n---\n\n"
        
        if not dry_run:
            if archive_file.exists():
                archive_content = archive_file.read_text(encoding="utf-8") + archive_content
            archive_file.write_text(archive_content, encoding="utf-8")
            print(f"✅ Archived {task_id} to {archive_file}")
        else:
            print(f"DRY RUN: Would archive {task_id} to {archive_file}")
        
        return True
        
    except Exception as e:
        print(f"Error archiving task: {e}")
        return False


def promote_task(from_priority: str, to_priority: str, task_id: str, dry_run: bool = False) -> bool:
    """Promote task from lower priority to higher priority."""
    repo_root = Path(__file__).parent.parent.parent.parent
    
    from_file = repo_root / f"P{from_priority[-1]}TODO.md" if from_priority.startswith("P") else repo_root / f"{from_priority}TODO.md"
    to_file = repo_root / f"P{to_priority[-1]}TODO.md" if to_priority.startswith("P") else repo_root / f"{to_priority}TODO.md"
    
    if not from_file.exists():
        print(f"Error: Source file not found: {from_file}")
        return False
    
    if not to_file.exists():
        print(f"Error: Target file not found: {to_file}")
        return False
    
    try:
        # Read source file
        from_content = from_file.read_text(encoding="utf-8")
        lines = from_content.split("\n")
        
        # Find task and extract content
        task_lines = []
        task_start = None
        for i, line in enumerate(lines):
            if task_id in line and ("- [" in line or "##" in line):
                task_start = i
                task_lines.append(line)
                # Collect task content until next task or section
                j = i + 1
                while j < len(lines) and not (lines[j].startswith("- [") or lines[j].startswith("##")):
                    task_lines.append(lines[j])
                    j += 1
                break
        
        if not task_lines:
            print(f"Error: Task {task_id} not found in {from_file}")
            return False
        
        task_content = "\n".join(task_lines)
        
        # Remove from source file
        if not dry_run:
            new_lines = lines[:task_start] + lines[task_start + len(task_lines):]
            from_file.write_text("\n".join(new_lines), encoding="utf-8")
            print(f"✅ Removed {task_id} from {from_file}")
        
        # Add to target file
        if not dry_run:
            to_content = to_file.read_text(encoding="utf-8")
            # Append to end of file
            to_content += f"\n{task_content}\n"
            to_file.write_text(to_content, encoding="utf-8")
            print(f"✅ Added {task_id} to {to_file}")
        else:
            print(f"DRY RUN: Would move {task_id} from {from_file} to {to_file}")
        
        return True
        
    except Exception as e:
        print(f"Error promoting task: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Archive completed tasks and promote from backlog")
    parser.add_argument("--task-id", type=str, required=True, help="Task ID (e.g., T-001)")
    parser.add_argument("--status", type=str, choices=["completed", "archived"], default="completed", help="Task status")
    parser.add_argument("--promote-from", type=str, help="Promote task from priority (e.g., P3)")
    parser.add_argument("--promote-to", type=str, default="P0", help="Promote task to priority (default: P0)")
    parser.add_argument("--archive-dir", type=str, default=".repo/archive/tasks", help="Archive directory")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode (no file changes)")
    
    args = parser.parse_args()
    
    repo_root = Path(__file__).parent.parent.parent.parent
    
    # Find task in TODO files
    todo_files = [
        repo_root / "P0TODO.md",
        repo_root / "P1TODO.md",
        repo_root / "P2TODO.md",
        repo_root / "P3TODO.md",
        repo_root / "TODO.md"
    ]
    
    task_found = False
    task_file = None
    task_content = None
    
    for todo_file in todo_files:
        if not todo_file.exists():
            continue
        
        result = find_task_in_file(todo_file, args.task_id)
        if result:
            task_found = True
            task_file = todo_file
            # Read full task content
            content = todo_file.read_text(encoding="utf-8")
            lines = content.split("\n")
            task_start = result[0]
            task_lines = [lines[task_start]]
            # Collect until next task
            for i in range(task_start + 1, len(lines)):
                if lines[i].startswith("- [") or (lines[i].startswith("##") and i > task_start + 1):
                    break
                task_lines.append(lines[i])
            task_content = "\n".join(task_lines)
            break
    
    if not task_found:
        print(f"Error: Task {args.task_id} not found in TODO files")
        sys.exit(1)
    
    # Handle promotion
    if args.promote_from:
        success = promote_task(args.promote_from, args.promote_to, args.task_id, args.dry_run)
        if not success:
            sys.exit(1)
        sys.exit(0)
    
    # Handle archiving
    if args.status == "completed":
        # Mark as completed
        success = mark_task_completed(task_file, args.task_id, args.dry_run)
        if not success:
            print(f"Warning: Could not mark {args.task_id} as completed")
    
    # Archive task
    archive_dir = repo_root / args.archive_dir
    success = archive_task(args.task_id, task_content, archive_dir, args.dry_run)
    
    if not success:
        sys.exit(1)
    
    sys.exit(0)


if __name__ == "__main__":
    main()
