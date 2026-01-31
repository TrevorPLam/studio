#!/usr/bin/env bash
# filepath: scripts/verify.sh
# purpose: Run the repository quality gate in a single command.
# last updated: 2026-01-30
# related tasks: FIRST.md Phase 1/5 (verify)

set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install pnpm@8 before running verify."
  exit 1
fi

echo "==> verify: blast radius"
scripts/security/check-blast-radius.sh

echo "==> verify: lint"
pnpm lint

echo "==> verify: typecheck"
pnpm type-check

echo "==> verify: tests"
pnpm test

echo "==> verify: build"
pnpm build

echo "verify passed"
