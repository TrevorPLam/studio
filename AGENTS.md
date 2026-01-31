# AGENTS.md

**⚠️ This is a human-readable pointer. The canonical agent instructions are in `agents/AGENTS.toon`.**

## What this repo is
Studio monorepo with TypeScript-first architecture using pnpm + Turbo.

## Project structure
- `apps/` - React + Vite frontend applications
- `packages/` - Shared UI components, utilities, contracts, API SDK
- `scripts/` - Setup and verification scripts
- `agents/` - Agent governance and task management

## Exact commands
- **setup**: `make setup`
- **verify**: `make verify`

## Rules
- Keep changes small and focused; prefer the existing patterns.
- Do not add dependencies without approval.
- Do not modify protected paths without explicit human approval.
- `make verify` must pass for any PR.

## Protected paths
Changes touching these require extra review:
- `infrastructure/`
- `.github/workflows/`
- `scripts/`
- Root config files (e.g. `package.json`, lockfiles, TS config)

## How to test locally
```bash
make setup
make verify
```

## Agent-optimized instructions
**Read `agents/AGENTS.toon` for complete agent guidance.**

This repository uses **TOON (Token‑Oriented Object Notation)** for agent-optimized data storage with lower token overhead than JSON.

### Key files
- `agents/AGENTS.toon` - **Canonical agent registry** (source of truth)
- `agents/TOON.toon` - Format definition and examples
- `agents/tasks/TODO.toon` - Active work
- `agents/tasks/BACKLOG.toon` - Idea intake
- `agents/tasks/ARCHIVE.toon` - Completed work
- `agents/hitl/` - Human-In-The-Loop items (HITL-XXX.md)
