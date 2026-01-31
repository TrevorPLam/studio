<!--
filepath: .github/copilot-instructions.md
purpose: Guidance for Copilot PR agents.
last updated: 2026-01-30
related tasks: FIRST.md Phase 2 (Copilot instructions)
-->

# Copilot PR Agent Instructions

## Branch naming
- Use `agent/<short-task>` or `chore/<short-task>`.

## PR requirements
- `make verify` must pass.
- Include test output or note why tests are skipped.

## Protected paths
- Changes touching protected paths require explicit human approval.
- See `scripts/security/protected-paths.txt`.

## Tests
- Add or update tests when behavior changes.
