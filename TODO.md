# TASKS.md — v6 Integrated (Production-Hardened + Security Report)

**Primary scope (now):** Agent Sessions, Repository Access, AI Integration, GitHub Integration, Security & Safety Hardening

**First-class NFR pillars:** Security, Resilience, Idempotency, Observability, Safety, Defense-in-Depth

**Operating principles:** Preview-first, PR-only, least-privilege, fail-closed, mobile-retry-safe, hallucination-resistant, kill-switch ready

## 0. Document Control

| Field           | Value                                                                                                                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version         | v6                                                                                                                                                                                                                               |
| Status          | Execution-ready, Production-Hardened, Security-Integrated                                                                                                                                                                        |
| Owner           | Solo Operator                                                                                                                                                                                                                    |
| Audience        | Human + AI agents                                                                                                                                                                                                                |
| Source of Truth | This file                                                                                                                                                                                                                        |
| Update Policy   | Append-only; add new sections/IDs; never rewrite history                                                                                                                                                                         |
| Changelog       | v6 adds: PALADIN framework, hidden-Unicode sanitisation, adversarial CI, lockfile-lint, advisory DB integration, idempotency keys, OTel GenAI conventions, kill-switch/degraded mode, chaos testing, GitHub App permission audit |

### 0.1 Implementation Status (Last Updated: 2025-01-24)

**Legend:** `[x]` = Complete | `[~]` = Partially Implemented | `[ ]` = Not Started

**Summary:**

- **Fully Implemented:** 10 tasks (AS-01, AS-02, AS-03, AS-04, AS-05, AS-06, AS-07, AS-08, RA-11, RA-12, GH-01, GH-02, GH-03, GH-04, BP-01 through BP-20, AI-SAFETY-002-01 through AI-SAFETY-002-03)
- **Partially Implemented:** 2 tasks (AS-CORE-001, AS-CORE-002, P0 Kill-switch, P0 Path policy)
- **Not Implemented:** ~40+ tasks

**Key Implementations:**

- ✅ Server-side session persistence with CRUD operations
- ✅ Session state machine with transition enforcement (including retry from failed)
- ✅ Step timeline API and persistence with proper type structure
- ✅ Session schema with required goal field and repo binding
- ✅ localStorage removed as source-of-truth (read-only cache only)
- ✅ Path policy module with allowlist/forbidden prefixes (RA-SAFE-004)
- ✅ GitHub App JWT authentication with installation token caching (GH-AUTH-001)
- ✅ Basic kill-switch (read-only mode) for session writes
- ✅ **Build configuration fixed - strict TypeScript/ESLint enabled (BP-CRIT-001)**
- ✅ **All `any` types replaced with `unknown` and type guards (BP-CRIT-002)**
- ✅ **Rate limiting middleware with per-endpoint configs (BP-SEC-003)**
- ✅ **Input sanitization with XSS and injection prevention (BP-SEC-004)**
- ✅ **Hidden Unicode sanitization with NFC normalization (AI-SAFETY-002)**

**Critical Gaps:**

- ❌ Preview/Apply workflow (RA-PREV-003, GH-WRITE-002)
- ❌ Approval system (AS-CTRL-003)
- ❌ Security frameworks (PALADIN - policy-proxy LLM)
- ❌ AI integration (structured output, context building)
- ❌ Path policy enforcement at preview/apply endpoints (RA-13)

---

## 1. Best-Practices Checklist Standards (applies to every task)

### 1.1 Task ID + Hierarchy

- Epic: groups tasks by domain (AS/RA/AI/GH/XS/XQ/XP/DP/TEST/OPS)
- Task: executable unit with acceptance criteria
- Checklist items: atomic subtasks [TAG-##]

### 1.2 Definition of Ready (DoR)

A task is Ready only if it includes:

- Context (what/why)
- In-scope / out-of-scope boundaries
- Dependencies (what must exist first)
- Expected file paths
- Connected files (what will call it / be affected)
- Acceptance criteria
- **Verification:** steps (how to prove done)

### 1.3 Definition of Done (DoD)

A task is Done only if:

- Acceptance criteria met
- Tests/verification steps pass (or documented waiver)
- Observability emitted (log + correlation)
- Security constraints enforced (fail closed)
- No secrets in logs
- Hallucination checks pass (for AI-generated operations)

### 1.4 Priority System

- **P0:** blocks safe operation / MVP backbone
- **P1:** required for reliable prod usage (elevated: audit, runbooks, rate limits)
- **P2:** post-MVP hardening / scale

---

## 2. MVP Critical Path (P0, end-to-end)

- [ ] **P0 Preview:** request → context → model → structured output → diff preview
- [ ] **P0 Apply:** approve → branch → commit(s) → PR created + linked to session
- [ ] **P0 Idempotency:** no duplicate preview/PR under retries
- [ ] **P0 PALADIN input guard:** policy-proxy LLM blocks prompt injection ≥ 95%
- [ ] **P0 Hidden-Unicode sanitiser:** strips zero-width / bidi chars before ingestion
- [ ] **P0 Lockfile-lint CI gate:** rejects non-HTTPS, unknown hosts, weak hashes
- [ ] **P0 Idempotency-Key:** client-side Redis cache guarantees exactly-once PR creation
- [x] **P0 Kill-switch:** feature-flag disables all mutative actions globally ≤ 5s ✅
  - **Status:** ✅ Complete - Centralized kill-switch module created in `src/lib/ops/killswitch.ts`, admin API endpoint at `/api/admin/killswitch`, all mutative operations protected (createAgentSession, updateAgentSession, persistSessions). Error handling returns 503 status code. TODO: Redis-based feature flag for distributed systems (future enhancement).
- [ ] **P0 OTel GenAI spans:** gen_ai.system, gen_ai.request.model, gen_ai.usage.\* on every LLM call
- [~] **P0 Path policy:** allowlist + do-not-touch enforced (preview + apply)
  - **Status:** Path policy module complete in `src/lib/security/path-policy.ts`. Missing: enforcement at preview/apply endpoints (pending endpoint creation - RA-13).
- [x] **P0 Observability:** correlated logs by sessionId + requestId + (if webhook) deliveryId ✅
  - **Status:** ✅ Complete - Correlation IDs implemented with AsyncLocalStorage, middleware adds requestId, API routes set sessionId/userId, logger includes correlation IDs in output
- [ ] **P0 Hallucination detection:** verify all paths exist before preview
- [ ] **P0 Async webhook processing:** 202 response within 10s
- [ ] **P0 IP allowlist:** restrict webhook endpoint to GitHub IPs

---

## 2.1. Best Practices & Code Quality Tasks (P0-P2)

**Context:** Comprehensive code quality assessment identified critical production-readiness gaps and anti-patterns that must be addressed to reach world-class standards (95/100). These tasks address immediate risks and production hardening requirements.

**Source:** Best Practices Assessment (2025-01-24) - See `docs/archive/01.24.2026/BEST_PRACTICES_ASSESSMENT.md`

### EPIC: BP — Best Practices & Code Quality

#### BP-CRIT-001 — Fix Build Configuration (P0) ✅ COMPLETE

**Context:** `next.config.ts` currently ignores TypeScript and ESLint errors, allowing broken code to reach production builds. This is a critical production risk.
**Dependencies:** None
**Expected Files:**

- `next.config.ts`
  **Connected Files:**
- All TypeScript files (will need fixes)
- All ESLint violations (will need fixes)
  **Checklist:**
- [x] **[BP-01]** Remove `ignoreBuildErrors: true` from `next.config.ts` ✅
- [x] **[BP-02]** Remove `ignoreDuringBuilds: true` from `next.config.ts` ✅
- [x] **[BP-03]** Fix all TypeScript errors revealed by strict build ✅
- [x] **[BP-04]** Fix all ESLint violations revealed by strict build ✅
- [x] **[BP-05]** Verify production build succeeds without errors ✅
      **Status:** ✅ Complete - All build errors fixed, TypeScript strict mode enabled
      **Acceptance Criteria:**
- Production build fails on TypeScript errors
- Production build fails on ESLint errors
- All existing code compiles without errors
  **Verification:**
  Run `npm run build` and verify it fails on any TypeScript/ESLint errors

#### BP-CRIT-002 — Replace `any` Types with `unknown` (P0) ✅ COMPLETE

**Context:** `src/lib/github-client.ts:106` uses `any` type, compromising type safety. All error handling should use `unknown` with proper type guards.
**Dependencies:** None
**Expected Files:**

- `src/lib/github-client.ts`
- `src/lib/github-app.ts`
- `src/lib/security/path-policy.ts`
- `src/lib/repo-introspection/analyzers/language-detector.ts`
  **Connected Files:**
- Any other files using `any` type (grep for `: any`)
  **Checklist:**
- [x] **[BP-06]** Replace `error: any` with `error: unknown` in `github-client.ts:106` ✅
- [x] **[BP-07]** Add proper type guard for error handling ✅
- [x] **[BP-08]** Search codebase for all `any` type usage ✅
- [x] **[BP-09]** Replace all `any` with `unknown` and type guards ✅
- [x] **[BP-10]** Verify TypeScript strict mode passes ✅
      **Status:** ✅ Complete - All `any` types replaced, type guards added, strict mode passes
      **Acceptance Criteria:**
- Zero `any` types in codebase (except in test mocks if necessary)
- All error handling uses `unknown` with type guards
- TypeScript strict mode passes
  **Verification:**
  Run `npm run typecheck` and verify no `any` types remain (grep for `: any`)

#### BP-SEC-003 — Add Rate Limiting Middleware (P0) ✅ COMPLETE

**Context:** No rate limiting protection exists, making the application vulnerable to DDoS attacks and resource exhaustion.
**Dependencies:** None
**Expected Files:**

- `src/lib/middleware/rate-limit.ts` ✅
- `middleware.ts` (Next.js middleware) ✅
  **Connected Files:**
- All API routes (protected by middleware) ✅
- `next.config.ts` (middleware config)
  **Checklist:**
- [x] **[BP-11]** Implement rate limiting middleware using in-memory store (extensible to Redis/Upstash) ✅
- [x] **[BP-12]** Configure rate limits per endpoint (100 req/min for sessions, 10 req/min for chat, 60 req/min for GitHub) ✅
- [x] **[BP-13]** Add rate limit headers to responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) ✅
- [x] **[BP-14]** Return 429 status code when rate limit exceeded ✅
- [x] **[BP-15]** Add rate limit logging for monitoring ✅
      **Status:** ✅ Complete - Rate limiting implemented with per-endpoint configs, headers, 429 responses, and logging
      **Acceptance Criteria:**
- All API routes protected by rate limiting
- Rate limit headers present in responses
- 429 responses returned when limits exceeded
- Rate limits configurable per endpoint
  **Verification:**
  Send 100+ requests rapidly to an endpoint; verify 429 response after limit

#### BP-SEC-004 — Add Input Sanitization (P0) ✅ COMPLETE

**Context:** No input sanitization exists, creating XSS and injection vulnerabilities. All user input must be sanitized before processing or storage.
**Dependencies:** None
**Expected Files:**

- `src/lib/security/sanitize.ts` ✅
  **Connected Files:**
- `src/lib/validation.ts` (sanitization integrated) ✅
- All API routes accepting user input (protected via validation layer) ✅
  **Checklist:**
- [x] **[BP-16]** Create sanitization utility functions (pure implementation, no external deps) ✅
- [x] **[BP-17]** Create sanitization utility functions ✅
- [x] **[BP-18]** Sanitize all string inputs in validation layer ✅
- [x] **[BP-19]** Sanitize HTML content in chat messages ✅
- [x] **[BP-20]** Add sanitization tests ✅
      **Status:** ✅ Complete - Input sanitization implemented, integrated into validation layer, tests added
      **Acceptance Criteria:**
- All user input sanitized before processing
- XSS attempts blocked
- Injection attempts blocked
- Sanitization logged for audit
  **Verification:**
  Send XSS payload in input; verify it's sanitized/blocked

#### BP-OBS-005 — Implement Observability (P1)

**Context:** Only basic logging exists. Production requires metrics, distributed tracing, and alerting for monitoring and debugging.
**Dependencies:** None (can use local dev tools initially)
**Expected Files:**

- `src/lib/observability/metrics.ts`
- `src/lib/observability/tracing.ts`
- `src/lib/observability/index.ts`
  **Connected Files:**
- All API routes (add instrumentation)
- `src/lib/logger.ts` (integrate with observability)
  **Checklist:**
- [ ] **[BP-21]** Install OpenTelemetry SDK
- [ ] **[BP-22]** Implement metrics collection (request count, latency, error rate)
- [ ] **[BP-23]** Implement distributed tracing with correlation IDs
- [ ] **[BP-24]** Add trace context to all API routes
- [ ] **[BP-25]** Export metrics to Prometheus format (or compatible)
- [ ] **[BP-26]** Add business metrics (sessions created, previews generated, etc.)
      **Acceptance Criteria:**
- Metrics exported for all API endpoints
- Distributed traces with correlation IDs
- Request/response tracing
- Business metrics tracked
  **Verification:**
  Make API requests; verify metrics and traces appear in observability backend

#### BP-SEC-006 — Add Security Headers Middleware (P1) ✅ COMPLETE

**Context:** Missing security headers (CSP, HSTS, X-Frame-Options) leave application vulnerable to common web attacks.
**Dependencies:** None
**Expected Files:**

- `next.config.ts` (headers config) ✅
  **Connected Files:**
- All API routes and pages (protected by headers) ✅
  **Checklist:**
- [x] **[BP-27]** Add Content-Security-Policy (CSP) header ✅
- [x] **[BP-28]** Add Strict-Transport-Security (HSTS) header ✅
- [x] **[BP-29]** Add X-Frame-Options header ✅
- [x] **[BP-30]** Add X-Content-Type-Options header ✅
- [x] **[BP-31]** Add Referrer-Policy header ✅
- [x] **[BP-32]** Add Permissions-Policy header ✅
      **Status:** ✅ Complete - All security headers added via next.config.ts (BP-SEC-012 approach)
      **Acceptance Criteria:**
- All security headers present in responses ✅
- CSP configured appropriately for app ✅
- Headers tested and verified ✅
  **Verification:**
  Check response headers in browser dev tools; verify all security headers present

#### BP-TEST-007 — Increase Test Coverage Threshold (P1)

**Context:** Current test coverage threshold is 60%, which is minimum acceptable. World-class codebases target 80%+ coverage.
**Dependencies:** None
**Expected Files:**

- `jest.config.js`
  **Connected Files:**
- All test files (may need additional tests)
  **Checklist:**
- [ ] **[BP-33]** Increase coverage threshold to 80% in `jest.config.js`
- [ ] **[BP-34]** Add tests to reach 80% coverage for critical paths
- [ ] **[BP-35]** Add tests for error handling paths
- [ ] **[BP-36]** Add tests for edge cases
- [ ] **[BP-37]** Verify coverage report shows 80%+ coverage
      **Acceptance Criteria:**
- Test coverage threshold set to 80%
- All critical paths have 80%+ coverage
- Coverage report passes in CI
  **Verification:**
  Run `npm run test:coverage`; verify 80%+ coverage achieved

#### BP-DEP-008 — Add Dependency Vulnerability Scanning (P1)

**Context:** No dependency vulnerability scanning exists, leaving security vulnerabilities undetected.
**Dependencies:** None
**Expected Files:**

- `.github/workflows/security.yml` (or similar)
- `package.json` (add audit script)
  **Connected Files:**
- All dependencies
  **Checklist:**
- [ ] **[BP-38]** Add `npm audit` to CI pipeline
- [ ] **[BP-39]** Configure Dependabot or similar for automated PRs
- [ ] **[BP-40]** Add license scanning
- [ ] **[BP-41]** Set up automated security alerts
- [ ] **[BP-42]** Document dependency update process
      **Acceptance Criteria:**
- CI fails on critical vulnerabilities
- Automated dependency updates
- License compliance checked
- Security alerts configured
  **Verification:**
  Run `npm audit`; verify vulnerabilities detected and reported

#### BP-TOOL-010 — Add Prettier Configuration (P0) ✅ COMPLETE

**Context:** No code formatting standard exists, leading to inconsistent code style across the codebase.
**Dependencies:** None
**Expected Files:**

- `.prettierrc.json` ✅
- `package.json` (format scripts) ✅
  **Connected Files:**
- All source files (formatted) ✅
  **Checklist:**
- [x] **[BP-44]** Create `.prettierrc.json` with standard configuration ✅
- [x] **[BP-45]** Add format scripts to `package.json` ✅
- [x] **[BP-46]** Format all existing code with Prettier ✅
- [x] **[BP-47]** Add Prettier to pre-commit hooks ✅
      **Status:** ✅ Complete - Pre-commit hook created with Prettier formatting and TODO extraction
      **Acceptance Criteria:**
- Prettier configuration file exists
- Format scripts available in package.json
- All code formatted consistently
  **Verification:**
  Run `npm run format` and verify code is formatted

#### BP-TOOL-011 — Expand ESLint Configuration (P0) ✅ COMPLETE

**Context:** ESLint config only extends `next/core-web-vitals` with no custom rules for TypeScript best practices.
**Dependencies:** None
**Expected Files:**

- `.eslintrc.json` ✅
  **Connected Files:**
- All TypeScript files (linted with new rules) ✅
  **Checklist:**
- [x] **[BP-48]** Add TypeScript ESLint plugin configuration ✅
- [x] **[BP-49]** Add rules for `no-explicit-any`, `no-unused-vars` ✅
- [x] **[BP-50]** Add `no-console` rule (allow warn/error only) ✅
- [x] **[BP-51]** Fix all ESLint violations from new rules ✅
      **Status:** ✅ Complete - Configuration updated, all violations fixed
      **Acceptance Criteria:**
- ESLint config includes TypeScript rules
- `any` types are errors
- Console.log statements are warnings
  **Verification:**
  Run `npm run lint` and verify new rules are active

#### BP-SEC-012 — Add Security Headers to Next.js Config (P0) ✅ COMPLETE

**Context:** Missing security headers (CSP, HSTS, X-Frame-Options) leave application vulnerable to common web attacks.
**Dependencies:** None
**Expected Files:**

- `next.config.ts` ✅
  **Connected Files:**
- All API routes and pages (protected by headers)
  **Checklist:**
- [x] **[BP-52]** Add Content-Security-Policy header ✅
- [x] **[BP-53]** Add Strict-Transport-Security (HSTS) header ✅
- [x] **[BP-54]** Add X-Frame-Options header ✅
- [x] **[BP-55]** Add X-Content-Type-Options header ✅
- [x] **[BP-56]** Add Referrer-Policy header ✅
- [x] **[BP-57]** Add Permissions-Policy header ✅
      **Status:** ✅ Complete - All security headers added
      **Acceptance Criteria:**
- All security headers present in responses
- Headers configured appropriately for app
  **Verification:**
  Check response headers in browser dev tools; verify all security headers present

#### BP-TOOL-013 — Pre-Commit Hook for TODO Management (P0) ✅ COMPLETE

**Context:** TODO comments in code should be automatically extracted and added to TODO.md on commit attempts, or commit should be blocked until TODOs are handled.
**Dependencies:** None
**Expected Files:**

- `.husky/pre-commit` ✅
- `scripts/extract-todos.js` ✅
  **Connected Files:**
- All source files (scanned for TODOs) ✅
- `TODO.md` (updated with extracted TODOs) ✅
  **Checklist:**
- [x] **[BP-58]** Create script to extract TODO/FIXME comments from staged files ✅
- [x] **[BP-59]** Implement logic to either:
  - Block commit until TODOs are manually added to TODO.md, OR
  - Auto-extract and append TODOs to TODO.md ✅
- [x] **[BP-60]** Add pre-commit hook to run TODO extraction ✅
- [x] **[BP-61]** Test hook with sample commits ✅
      **Status:** ✅ Complete - Pre-commit hook created with Prettier formatting and TODO extraction. Supports both "block" and "auto" modes via EXTRACT_TODOS_MODE environment variable.
      **Acceptance Criteria:**
- Pre-commit hook runs on every commit
- TODOs are either blocked or auto-added to TODO.md
- Hook is configurable (block vs auto-add)
  **Verification:**
  Make commit with TODO comment; verify hook runs and TODO.md is updated or commit is blocked

#### BP-DOC-009 — Generate OpenAPI/Swagger Documentation (P2)

**Context:** No API documentation exists beyond markdown. Interactive API docs improve developer experience.
**Dependencies:** None
**Expected Files:**

- `src/lib/api-docs/openapi.ts`
- `src/app/api/docs/route.ts` (serve OpenAPI spec)
  **Connected Files:**
- All API routes (add OpenAPI annotations)
  **Checklist:**
- [ ] **[BP-43]** Install OpenAPI generator (`swagger-jsdoc` or similar)
- [ ] **[BP-44]** Add OpenAPI annotations to all API routes
- [ ] **[BP-45]** Generate OpenAPI spec from code
- [ ] **[BP-46]** Add Swagger UI endpoint (`/api/docs`)
- [ ] **[BP-47]** Document all request/response schemas
      **Acceptance Criteria:**
- OpenAPI spec generated from code
- Interactive API docs available at `/api/docs`
- All endpoints documented
- Request/response examples included
  **Verification:**
  Visit `/api/docs`; verify interactive API documentation works

#### BP-ARCH-010 — Plan Database Migration (P1)

**Context:** File-based storage is not production-ready. Database migration must be planned and executed for production deployment.
**Dependencies:** BP-CRIT-001 (fix build errors first)
**Expected Files:**

- `docs/DATABASE_MIGRATION.md` (migration plan)
- `src/lib/db/interface.ts` (database abstraction)
  **Connected Files:**
- `src/lib/db/agent-sessions.ts` (will be refactored)
- All database operations
  **Checklist:**
- [ ] **[BP-48]** Design database schema (PostgreSQL or MongoDB)
- [ ] **[BP-49]** Create database abstraction layer
- [ ] **[BP-50]** Write migration scripts
- [ ] **[BP-51]** Create data migration plan
- [ ] **[BP-52]** Add database connection pooling
- [ ] **[BP-53]** Add database indexes
- [ ] **[BP-54]** Test migration on staging
      **Acceptance Criteria:**
- Database schema designed
- Migration plan documented
- Abstraction layer created
- Migration tested
  **Verification:**
  Run migration on test database; verify data integrity

---

## 3. Epics & Tasks

### EPIC: AS — Agent Sessions

#### AS-CORE-001 — Server-Side Session Persistence (P0)

**Context:** sessions currently client-local. Must be durable + replayable.
**Dependencies:** DB available (any persistent store).
**Expected Files:**

- `src/lib/agent/session-types.ts`
- `src/lib/db/agent-sessions.ts`
- `src/app/api/sessions/route.ts`
- `src/app/api/sessions/[id]/route.ts`
  **Connected Files:**
- `src/app/agents/page.tsx`
- `src/app/agents/[id]/page.tsx`
  **Checklist:**
- [x] **[AS-01]** Define schema: session, repo binding, goal, state
  - **Status:** ✅ Complete - Schema updated in `src/lib/agent/session-types.ts`: `goal` is required, `repo` is primary format, `repository` kept for backward compatibility
- [x] **[AS-02]** Implement CRUD store (create/get/list/update)
  - **Status:** ✅ Implemented in `src/lib/db/agent-sessions.ts`
- [x] **[AS-03]** Remove localStorage as source-of-truth (optional cache only)
  - **Status:** ✅ Complete - `src/lib/agents.ts` converted to read-only cache helpers, write functions removed, migration code handles legacy data
- [x] **[AS-04]** Add API: create session + list sessions + fetch by id
  - **Status:** ✅ Implemented: `src/app/api/sessions/route.ts` (GET/POST) and `src/app/api/sessions/[id]/route.ts` (GET/PATCH)
    **Code Snippet:**

```typescript
export type AgentSessionState =
  | 'created'
  | 'planning'
  | 'preview_ready'
  | 'awaiting_approval'
  | 'applying'
  | 'applied'
  | 'failed';

export type AgentSession = {
  id: string;
  userId: string;
  repo: { owner: string; name: string; baseBranch: string };
  headBranch?: string;
  goal: string;
  state: AgentSessionState;
  previewId?: string;
  pr?: { number: number; url: string; head: string; base: string };
  createdAt: string;
  updatedAt: string;
};
```

**Acceptance Criteria:**

- Session persists across reload/device
- Session is repo-bound and queryable
  **Verification:**
  Create session; refresh; fetch same session; verify state unchanged

#### AS-CORE-002 — Lifecycle + Step Timeline (P0)

**Dependencies:** AS-CORE-001
**Expected Files:**

- `src/lib/agent/session-state.ts`
- `src/lib/db/agent-steps.ts`
- `src/app/api/sessions/[id]/steps/route.ts`
  **Connected Files:**
- `src/app/agents/[id]/page.tsx`
  **Checklist:**
- [x] **[AS-05]** Define allowed transitions (fail-closed)
  - **Status:** ✅ Implemented in `src/lib/db/agent-sessions.ts` (lines 193-213)
- [x] **[AS-06]** Persist steps (started/succeeded/failed)
  - **Status:** ✅ Complete - Steps persisted in session.steps array with proper `type` field (plan/context/model/diff/apply). `name` field is deprecated but kept for backward compatibility.
- [x] **[AS-07]** Expose step timeline via API
  - **Status:** ✅ Implemented: `src/app/api/sessions/[id]/steps/route.ts` (GET/POST)
- [x] **[AS-08]** Enforce state machine transitions (reject invalid transitions)
  - **Status:** ✅ Implemented in `updateAgentSession()` with fail-closed error handling
    **Code Snippet:**

```typescript
export type AgentStepType = 'plan' | 'context' | 'model' | 'diff' | 'apply';
export type AgentStep = {
  id: string;
  sessionId: string;
  type: AgentStepType;
  status: 'started' | 'succeeded' | 'failed';
  startedAt: string;
  endedAt?: string;
  meta?: Record<string, unknown>;
};

// State machine enforcement
const ALLOWED_TRANSITIONS: Record<AgentSessionState, AgentSessionState[]> = {
  created: ['planning', 'failed'],
  planning: ['preview_ready', 'failed'],
  preview_ready: ['awaiting_approval', 'planning', 'failed'],
  awaiting_approval: ['applying', 'preview_ready', 'failed'],
  applying: ['applied', 'failed'],
  applied: [],
  failed: ['planning'], // allow retry
};

export function assertTransitionAllowed(from: AgentSessionState, to: AgentSessionState) {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw new Error(`Invalid transition: ${from} → ${to}`);
  }
}
```

**Acceptance Criteria:**

- Every session has a step timeline
- Failures show which step failed
- Invalid state transitions are rejected
  **Verification:**
  Trigger preview; confirm 4 steps persisted; fail one step; confirm failure recorded
  Attempt invalid transition (e.g., created → applying); verify rejection

#### AS-CTRL-003 — Human Approval Gate (P0)

**Dependencies:** AS-CORE-002, RA-PREV-003, XS-SEC-001
**Expected Files:**

- `src/lib/agent/approval.ts`
- `src/app/api/sessions/[id]/approve/route.ts`
- `src/app/api/sessions/[id]/reject/route.ts`
  **Connected Files:**
- `src/app/agents/[id]/page.tsx`
  **Checklist:**
- [ ] **[AS-09]** Approval endpoint moves preview_ready → awaiting_approval → approved
- [ ] **[AS-10]** Revision invalidates preview payload and returns to planning/preview_ready
- [ ] **[AS-11]** Immutable approval record
      **Code Snippet:**

```typescript
export type ApprovalDecision = 'approved' | 'rejected';
export type ApprovalRecord = {
  sessionId: string;
  decision: ApprovalDecision;
  byUserId: string;
  at: string;
  note?: string;
};
```

**Acceptance Criteria:**

- Apply fails unless approved
- Approval record exists and cannot be edited
  **Verification:**
  Call apply without approve → 409/403
  Approve then apply → allowed

### EPIC: RA — Repository Access

#### RA-READ-001 — Branch + Tree Listing (P0)

**Dependencies:** GH-AUTH-001 (GitHub App tokens)
**Expected Files:**

- `src/lib/github-reader.ts`
- `src/app/api/github/repos/[owner]/[repo]/branches/route.ts`
- `src/app/api/github/repos/[owner]/[repo]/tree/route.ts`
  **Connected Files:**
- `src/app/repositories/[owner]/[repo]/page.tsx`
  **Checklist:**
- [ ] **[RA-01]** Resolve default branch via repos.get
- [ ] **[RA-02]** List branches (bounded)
- [ ] **[RA-03]** Fetch tree with recursion limits + pagination strategy
      **Code Snippet:**

```typescript
await octokit.repos.get({ owner, repo }); // default_branch
await octokit.git.getTree({ owner, repo, tree_sha: sha, recursive: 'true' });
```

**Acceptance Criteria:**
Tree is browseable and bounded for large repos
**Verification:**
Try a large repo; confirm hard cap triggers safe error

#### RA-READ-002 — File Reads + Size Caps (P0)

**Dependencies:** RA-READ-001, RA-SAFE-004
**Expected Files:**

- `src/lib/github-reader.ts`
- `src/app/api/github/repos/[owner]/[repo]/contents/route.ts`
- `src/lib/security/path-policy.ts`
  **Checklist:**
- [ ] **[RA-04]** Read file content by path+ref
- [ ] **[RA-05]** Batch read selected files
- [ ] **[RA-06]** Enforce max bytes per file and total bytes per request
      **Code Snippet:**

```typescript
const res = await octokit.repos.getContent({ owner, repo, path, ref });
// If file: res.data.content is base64
```

**Acceptance Criteria:**
Reads are deterministic + bounded

#### RA-PREV-003 — Proposed Change Model + Unified Diffs (P0)

**Dependencies:** RA-READ-002, AI-CORE-001, XS-REL-003
**Expected Files:**

- `src/lib/agent/proposed-change.ts`
- `src/lib/diff/unified.ts`
- `src/app/api/sessions/[id]/preview/route.ts`
- `src/lib/db/previews.ts`
  **Connected Files:**
- `src/app/agents/[id]/page.tsx` (preview UI)
  **Checklist:**
- [ ] **[RA-07]** Canonical proposed change representation
- [ ] **[RA-08]** Generate unified diff per file
- [ ] **[RA-09]** Aggregate stats (files/added/removed)
- [ ] **[RA-10]** Persist preview payload linked to session
      **Code Snippet:**

```typescript
export type ProposedFileChange = {
  path: string;
  action: 'create' | 'update' | 'delete';
  after?: string; // required for create/update
};

export type PreviewPayload = {
  sessionId: string;
  plan: string[];
  changes: ProposedFileChange[];
  diffs: { path: string; unified: string }[];
  stats: { files: number; addedChars: number; removedChars: number };
};
```

**Acceptance Criteria:**
Preview endpoint returns diffs without writing to GitHub

#### RA-SAFE-004 — Path Policy + Do-Not-Touch (P0)

**Dependencies:** none (must exist before apply)
**Expected Files:**

- `src/lib/security/path-policy.ts`
  **Checklist:**
- [x] **[RA-11]** Allowlist prefixes (docs/, .repo/, README.md)
  - **Status:** ✅ Complete - Implemented in `src/lib/security/path-policy.ts` with `ALLOWED_PREFIXES` constant
- [x] **[RA-12]** Do-not-touch list (package.json, lockfiles, workflows) unless explicit override
  - **Status:** ✅ Complete - Implemented in `src/lib/security/path-policy.ts` with `FORBIDDEN_PREFIXES` constant, supports override via options
- [ ] **[RA-13]** Enforce at preview AND apply
  - **Status:** Not implemented - preview/apply endpoints don't exist yet
    **Code Snippet:**

```typescript
export const ALLOWED_PREFIXES = ['docs/', '.repo/', 'README.md'];
export const FORBIDDEN_PREFIXES = ['.github/workflows/', 'package.json', 'pnpm-lock.yaml'];

export function assertPathAllowed(path: string, overrides?: { allowForbidden?: boolean }) {
  if (
    !overrides?.allowForbidden &&
    FORBIDDEN_PREFIXES.some((p) => path === p || path.startsWith(p))
  ) {
    throw new Error('Forbidden path');
  }
  if (!ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p))) {
    throw new Error('Path not allowed');
  }
}
```

**Acceptance Criteria:**
Forbidden paths cannot be previewed/applied without explicit override

#### RA-EXT-005 — Content-Type Filtering + Partial Reads (P1)

**Dependencies:** RA-READ-002
**Expected Files:**

- `src/lib/github-reader.ts`
- `src/ai/context-builder.ts`
  **Checklist:**
- [ ] **[RA-14]** Skip binaries by default (images, pdf, etc.)
- [ ] **[RA-15]** Partial-file context: read relevant slices when file exceeds cap
      **Acceptance Criteria:**
      Context stays within budget without losing critical code

#### RA-17 — Tree-sitter AST Chunking (P1)

**Context:** Line-based chunking splits functions mid-statement; AST chunking keeps logical units intact.
**Expected Files:**

- `src/lib/ast/chunker.ts`
- `src/lib/ast/tree-sitter-wrapper.ts`
  **Checklist:**
- [ ] **[RA-17-01]** Install tree-sitter + language grammars (TS, JS, PY, Go, Java)
- [ ] **[RA-17-02]** Wrap parser: parse(filePath): SyntaxNode
- [ ] **[RA-17-03]** Extract semantic units: function_definition, class_definition, method_definition
- [ ] **[RA-17-04]** Return {text, startLine, endLine, type, name} per chunk
      **Code Snippet:**

```typescript
export function chunkFile(path: string): CodeChunk[] {
  const src = readFileSync(path, 'utf-8');
  const tree = parser.parse(src);
  const chunks: CodeChunk[] = [];
  traverse(tree.rootNode, (n) => {
    if (n.type === 'function_definition') {
      chunks.push({
        text: src.slice(n.startIndex, n.endIndex),
        startLine: n.startPosition.row,
        endLine: n.endPosition.row,
        type: n.type,
        name: nodeName(n),
      });
    }
  });
  return chunks;
}
```

**Acceptance Criteria:**
No chunk contains partial functions/classes; 100% of .py/.js/.ts/.go/.java files covered.

#### RA-18 — Sparse BM25 Vector Field (P1)

**Expected Files:**

- `src/lib/ast/sparse-vectorizer.ts`
  **Checklist:**
- [ ] **[RA-18-01]** Tokenise chunk text (lower-case, split, de-dupe)
- [ ] **[RA-18-02]** Compute term-frequency map term → tf
- [ ] **[RA-18-03]** Return sparse vector format {idx: hash(term) % 1000, value: tf}
      **Code Snippet:**

```typescript
export function toSparseVector(text: string): Record<number, number> {
  const tokens = text.toLowerCase().split(/\W+/);
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const out: Record<number, number> = {};
  for (const [t, c] of Object.entries(freq)) {
    out[murmur(t) % 1000] = c / tokens.length;
  }
  return out;
}
```

**Acceptance Criteria:**
Milvus insert succeeds; vector dimension ≤ 1000; identical text yields identical vector.

#### RA-19 — Dense UniXcoder Embedding Field (P1)

**Expected Files:**

- `src/lib/ast/dense-embedder.ts`
  **Checklist:**
- [ ] **[RA-19-01]** Load microsoft/unixcoder-base once at startup
- [ ] **[RA-19-02]** Tokenise with 512-token limit
- [ ] **[RA-19-03]** Return 768-float array (CLS token)
      **Code Snippet:**

```typescript
const tokenizer = AutoTokenizer.from_pretrained('microsoft/unixcoder-base');
const model = AutoModel.from_pretrained('microsoft/unixcoder-base');

export async function embed(code: string): Promise<number[]> {
  const inputs = tokenizer(code, { truncation: true, max_length: 512, return_tensors: 'pt' });
  const out = model(**inputs);
  return out.last_hidden_state[0][0].tolist(); // [768]
}
```

**Acceptance Criteria:**
Mean latency ≤ 200 ms per chunk; cosine distance between identical chunks ≈ 0.

#### RA-20 — RRF Fusion Utility (P1)

**Expected Files:**

- `src/lib/search/rrf.ts`
  **Checklist:**
- [ ] **[RA-20-01]** Accept two ranked lists (id, score)[]
- [ ] **[RA-20-02]** Compute RRF: 1/(60 + rank) for each hit
- [ ] **[RA-20-03]** Sum scores per id, sort descending
      **Code Snippet:**

```typescript
export function fuse(l1: RankedItem[], l2: RankedItem[], k = 60): RankedItem[] {
  const map = new Map<number, number>();
  l1.forEach((h, i) => map.set(h.id, (map.get(h.id) || 0) + 1 / (k + i + 1)));
  l2.forEach((h, i) => map.set(h.id, (map.get(h.id) || 0) + 1 / (k + i + 1)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([id, score]) => ({ id, score }));
}
```

**Acceptance Criteria:**
Top-k order changes vs either list alone; deterministic for same input.

#### RA-21 — Semantic Search HTTP Endpoint (P1)

**Expected Files:**

- `src/app/api/repos/[owner]/[repo]/semantic/route.ts`
  **Checklist:**
- [ ] **[RA-21-01]** Validate owner, repo, q, k (max 50)
- [ ] **[RA-21-02]** Call hybrid search service
- [ ] **[RA-21-03]** Return {results: [{filePath, startLine, endLine, text, score}]}
      **Code Snippet:**

```typescript
export async function POST(req: Request, { params }: { params: { owner: string; repo: string } }) {
  const { q, k = 10 } = await req.json();
  const chunks = await hybridSearch(params.owner, params.repo, q, k);
  return NextResponse.json({ results: chunks });
}
```

**Acceptance Criteria:**
P99 latency ≤ 500 ms; 200 response with array of chunks.

### EPIC: AI — AI Integration

#### AI-CORE-001 — Structured Output + Validation (P0)

**Dependencies:** none
**Expected Files:**

- `src/ai/agent-prompts.ts`
- `src/ai/schemas.ts`
- `src/lib/agent/parse-output.ts`
  **Checklist:**
- [ ] **[AI-01]** System prompt defines role + constraints
- [ ] **[AI-02]** Output schema (plan + changes + confidence level)
- [ ] **[AI-03]** Strict validation (reject malformed)
      **Code Snippet:**

```typescript
// Use zod or equivalent
export const proposedChangeSchema = z.object({
  plan: z.array(z.string()),
  confidence: z.number().min(0).max(100), // NEW: confidence scoring
  needsReview: z.boolean().optional(),
  uncertaintyReason: z.string().optional(),
  changes: z.array(
    z.object({
      path: z.string(),
      action: z.enum(['create', 'update', 'delete']),
      content: z.string().optional(),
    })
  ),
});
```

**Acceptance Criteria:**
Model output is machine-parseable; invalid output fails closed
Model provides confidence score for every proposal

#### AI-CTX-002 — Context Builder + Budgeting (P0)

**Dependencies:** RA-READ-002
**Expected Files:**

- `src/ai/context-builder.ts`
  **Checklist:**
- [ ] **[AI-04]** Assemble context from README + selected files + summaries
- [ ] **[AI-05]** Budget by estimated tokens/chars; deterministic drop order
- [ ] **[AI-06]** Persist context manifest (file list + checksums)
- [ ] **[AI-07]** Implement priority-based context selection algorithm
      **Code Snippet:**

```typescript
export function sha256(text: string) {
  /* impl */
}

export type ContextManifestItem = { path: string; sha256: string; bytes: number };
export type ContextManifest = { sessionId: string; items: ContextManifestItem[] };

// Priority-based context selection
export enum ContextPriority {
  ALWAYS = 1, // README.md
  EXPLICIT = 2, // Files mentioned in goal
  SAME_DIR = 3, // Files in same dir as modified
  RECENT = 4, // Recently modified (git blame)
  COMODIFIED = 5, // Frequently co-modified (git log)
  FALLBACK = 6, // Everything else
}

export function selectContextFiles(
  allFiles: string[],
  budget: number,
  modifiedPaths: string[],
  goal: string
): string[] {
  // Sort by priority, drop lowest until under budget
  // Implementation omitted for brevity
}

// Log/Store manifest, NOT full content
```

**Acceptance Criteria:**
Context is bounded and auditable (manifested)
Deterministic file selection given same inputs

#### AI-CTRL-003 — Prompt Injection Defense + Command Filtering (P0)

**Dependencies:** XS-SEC-001
**Expected Files:**

- `src/lib/security/command-filter.ts`
- `src/lib/security/prompt-injection.ts`
  **Checklist:**
- [ ] **[AI-08]** Only accept explicit commands (regex whitelist) in webhook/comment mode
- [ ] **[AI-09]** Treat rest of comment as untrusted input
- [ ] **[AI-10]** Never allow user text to modify system/tool policy
      **Code Snippet:**

```typescript
export const ALLOWED_COMMANDS = [/^\/review\b/i, /^\/refactor\b/i, /^\/stop\b/i];

export function extractCommand(text: string) {
  const first = text.trim().split('\n')[0];
  return ALLOWED_COMMANDS.some((r) => r.test(first)) ? first.split(/\s+/)[0].toLowerCase() : null;
}
```

**Acceptance Criteria:**
Comments cannot escalate privileges or exfiltrate secrets

#### AI-OPS-004 — Model Versioning + Feedback Loop (P1)

**Expected Files:**

- `src/lib/ai/registry.ts`
- `src/lib/ai/feedback.ts`
- `src/lib/db/ai-usage.ts`
  **Checklist:**
- [ ] **[AI-11]** Record model name/version per session + per step
- [ ] **[AI-12]** Capture approval/rejection outcomes and manual edits (signals)
- [ ] **[AI-13]** Optional: response caching for repeated previews (bounded)
      **Acceptance Criteria:**
      You can rollback model choice and see outcomes

#### AI-SAFE-005 — Confidence Scoring + Low-Confidence Escalation (P1)

**Dependencies:** AI-CORE-001
**Expected Files:**

- `src/ai/confidence.ts`
- `src/lib/agent/escalation.ts`
  **Checklist:**
- [ ] **[AI-14]** Require model to output confidence level (0-100) for each proposal
- [ ] **[AI-15]** Low-confidence escalation: < 75% confidence → flag for review
- [ ] **[AI-16]** Multi-answer self-check (SelfCheckGPT pattern): generate 3 variants, detect inconsistencies
- [ ] **[AI-17]** Grounding verification: validate each file operation against actual repo state
      **Code Snippet:**

```typescript
export type ConfidenceAssessment = {
  score: number; // 0-100
  needsReview: boolean;
  reason?: string;
};

export async function assessConfidence(
  proposedChanges: ProposedFileChange[],
  modelConfidence: number
): Promise<ConfidenceAssessment> {
  if (modelConfidence < 75) {
    return {
      score: modelConfidence,
      needsReview: true,
      reason: 'Model confidence below threshold',
    };
  }
  return { score: modelConfidence, needsReview: false };
}

// Self-consistency check (generate N times, compare)
export async function selfConsistencyCheck(
  goal: string,
  context: string,
  n: number = 3
): Promise<{ consistent: boolean; variance: number }> {
  // Generate N proposals, measure variance
  // High variance = low confidence
}
```

**Acceptance Criteria:**
Sessions with confidence < 75% are flagged in UI
Self-inconsistent proposals are rejected or escalated

#### AI-GUARD-006 — Multi-Layer Guardrail Architecture (P1)

**Dependencies:** AI-SAFE-005, DP-PRIV-001
**Expected Files:**

- `src/lib/ai/guardrails/pre-generation.ts`
- `src/lib/ai/guardrails/post-generation.ts`
- `src/lib/ai/guardrails/brand-safety.ts`
- `src/lib/ai/guardrails/reasoning.ts`
  **Checklist:**
- [ ] **[AI-18]** Pre-generation guardrails: input validation, PII detection in user messages
- [ ] **[AI-19]** Post-generation guardrails: output validation before preview creation
- [ ] **[AI-20]** Brand safety checks: ensure PR body follows templates, no profanity
- [ ] **[AI-21]** Automated reasoning checks: verify logical consistency of proposed changes
      **Code Snippet:**

```typescript
export type GuardrailResult = {
  passed: boolean;
  violations: string[];
  blockers: string[]; // Fatal issues
  warnings: string[]; // Non-fatal issues
};

export async function runPreGenerationGuardrails(
  goal: string,
  context: ContextManifest
): Promise<GuardrailResult> {
  const violations = [];

  // Check for PII in goal
  const piiDetected = detectPII(goal);
  if (piiDetected.length > 0) {
    violations.push(`PII detected: ${piiDetected.join(', ')}`);
  }

  // Check for prompt injection patterns
  const injectionDetected = detectPromptInjection(goal);
  if (injectionDetected) {
    violations.push('Potential prompt injection detected');
  }

  return {
    passed: violations.length === 0,
    violations,
    blockers: violations,
    warnings: [],
  };
}

export async function runPostGenerationGuardrails(
  changes: ProposedFileChange[]
): Promise<GuardrailResult> {
  // Validate logical consistency
  // Check for secrets in proposed changes
  // Verify all paths are valid
}
```

**Acceptance Criteria:**
Input with PII is rejected or redacted
Output with secrets is blocked
Inconsistent proposals are flagged

#### AI-22 — Multi-Hop Retrieval Loop (P1)

**Expected Files:**

- `src/lib/agent/multi-hop-retriever.ts`
  **Checklist:**
- [ ] **[AI-22-01]** Decompose goal → subtasks (LLM)
- [ ] **[AI-22-02]** Per subtask generate 3–5 search queries
- [ ] **[AI-22-03]** Retrieve → feed to LLM → decide "sufficient" or "need more"
- [ ] **[AI-22-04]** Repeat ≤ 3 hops or until satisfied
      **Code Snippet:**

```typescript
while (hop < 3 && gaps.length) {
  const queries = await generateQueries(gaps);
  const chunks = await Promise.all(queries.map((q) => hybridSearch(q, 3)));
  context.push(...chunks.flat());
  gaps = await identifyGaps(context);
  hop++;
}
```

**Acceptance Criteria:**
≥ 90% of subtasks reach "sufficient" within 3 hops; context tokens ≤ 50k.

#### AI-23 — OTel Span per Retrieval Hop (P2)

**Expected Files:**

- `src/lib/obs/retrieval-tracer.ts`
  **Checklist:**
- [ ] **[AI-23-01]** Start span `gen_ai.retrieval.hop{N}` with `gen_ai.system=unixcoder`
- [ ] **[AI-23-02]** Set `gen_ai.usage.input_tokens`, `result_count`, `latency_ms`
- [ ] **[AI-23-03]** End span on completion
      **Code Snippet:**

```typescript
const span = tracer.startSpan(`gen_ai.retrieval.hop${hop}`);
span.setAttributes({
  'gen_ai.system': 'unixcoder',
  'gen_ai.request.model': 'microsoft/unixcoder-base',
});
span.setAttribute('gen_ai.usage.input_tokens', tokens);
span.setAttribute('result_count', chunks.length);
span.end();
```

**Acceptance Criteria:**
Trace appears in Jaeger; attributes match OpenTelemetry GenAI semantic conventions.

#### AI-24 — Retrieved-Context Session Cache (P2)

**Expected Files:**

- `src/lib/agent/context-cache.ts`
  **Checklist:**
- [ ] **[AI-24-01]** Key by `sessionId:chunkHash`
- [ ] **[AI-24-02]** TTL 1 h
- [ ] **[AI-24-03]** Skip re-fetch if hit
      **Code Snippet:**

```typescript
export async function getCached(chunkHash: string, sessionId: string) {
  const key = `${sessionId}:${chunkHash}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  return null;
}
```

**Acceptance Criteria:**
Cache hit reduces retrieval latency to < 5 ms; no stale chunks returned.

#### AI-SAFETY-001 — PALADIN Defense-in-Depth Framework (P0)

**Context:** CVE-2025-53773 (CVSS 9.6) proved single-layer prompt-injection filters are insufficient. PALADIN provides five independent layers: input sanitization, system-prompt hardening, tool-authorisation, output filtering, and behavioural monitoring.
**Expected Files:**

- `src/lib/security/paladin/input-guard.ts`
- `src/lib/security/paladin/policy-proxy-llm.ts`
- `src/lib/security/paladin/tool-authz.ts`
- `src/lib/security/paladin/output-filter.ts`
- `src/lib/security/paladin/behaviour-monitor.ts`
  **Connected Files:**
- `src/lib/agent/executor.ts` (calls tool-authz)
- `src/lib/llm/llm-router.ts` (routes through policy-proxy)
  **Checklist:**
- [ ] **[AI-SAFETY-001-01]** Deploy policy-proxy LLM (≤ 3B params) with prompt-injection classifier
- [ ] **[AI-SAFETY-001-02]** Block on classifier score > 0.8; log to audit table
- [ ] **[AI-SAFETY-001-03]** Enforce per-tool RBAC: read|write|admin scopes
- [ ] **[AI-SAFETY-001-04]** Strip secrets from LLM output before user/tool exposure
- [ ] **[AI-SAFETY-001-05]** Emit anomaly metric if tool call pattern deviates > 2σ from baseline
      **Code Snippet:**

```typescript
export async function policyProxyGuard(text: string): Promise<{
  safe: boolean;
  score: number;
  reason?: string;
}> {
  const res = await classifierModel.predict(text);
  return { safe: res.score < 0.8, score: res.score, reason: res.label };
}
```

**Acceptance Criteria:**

- ≥ 95% block rate on adversarial test suite (see AI-SAFETY-003)
- Zero regression on benign prompt throughput
  **Verification:**
  Run `pnpm test paladin` → expect 100% pass on 200 injection payloads from cybozu/prompt-hardener dataset.

#### AI-SAFETY-002 — Hidden-Unicode Sanitization (P0) ✅ COMPLETE

**Context:** Invisible Unicode (zero-width space, bidi-markers) can hide malicious instructions from human reviewers while still being parsed by the LLM.
**Expected Files:**

- `src/lib/security/sanitize.ts` (includes `sanitise()` function) ✅
  **Checklist:**
- [x] **[AI-SAFETY-002-01]** Allow-list printable ASCII, tabs, newlines; reject all C0/C1 control codes ✅
- [x] **[AI-SAFETY-002-02]** Normalise NFC before filtering ✅
- [x] **[AI-SAFETY-002-03]** Flag (do not block) non-Latin scripts for audit ✅
      **Status:** ✅ Complete - Hidden Unicode sanitization implemented, integrated into validation layer, tests added
      **Code Snippet:**

```typescript
const ALLOWED = /^[\x20-\x7E\t\n\r]+$/;
export function sanitise(input: string): { clean: string; rejected: string[] } {
  const rejected: string[] = [];
  const clean = [...input]
    .filter((ch) => {
      if (ALLOWED.test(ch)) return true;
      rejected.push(unicodeName(ch));
      return false;
    })
    .join('');
  return { clean, rejected };
}
```

**Acceptance Criteria:**

- Payload "delete\u200bFiles()" becomes "deleteFiles()"
- Emoji, accented chars, CJK pass through flag-only
  **Verification:**
  Unit test feeds 50 OWASP-hidden-unicode samples; zero bypasses allowed.

#### AI-SAFETY-003 — Automated Adversarial Testing in CI (P0)

**Expected Files:**

- `tests/security/adversarial.test.ts`
- `.github/workflows/adversarial.yml`
  **Checklist:**
- [ ] **[AI-SAFETY-003-01]** Integrate cybozu/prompt-hardener CLI in CI
- [ ] **[AI-SAFETY-003-02]** Fail build if block-rate < 95%
- [ ] **[AI-SAFETY-003-03]** Upload HTML report as artifact
      **Code Snippet:**

```yaml
- name: Adversarial test
  run: |
    npx prompt-hardener test \
      --model http://localhost:11434/policy-proxy \
      --payloads tests/fixtures/payloads.json \
      --threshold 0.95
```

**Acceptance Criteria:**
CI job must pass before merge to main.

### EPIC: GH — GitHub Integration

#### GH-AUTH-001 — GitHub App Auth (JWT → Installation Token) (P0)

**Dependencies:** none
**Expected Files:**

- `src/lib/github-app.ts`
- `src/lib/security/secrets.ts`
  **Checklist:**
- [x] **[GH-01]** Generate GitHub App JWT from private key
  - **Status:** ✅ Complete - Implemented in `src/lib/github-app.ts` using `@octokit/auth-app`
- [x] **[GH-02]** Exchange JWT for installation token (repo-scoped)
  - **Status:** ✅ Complete - `getInstallationToken()` function in `src/lib/github-app.ts`
- [x] **[GH-03]** Cache token; expire 60s early
  - **Status:** ✅ Complete - Token caching with 60s early expiration buffer implemented
- [x] **[GH-04]** Split reader vs actor permissions (where feasible)
  - **Status:** ✅ Complete - `getReaderToken()` and `getActorToken()` functions with different permission scopes
    **Code Snippet:**

```typescript
function isStale
```
