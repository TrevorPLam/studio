#!/usr/bin/env bash
# filepath: scripts/security/check-blast-radius.sh
# purpose: Fail when protected paths change without explicit approval.
# last updated: 2026-01-30
# related tasks: FIRST.md Phase 4 (blast radius)

set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not in a git repository; skipping blast radius check."
  exit 0
fi

patterns_file="scripts/security/protected-paths.txt"
if [ ! -f "$patterns_file" ]; then
  echo "Protected paths file missing; skipping blast radius check."
  exit 0
fi

mapfile -t patterns < <(grep -v '^\s*#' "$patterns_file" | grep -v '^\s*$' || true)
if [ "${#patterns[@]}" -eq 0 ]; then
  echo "No protected paths configured; skipping blast radius check."
  exit 0
fi

base_ref="${BASE_REF:-}"
head_ref="${HEAD_REF:-}"

if [ -n "${GITHUB_BASE_REF:-}" ]; then
  git fetch origin "${GITHUB_BASE_REF}" --depth=1 >/dev/null 2>&1 || true
  base_ref="origin/${GITHUB_BASE_REF}"
  head_ref="${GITHUB_SHA:-HEAD}"
fi

if [ -z "$base_ref" ]; then
  base_ref="HEAD~1"
fi
if [ -z "$head_ref" ]; then
  head_ref="HEAD"
fi

changed_files=$(git diff --name-only "${base_ref}...${head_ref}" || true)
if [ -z "$changed_files" ]; then
  echo "No changes detected for blast radius check."
  exit 0
fi

hits=()
while IFS= read -r file; do
  for pattern in "${patterns[@]}"; do
    if [[ "$file" =~ $pattern ]]; then
      hits+=("$file")
      break
    fi
  done
done <<< "$changed_files"

if [ "${#hits[@]}" -gt 0 ]; then
  echo "Protected paths changed:"
  printf ' - %s\n' "${hits[@]}"
  echo "Blast radius check failed. Human review required."
  exit 1
fi

echo "Blast radius check passed."
