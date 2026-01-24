# TODO

## Status legend
- [ ] Open task
- [x] Completed task

## Completed — 2026-01-24

### AS-CORE-001 — Server-Side Session Persistence (P0)
- [x] Define a durable server-side session schema with user binding, state, and timestamps.
- [x] Implement CRUD persistence using a file-backed store under `.data/agent-sessions.json`.
- [x] Remove `localStorage` as the source of truth; retain it only for one-time migration.
- [x] Add API routes for creating, listing, fetching, and patching sessions.
- [x] Persist chat responses to the server session store (regular + streaming endpoints).

### AS-CORE-002 — Lifecycle + Step Timeline (P0)
- [x] Define allowed session state transitions and enforce them fail-closed.
- [x] Persist step timeline entries (started/succeeded/failed) per session.
- [x] Expose session steps via `/api/sessions/[id]/steps`.

### Security hardening (P0/P1)
- [x] Implement path policy guardrails (allowlist + do-not-touch) for any mutative file operations.
- [x] Add a kill switch / read-only mode guard for mutative agent endpoints.

### Tooling & Type Safety
- [x] Configure ESLint explicitly via `.eslintrc.json` and compatible dev dependencies.
- [x] Resolve TypeScript errors caused by outdated Genkit imports and NextAuth session typing.
- [x] Validate the change set with `npm run typecheck`, `npm run lint`, and `npm run build`.

### Follow-ups
- [x] Address remaining ESLint warnings around custom fonts and hook dependency arrays.

## Open — Next highest-value tasks
