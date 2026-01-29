#!/usr/bin/env python3

import datetime
import os
import sys
from typing import List, Tuple

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    ".turbo",
    "dist",
    "build",
    "out",
    "coverage",
    ".next",
    ".cache",
}


def should_skip_dir(name: str) -> bool:
    return name in EXCLUDE_DIRS


def rel_join(root: str, name: str) -> str:
    if root == ".":
        return name
    return os.path.join(root, name)


def collect_entries(target_dir: str) -> List[Tuple[str, str]]:
    entries: List[Tuple[str, str]] = []
    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]
        rel_root = os.path.relpath(root, target_dir)
        for d in dirs:
            entries.append((rel_join(rel_root, d), "dir"))
        for f in files:
            if f == "INDEX.toon":
                continue
            entries.append((rel_join(rel_root, f), "file"))
    entries = [(p, t) for p, t in entries if p != "."]
    entries.sort(key=lambda item: item[0])
    return entries


def write_index(base_dir: str, target_dir: str) -> None:
    timestamp = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    rel_root = os.path.relpath(target_dir, base_dir)
    entries = collect_entries(target_dir)

    lines: List[str] = [
        "# INDEX.toon",
        "",
        "meta{root, generated_at}:",
        f"{rel_root}, {timestamp}",
        "",
        f"entries[{len(entries)}]{{path, type}}:",
    ]
    for path, entry_type in entries:
        lines.append(f"{path}, {entry_type}")

    index_path = os.path.join(target_dir, "INDEX.toon")
    with open(index_path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: generate-index-toon.py <repo-root>")
        return 1

    base_dir = os.path.abspath(sys.argv[1])
    if not os.path.isdir(base_dir):
        print(f"Not a directory: {base_dir}")
        return 1

    write_index(base_dir, base_dir)

    for name in sorted(os.listdir(base_dir)):
        path = os.path.join(base_dir, name)
        if not os.path.isdir(path):
            continue
        if should_skip_dir(name):
            continue
        write_index(base_dir, path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
