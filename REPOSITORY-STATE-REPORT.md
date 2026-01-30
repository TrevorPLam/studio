# Repository State Report — Forensic Audit

**Date:** 2025-01-30  
**Scope:** Full repository (apps, packages, tooling, CI/CD, security, dependencies)  
**Methodology:** Static analysis, dependency and config review, path and import tracing, CI/workflow and documentation review.

---

## EXECUTIVE SUMMARY

### Overall Repository Health Score: **4.5 / 10**

The monorepo is structurally organized (Turbo, pnpm workspaces, feature-based app layout) and has strong alignment documentation and security-minded modules (sanitization, path policy, rate limiting). However, **undeclared dependencies**, **broken imports**, **no real tests**, and **inconsistent naming** create high risk for builds, CI, and maintainability. The codebase cannot be assumed to build or pass CI in a clean clone without fixes.

### Three Most Critical Issues Requiring Immediate Attention

1. **Undeclared runtime dependencies in `apps/web`** — The app imports `next-auth`, `genkit`, `@genkit-ai/google-genai`, `zod`, `@octokit/rest`, and `@octokit/auth-app`, but **none of these appear in `apps/web/package.json`**. Only `@studio/contracts` brings in `zod`. A fresh `pnpm install` and build will fail or behave unpredictably.
2. **Broken imports in `apps/web/features/github/lib/github-app.ts`** — Imports `./security/secrets` and `./logger` relative to `features/github/lib/`. Those paths resolve to `features/github/lib/security/secrets` and `features/github/lib/logger`, which **do not exist** (actual modules are under `lib/security/secrets.ts` and `lib/logger.ts`). This will cause module resolution failures at build or runtime.
3. **No automated tests** — `apps/web` script is `"test": "echo 'No tests configured yet' && exit 0"`. Turbo and CI both run `pnpm test`; coverage is 0%. Critical paths (auth, chat, sessions, GitHub API, killswitch) are untested, increasing regression and deployment risk.

### Three Strongest Aspects of the Codebase

1. **Security and validation design** — Centralized sanitization (`lib/security/sanitize.ts`) with XSS/injection patterns, path policy (`path-policy.ts`) with allow/forbid lists, validation wired to Zod and sanitization in `lib/validation.ts`, and secrets via env in `lib/security/secrets.ts`. No hardcoded secrets found; TruffleHog runs in CI.
2. **Structured app and alignment docs** — Next.js app is organized by features (auth, agents, github, sessions) with clear `lib/` boundaries. The `.alignment` standard (14 standards, principles, tooling, validation workflows) is comprehensive and validated in CI.
3. **Observability and ops readiness** — Logger, rate limiting with headers, killswitch, correlation/tracing/metrics modules, and request timeouts (e.g. 30s for chat) show intentional operability and safety.

---

## DETAILED FINDINGS

### 1. ARCHITECTURAL & STRUCTURAL ASSESSMENT

#### Strengths

- **Monorepo layout:** `pnpm-workspace.yaml` and `package.json` workspaces (`apps/*`, `packages/*`) are consistent; Turbo pipeline defines `build`, `lint`, `type-check`, `test` with correct `dependsOn` and outputs.
- **App structure:** `apps/web` uses a clear split: `app/` (routes, pages), `features/` (auth, agents, github, sessions), `lib/` (cross-cutting), `components/`, `hooks/`, `ai/`. API routes live under `app/api/` with coherent grouping (auth, agents, github, sessions, admin, docs, metrics).
- **Shared packages:** `@studio/contracts` (types + Zod), `@studio/api-sdk` (re-exports contracts), `@repo/ui`, `@repo/utils` provide clear boundaries; `tsconfig.base.json` uses strict options and `noUncheckedIndexedAccess`.

#### Critical Issues

- **Broken imports in feature module (evidence):**  
  **File:** `apps/web/features/github/lib/github-app.ts` (lines 14–15)  
  ```ts
  import { getGitHubAppConfig } from './security/secrets';
  import { logger } from './logger';
  ```  
  From `features/github/lib/`, `./security/secrets` and `./logger` resolve to paths under `features/github/lib/`, which do not exist. Actual modules: `lib/security/secrets.ts`, `lib/logger.ts`. **Fix:** Use `@/lib/security/secrets` and `@/lib/logger`.
- **Config package workspace mismatch:** `packages/config/package.json` declares `"workspaces": ["eslint-config", "typescript-config", "jest-config"]`, but only `typescript-config/` exists. `eslint-config` and `jest-config` are missing; references to them are invalid.

#### Concerns

- **Naming inconsistency:** UI and utils use `@repo/ui` and `@repo/utils`; contracts and api-sdk use `@studio/contracts` and `@studio/api-sdk`. Web app path aliases use `@studio/*` for all four (`tsconfig.json`), while `package.json` uses mixed `@repo/*` and `@studio/*`. This can confuse onboarding and tooling.
- **README vs. layout:** README lists `infrastructure/`, `docs/`, `tools/`; project layout has `scripts/` (no `tools/`), and no top-level `infrastructure/` or `docs/`. Misleading for new contributors.

#### Opportunities

- Extract shared auth helpers (`getUserId`, `ensureTimestamps`) used in multiple API routes into a single module (e.g. `lib/auth-helpers.ts` or under `features/auth`) to reduce duplication and drift.
- Add a root or app-level `next.config.js` (or `next.config.mjs`) for path aliases and future config (e.g. bundle analysis, security headers).

---

### 2. CODE QUALITY DEEP DIVE

#### Strengths

- **Strict TypeScript:** `tsconfig.base.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, supporting safer refactors.
- **Consistent file headers:** Many files use a standard header block (purpose, related files, security/epic refs) improving traceability.
- **Validation layer:** `lib/validation.ts` uses Zod schemas and integrates sanitization (`sanitizeString`, `sanitise`) for message and repo params, giving a single place for request validation.

#### Critical Issues

- **Repeated helpers across routes (copy-paste):**  
  - `getUserId(session)` duplicated in at least **6** places: `app/api/admin/killswitch/route.ts`, `app/api/agents/chat/route.ts`, `app/api/agents/chat-stream/route.ts`, `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`, `app/api/sessions/[id]/steps/route.ts`.  
  - `ensureTimestamps(messages)` duplicated in `app/api/agents/chat/route.ts`, `app/api/agents/chat-stream/route.ts`, and `app/agents/[id]/page.tsx`.  
  Any change to identity or timestamp handling must be repeated in many files; high risk of inconsistency.
- **Comment/context vs. behavior:** High comment-to-code ratio in headers is good for context; some modules (e.g. `lib/security/sanitize.ts`) are long (~500+ lines) with multiple responsibilities—consider splitting (e.g. XSS vs. injection detection) for maintainability.

#### Concerns

- **Error handling patterns:** API routes use a mix of try/catch and early returns. Custom types (`ValidationError`, `AIAPIError`) are used in chat routes; other routes often return generic 500 messages. Standardizing an error-handling middleware or helper would improve consistency and security (e.g. not leaking stack traces).
- **Contracts vs. app validation:** `packages/contracts/schemas.ts` only exports `sessionIdSchema` and `agentIdSchema`. Most validation lives in `apps/web/lib/validation.ts`. Contracts are underused as the single source of truth for API shapes.

#### Opportunities

- Add a shared `getUserId` and `ensureTimestamps` (and optionally a small `withAuth` wrapper) used by all protected API routes.
- Introduce ESLint rules for max function length and complexity where appropriate; consider `eslint-plugin-functional` or similar for pure modules.

---

### 3. DEPENDENCY HEALTH AUDIT

#### Strengths

- **Workspace dependencies:** Internal packages use `workspace:*` correctly (`@repo/ui`, `@repo/utils`, `@studio/contracts`, `@studio/api-sdk`).
- **Root tooling:** Turbo `^1.10.0`, Prettier `^3.2.5`, TypeScript `^5.0.0` are declared at root; version ranges are reasonable.
- **CI:** `pnpm install --frozen-lockfile` and `pnpm audit --audit-level=moderate` (with continue-on-error) plus TruffleHog secret scanning are configured.

#### Critical Issues

- **Missing dependencies in `apps/web/package.json`:**  
  The app code imports the following, but they are **not** listed in `apps/web/package.json`:
  - `next-auth` (route handler, `getServerSession`, providers, types)
  - `next-auth/react` (SessionProvider, useSession, signIn)
  - `genkit`, `@genkit-ai/google-genai` (ai/genkit.ts)
  - `zod` (used directly in several API routes and lib/validation.ts; only contracts declare it)
  - `@octokit/rest` (GitHubClient)
  - `@octokit/auth-app` (GitHub App auth)  
  **Evidence:** Grep for these in `package.json` shows only `packages/contracts` listing `zod`. A clean install will not satisfy these imports; build or runtime will fail.
- **No lockfile in tree:** No `pnpm-lock.yaml` (or equivalent) was found in the repository. Without a committed lockfile, installs are non-reproducible and dependency drift is likely.

#### Concerns

- **Turbo test config:** `turbo.json` test task lists `inputs` including `jest.config.js` and `**/__tests__/**`, but the main app has no Jest (or Vitest) config and no test files; the test script is a no-op. Pipeline is aligned with a future test setup, not current state.
- **Package manager pin:** Root has `"packageManager": "pnpm@8.0.0"`. Pinning is good; ensure CI and docs match this version.

#### Opportunities

- Add all direct imports used by `apps/web` to `apps/web/package.json` (and move shared ones to root or contracts as appropriate), then run `pnpm install` and commit `pnpm-lock.yaml`.
- Consider `pnpm audit --audit-level=high` failing the job (or moderate without continue-on-error) once dependencies are declared and lockfile is present.

---

### 4. TESTING & RELIABILITY ANALYSIS

#### Strengths

- **Turbo test task:** Defined with `dependsOn: ["^build"]` and `outputs: ["coverage/**"]`, ready for when tests exist.
- **Validation workflow:** `.github/workflows/validation.yml` runs structure checks, link checks, shellcheck, JSON schema validation, and markdown linting, improving doc and script reliability.

#### Critical Issues

- **No tests in main app:**  
  **File:** `apps/web/package.json`  
  ```json
  "test": "echo 'No tests configured yet' && exit 0"
  ```  
  There are no `*.test.ts`, `*.spec.ts`, or `__tests__` files under `apps/web`. Test coverage is 0%.
- **CI “Test” job is a no-op:** `.github/workflows/ci.yml` runs `pnpm test`, which exits 0 without running any tests. The job gives a false sense of coverage and regression protection.

#### Concerns

- **Testing pyramid:** When tests are added, critical paths to cover first: auth (NextAuth + admin), agent chat (streaming and non-streaming), session CRUD, GitHub repo/contents/commits/introspect, killswitch, and validation/sanitization. No e2e or integration config found.
- **Packages:** `packages/utils` and `packages/ui` have no test script or test files; `packages/contracts` and `packages/api-sdk` only have lint/type-check. Shared code is untested.

#### Opportunities

- Add Jest or Vitest to `apps/web` with a minimal config, and at least one smoke test (e.g. health or config) so `pnpm test` runs real tests.
- Prioritize unit tests for `lib/validation.ts`, `lib/security/sanitize.ts`, and `lib/security/path-policy.ts` (pure logic, high impact).
- Use `packages/config`’s intended jest-config (once the jest-config workspace exists) for shared Jest setup across apps/packages.

---

### 5. SECURITY & COMPLIANCE REVIEW

#### Strengths

- **No hardcoded secrets:** Grep for password/secret/api_key/token literals found only env references and OpenAPI security scheme types. Secrets are loaded from env in `lib/env.ts` and `lib/security/secrets.ts`.
- **Input sanitization:** `lib/security/sanitize.ts` implements XSS patterns, HTML entity escaping, control-character removal, and optional SQL/command injection detection (for logging/warning). Validation schemas apply sanitization to message content and repo params.
- **Path policy:** `lib/security/path-policy.ts` enforces allow/forbid lists for repo paths; forbidden list includes `.env*`, lockfiles, `.github/workflows/`, reducing risk of sensitive file exposure or modification.
- **CI security:** TruffleHog secret scanning and `pnpm audit` (moderate, continue-on-error) are in place. SECURITY.md describes reporting process and SLAs.

#### Critical Issues

- **None identified beyond dependency and import issues** that could cause runtime behavior or build failures (and thus impact security testing).

#### Concerns

- **Rate limit storage:** `lib/middleware/rate-limit.ts` uses in-memory storage. Comment correctly notes that production should use Redis/Upstash for multi-instance and persistence. Current design does not scale across replicas.
- **Error responses:** Some catch blocks return `error.message` in JSON. Ensure production error handling does not expose stack traces or internal paths (logger is appropriate for server-side detail).
- **SECURITY.md:** Uses placeholder `security@example.com`; should be replaced with real contact.

#### Opportunities

- Add security headers (CSP, X-Frame-Options, etc.) via Next.js config or middleware once `next.config` exists.
- Consider failing CI on `pnpm audit` for high/critical when lockfile and dependency list are fixed.

---

### 6. PERFORMANCE PROFILING

#### Strengths

- **Request timeouts:** Chat route uses `AbortController` with 30s timeout to avoid hanging requests.
- **GitHub client:** Configurable timeout and retry with rate-limit handling in `GitHubClient`.
- **Caching:** Contents route references 2-minute response caching (`lib/cache.ts`); introspector batches file fetches with a limit (e.g. batch size 5).

#### Critical Issues

- **Single points of failure:** In-memory rate limit and in-memory caches (if used elsewhere) are process-local and lost on restart; under load, multiple instances will not share state. Not strictly performance but affects scalability and behavior under load.

#### Concerns

- **Introspector:** Recursive `fetchFileTree` with `maxFiles` and `maxDepth` is bounded but could still do many GitHub API calls; ensure rate limits and timeouts are acceptable for largest repos.
- **No bundle analysis:** No Next.js config or script for analyzing client bundle size; opportunity for future optimization.

#### Opportunities

- Document recommended production deployment (e.g. single instance vs. multi-instance and need for Redis for rate limit/cache).
- Add optional bundle analyzer in Next config for periodic checks.

---

### 7. MAINTAINABILITY METRICS

#### Strengths

- **Alignment documentation:** `.alignment/` provides standards, principles, getting-started, reference, and validation scripts. CONTRIBUTING.md points to it and describes contribution types and process.
- **TOON/agents:** `.agents/` and AGENTS.md define a single source of truth for agent config; INDEX.toon files support navigation. CLAUDE.md aligns with AGENTS.md.
- **Git history:** Recent commits show alignment work, migration, and feature work (e.g. RA-04–RA-10, OpenAPI, tests “passing” then removed or stubbed). History is coherent for understanding evolution.

#### Critical Issues

- **Documentation vs. reality:** README and CONTRIBUTING emphasize ALIGNMENT and standards; README project structure does not match current layout (missing infrastructure/, docs/, tools/). New contributors may follow outdated instructions.

#### Concerns

- **Churn/hotspots:** Not computed (no long-term git blame run). Likely hotspots: `lib/validation.ts`, `lib/security/sanitize.ts`, and API route files that duplicate helpers. Reducing duplication would reduce churn in many files.
- **Onboarding:** No single “Getting started for developers” that covers: install, env vars (e.g. `.env.example` is minimal), run app, run tests (when they exist). SETUP or README could list required env vars and link to alignment docs.

#### Opportunities

- Update README project structure to match current repo (e.g. `scripts/`, no top-level `infrastructure/` or `docs/` unless added).
- Add a short “Developer setup” section: clone, pnpm install, copy `.env.example` to `.env.local`, list required vars, `pnpm dev` / `pnpm build` / `pnpm test`.

---

## ACTIONABLE RECOMMENDATIONS

### IMMEDIATE (Next 1–2 Weeks)

1. **Fix `apps/web` dependencies**  
   Add to `apps/web/package.json`: `next-auth`, `genkit`, `@genkit-ai/google-genai`, `zod`, `@octokit/rest`, `@octokit/auth-app`. Run `pnpm install` at root; commit `pnpm-lock.yaml` if not already present.

2. **Fix broken imports in `github-app.ts`**  
   In `apps/web/features/github/lib/github-app.ts`, replace:
   - `from './security/secrets'` → `from '@/lib/security/secrets'`
   - `from './logger'` → `from '@/lib/logger'`

3. **Restore or align config package**  
   Either create `packages/config/eslint-config` and `packages/config/jest-config` (or equivalent) or remove `eslint-config` and `jest-config` from `packages/config` workspaces to avoid invalid workspace references.

4. **Introduce at least one real test**  
   Add a minimal Jest or Vitest setup to `apps/web` and at least one test (e.g. validation or sanitization) so `pnpm test` runs real tests and CI provides meaningful signal.

### SHORT-TERM (1 Month)

5. **Extract shared auth/session helpers**  
   Create e.g. `lib/auth-helpers.ts` (or under `features/auth`) with `getUserId` and `ensureTimestamps`; refactor all API routes and the agents page to use them.

6. **Update README and CONTRIBUTING**  
   Align README project structure with actual layout; add developer setup (env, install, dev, build, test). Ensure CONTRIBUTING links and steps are accurate.

7. **Standardize package naming**  
   Choose one namespace (`@studio/*` or `@repo/*`) for shared packages and update `package.json` names and tsconfig path aliases consistently.

8. **Add next.config**  
   Add `next.config.js` (or `.mjs`) for path aliases if needed and as a place for security headers and future optimizations.

### MEDIUM-TERM (1–3 Months)

9. **Expand test coverage**  
   Add unit tests for validation, sanitization, path policy, and key API handlers; add integration tests for auth and critical API flows. Wire coverage into Turbo outputs and CI.

10. **Centralize error handling**  
    Introduce a small error-handling helper or middleware for API routes: map known errors (ValidationError, AIAPIError, etc.) to status codes and safe messages; log details server-side only.

11. **Use contracts as API source of truth**  
    Move or mirror request/response schemas from `apps/web/lib/validation.ts` into `packages/contracts` where they represent cross-app or public API contracts; keep app-specific validation in app but derive from contracts where possible.

12. **Rate limiting and cache for production**  
    Document or implement Redis/Upstash (or equivalent) for rate limit and cache when running multiple instances or requiring persistence.

### LONG-TERM (3–6 Months)

13. **Testing pyramid and e2e**  
    Add integration and e2e tests for critical user flows; balance unit vs. integration vs. e2e and document in CONTRIBUTING or .alignment.

14. **Bundle and runtime performance**  
    Add bundle analysis; profile key paths (introspection, chat, GitHub API); optimize hot paths and document scaling assumptions.

15. **Technical debt backlog**  
    Track duplication, long files (e.g. sanitize.ts), and underused contracts in BACKLOG or TODO; schedule incremental refactors.

---

## RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Build fails on clean clone** | High | High | Fix dependencies and imports; add lockfile. |
| **CI passes but no real tests** | Certain | High | Add real test script and at least one test; remove stub. |
| **Regressions in auth/sessions/chat** | High | High | Add tests and shared helpers; reduce duplicated logic. |
| **Multi-instance / scale** | Medium | Medium | Document single-instance limits; plan Redis for rate limit/cache. |
| **Onboarding confusion** | Medium | Low | Update README and CONTRIBUTING; add setup steps. |
| **Contract drift** | Medium | Medium | Use contracts package for API shapes; add tests that assert contracts. |

### Scalability Limitations

- Rate limit and any in-memory caches are per-process; horizontal scaling requires a shared store.
- Introspection and GitHub API usage are bounded but can be heavy for very large repos; consider timeouts and limits in API design.

### Team Velocity Blockers

- Broken imports and missing dependencies block new developers from running the app.
- No tests make refactoring and feature work riskier and slower.
- Duplicated helpers increase review burden and bug risk when behavior must change.

### Knowledge Concentration Risks

- Security and validation logic are well-documented in code but not covered by tests; bus factor is high for `lib/security` and `lib/validation`.
- Alignment and TOON workflows are documented in `.alignment` and `.agents`; onboarding should explicitly point to these for contributors working on standards or automation.

---

## METHODOLOGY NOTES

- **Static analysis:** Manual inspection of package.json files, tsconfig, turbo.json, and import paths; grep for dependencies, secrets, and duplicated symbols.
- **Critical paths:** Auth flow (NextAuth + admin), agent chat (streaming and non-streaming), sessions, GitHub API routes, and killswitch were traced through handlers and shared libs.
- **Domain context:** Repository is a monorepo for a Next.js app with AI agents, GitHub integration, and alignment/standards tooling; evaluation balanced ideal patterns with current scope and stated alignment goals.
- **Quantitative gaps:** No lockfile or dependency tree dump was available; test coverage and complexity metrics were inferred from script content and file search (no coverage report or complexity tool run). Recommendations include adding these for future audits.

---

*End of report. Address IMMEDIATE items first to restore build and CI validity.*
