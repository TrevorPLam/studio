#!/usr/bin/env python3
"""
Promote Task from Backlog to TODO

Moves a task from BACKLOG.md to TODO.md and validates format.

Usage:
    python3 .repo/automation/scripts/promote-task.py \
        --task-id <TASK-ID> \
        [--validate-only] \
        [--dry-run]

Exit codes:
    0 - Success
    1 - Error
"""

import argparse
import re
import sys
from pathlib import Path
from typing import Optional, Tuple


def find_task_in_file(file_path: Path, task_id: str) -> Optional[Tuple[int, List[str]]]:
    """Find task in file and return line number and content lines."""
    try:
        content = file_path.read_text(encoding="utf-8")
        lines = content.split("\n")

        for i, line in enumerate(lines):
            if task_id in line and ("####" in line or "###" in line):
                # Collect task content until next task
                task_lines = [lines[i]]
                j = i + 1
                while j < len(lines) and not (lines[j].startswith("####") or lines[j].startswith("###") or (lines[j].startswith("- [") and "TASK-" in lines[j])):
                    task_lines.append(lines[j])
                    j += 1
                return (i, task_lines)

        return None
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None


def validate_task_format(task_lines: List[str]) -> Tuple[bool, List[str]]:
    """Validate task format against required fields."""
    errors = []
    content = "\n".join(task_lines)

    # Check for required fields
    required_fields = [
        (r"\[TASK-\d+\]", "Task ID"),
        (r"\*\*Priority\*\*:\s*(P0|P1|P2|P3)", "Priority"),
        (r"\*\*Status\*\*:", "Status"),
    ]

    for pattern, name in required_fields:
        if not re.search(pattern, content, re.IGNORECASE):
            errors.append(f"Missing required field: {name}")

    # Check for acceptance criteria
    if not re.search(r"Acceptance Criteria", content, re.IGNORECASE):
        errors.append("Missing 'Acceptance Criteria' section")

    return len(errors) == 0, errors


def remove_task_from_file(file_path: Path, task_start: int, task_lines: List[str], dry_run: bool = False) -> bool:
    """Remove task from file."""
    try:
        content = file_path.read_text(encoding="utf-8")
        lines = content.split("\n")

        # Remove task lines
        new_lines = lines[:task_start] + lines[task_start + len(task_lines):]

        if not dry_run:
            file_path.write_text("\n".join(new_lines), encoding="utf-8")
            print(f"✅ Removed {task_lines[0].strip()} from {file_path.name}")
        else:
            print(f"DRY RUN: Would remove task from {file_path.name}")

        return True
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False


def add_task_to_file(file_path: Path, task_lines: List[str], dry_run: bool = False) -> bool:
    """Add task to file."""
    try:
        if file_path.exists():
            content = file_path.read_text(encoding="utf-8")
            # Add task before any existing tasks or at the end
            if "## Active Tasks" in content:
                # Insert after "## Active Tasks" section
                lines = content.split("\n")
                insert_pos = next((i for i, line in enumerate(lines) if line.strip() == "## Active Tasks"), len(lines))
                # Find the end of the active tasks section (before "## Task Format Template")
                for i in range(insert_pos + 1, len(lines)):
                    if lines[i].startswith("## Task Format Template") or lines[i].startswith("---"):
                        insert_pos = i
                        break
                new_lines = lines[:insert_pos] + [""] + task_lines + [""] + lines[insert_pos:]
                new_content = "\n".join(new_lines)
            else:
                new_content = content + "\n\n" + "\n".join(task_lines)
        else:
            new_content = "## Active Tasks\n\n" + "\n".join(task_lines)

        if not dry_run:
            file_path.write_text(new_content, encoding="utf-8")
            print(f"✅ Added task to {file_path.name}")
        else:
            print(f"DRY RUN: Would add task to {file_path.name}")

        return True
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Promote task from backlog to TODO")
    parser.add_argument("--task-id", type=str, required=True, help="Task ID (e.g., TASK-071)")
    parser.add_argument("--backlog-file", type=str, default=".repo/tasks/BACKLOG.md", help="Backlog file path")
    parser.add_argument("--todo-file", type=str, default=".repo/tasks/TODO.md", help="TODO file path")
    parser.add_argument("--validate-only", action="store_true", help="Only validate, don't promote")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode (no file changes)")

    args = parser.parse_args()

    repo_root = Path(__file__).parent.parent.parent.parent
    backlog_path = repo_root / args.backlog_file
    todo_path = repo_root / args.todo_file

    # Find task in backlog
    if not backlog_path.exists():
        print(f"Error: Backlog file not found: {backlog_path}")
        sys.exit(1)

    task_result = find_task_in_file(backlog_path, args.task_id)
    if not task_result:
        print(f"Error: Task {args.task_id} not found in {backlog_path}")
        sys.exit(1)

    task_start, task_lines = task_result

    # Validate task format
    is_valid, errors = validate_task_format(task_lines)
    if not is_valid:
        print(f"❌ Task format validation failed:")
        for error in errors:
            print(f"   - {error}")
        sys.exit(1)

    print(f"✅ Task format is valid")

    if args.validate_only:
        print("Validation only - not promoting")
        sys.exit(0)

    # Check if TODO already has 5 tasks (max allowed)
    if todo_path.exists():
        todo_content = todo_path.read_text(encoding="utf-8")
        task_count = todo_content.count("TASK-")
        if task_count >= 5:
            print(f"⚠️  TODO.md already contains {task_count} tasks. Maximum is 5 tasks.")
            response = input("Continue anyway? (y/N): ")
            if response.lower() != "y":
                print("Cancelled")
                sys.exit(0)

    # Promote task
    if remove_task_from_file(backlog_path, task_start, task_lines, args.dry_run):
        if add_task_to_file(todo_path, task_lines, args.dry_run):
            print(f"\n✅ Successfully promoted {args.task_id} from backlog to TODO")
            sys.exit(0)

    sys.exit(1)


if __name__ == "__main__":
    main()
