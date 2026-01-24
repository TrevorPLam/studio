# TESTS.md — Comprehensive Test Plan

**Last Updated:** 2025-01-24  
**Status:** Test Plan — Implementation Pending  
**Coverage Target:** 80%+ for critical paths, 60%+ overall

---

## Table of Contents

1. [Test Strategy](#test-strategy)
2. [Test Infrastructure](#test-infrastructure)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [API Tests](#api-tests)
6. [Security Tests](#security-tests)
7. [E2E Tests](#e2e-tests)
8. [Performance Tests](#performance-tests)
9. [Test Data Management](#test-data-management)

---

## Test Strategy

### Testing Pyramid
- **Unit Tests (70%)**: Fast, isolated, test individual functions/modules
- **Integration Tests (20%)**: Test module interactions, API endpoints
- **E2E Tests (10%)**: Critical user flows, full stack validation

### Testing Principles
- **Fail-Closed Security**: All security checks must have negative test cases
- **Idempotency**: Test retry scenarios and duplicate prevention
- **Observability**: Test logging and correlation ID propagation
- **State Machine**: Test all valid and invalid state transitions

---

## Test Infrastructure

### Required Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@types/jest": "^29.0.0",
    "supertest": "^6.3.0",
    "nock": "^13.4.0",
    "msw": "^2.0.0"
  }
}
```

### Test Structure
```
tests/
├── unit/
│   ├── lib/
│   │   ├── agent/
│   │   ├── db/
│   │   ├── security/
│   │   └── github-app/
│   └── components/
├── integration/
│   ├── api/
│   └── workflows/
├── e2e/
│   └── flows/
├── security/
│   └── adversarial/
└── fixtures/
    └── data/
```

---

## Unit Tests

### EPIC: AS — Agent Sessions

#### AS-CORE-001 — Session Persistence Tests
**File:** `tests/unit/lib/db/agent-sessions.test.ts`

**Test Cases:**
- [ ] `createAgentSession()` — creates session with required fields
- [ ] `createAgentSession()` — generates UUID if id not provided
- [ ] `createAgentSession()` — rejects duplicate session ID
- [ ] `createAgentSession()` — sets default state to 'created'
- [ ] `createAgentSession()` — requires goal field (validation)
- [ ] `getAgentSessionById()` — returns session for valid ID
- [ ] `getAgentSessionById()` — returns null for non-existent session
- [ ] `getAgentSessionById()` — enforces user isolation
- [ ] `listAgentSessions()` — returns only user's sessions
- [ ] `listAgentSessions()` — sorts by updatedAt descending
- [ ] `updateAgentSession()` — updates allowed fields
- [ ] `updateAgentSession()` — preserves unchanged fields
- [ ] `updateAgentSession()` — enforces user isolation
- [ ] `updateAgentSession()` — rejects invalid state transitions
- [ ] `updateAgentSession()` — allows retry from failed state
- [ ] `updateAgentSession()` — handles step timeline updates
- [ ] File persistence — survives process restart
- [ ] File persistence — handles concurrent writes safely
- [ ] Kill-switch — blocks writes when enabled
- [ ] Kill-switch — allows reads when enabled

#### AS-CORE-002 — State Machine Tests
**File:** `tests/unit/lib/db/agent-sessions-state.test.ts`

**Test Cases:**
- [ ] Valid transitions — created → planning
- [ ] Valid transitions — created → failed
- [ ] Valid transitions — planning → preview_ready
- [ ] Valid transitions — planning → failed
- [ ] Valid transitions — preview_ready → awaiting_approval
- [ ] Valid transitions — preview_ready → planning (retry)
- [ ] Valid transitions — preview_ready → failed
- [ ] Valid transitions — awaiting_approval → applying
- [ ] Valid transitions — awaiting_approval → preview_ready (revision)
- [ ] Valid transitions — awaiting_approval → failed
- [ ] Valid transitions — applying → applied
- [ ] Valid transitions — applying → failed
- [ ] Valid transitions — failed → planning (retry)
- [ ] Invalid transitions — created → applying (should reject)
- [ ] Invalid transitions — applied → planning (should reject)
- [ ] Invalid transitions — applied → any state (should reject)
- [ ] Error handling — throws descriptive error on invalid transition

#### AS-CORE-002 — Step Timeline Tests
**File:** `tests/unit/lib/db/agent-sessions-steps.test.ts`

**Test Cases:**
- [ ] `addStep()` — creates step with required fields (id, sessionId, type, status)
- [ ] `addStep()` — sets startedAt timestamp
- [ ] `addStep()` — allows endedAt for completed steps
- [ ] `addStep()` — stores meta data
- [ ] Step types — validates 'plan' | 'context' | 'model' | 'diff' | 'apply'
- [ ] Step status — validates 'started' | 'succeeded' | 'failed'
- [ ] Step timeline — maintains chronological order
- [ ] Step timeline — allows multiple steps of same type

#### Session Schema Tests
**File:** `tests/unit/lib/agent/session-types.test.ts`

**Test Cases:**
- [ ] AgentSession — requires goal field
- [ ] AgentSession — repo binding structure (owner, name, baseBranch)
- [ ] AgentSession — backward compatibility with repository string
- [ ] AgentSessionStep — requires type field
- [ ] AgentSessionStep — backward compatibility with name field
- [ ] Type safety — TypeScript compilation errors for invalid structures

---

### EPIC: RA — Repository Access

#### RA-SAFE-004 — Path Policy Tests
**File:** `tests/unit/lib/security/path-policy.test.ts`

**Test Cases:**
- [ ] `assertPathAllowed()` — allows docs/ prefix
- [ ] `assertPathAllowed()` — allows .repo/ prefix
- [ ] `assertPathAllowed()` — allows README.md exact match
- [ ] `assertPathAllowed()` — allows nested paths under allowed prefixes
- [ ] `assertPathAllowed()` — rejects paths not in allowlist
- [ ] `assertPathAllowed()` — rejects .github/workflows/ prefix
- [ ] `assertPathAllowed()` — rejects package.json exact match
- [ ] `assertPathAllowed()` — rejects lockfile patterns
- [ ] `assertPathAllowed()` — allows forbidden with override flag
- [ ] `assertPathAllowed()` — allows non-whitelisted with override flag
- [ ] `validatePath()` — throws error for disallowed paths
- [ ] `validatePaths()` — validates multiple paths
- [ ] `validatePaths()` — collects all errors before throwing
- [ ] `isForbiddenPath()` — correctly identifies forbidden paths
- [ ] `isAllowedPath()` — correctly identifies allowed paths
- [ ] Path normalization — handles leading/trailing slashes
- [ ] Path normalization — handles Windows path separators
- [ ] Edge cases — empty string
- [ ] Edge cases — root path "/"
- [ ] Edge cases — very long paths

---

### EPIC: GH — GitHub Integration

#### GH-AUTH-001 — GitHub App Authentication Tests
**File:** `tests/unit/lib/github-app.test.ts`

**Test Cases:**
- [ ] `getInstallationToken()` — generates JWT from private key
- [ ] `getInstallationToken()` — exchanges JWT for installation token
- [ ] `getInstallationToken()` — caches token
- [ ] `getInstallationToken()` — expires token 60s early
- [ ] `getInstallationToken()` — generates new token when cached expired
- [ ] `getInstallationToken()` — handles missing installation ID
- [ ] `getInstallationToken()` — handles invalid private key
- [ ] `getReaderToken()` — returns token with read permissions
- [ ] `getActorToken()` — returns token with write permissions
- [ ] `getInstallationIdForRepo()` — finds installation for repo
- [ ] `getInstallationIdForRepo()` — handles repo not installed
- [ ] `clearTokenCache()` — clears specific installation cache
- [ ] `clearTokenCache()` — clears all cache
- [ ] Token caching — separate cache keys per installation
- [ ] Token caching — separate cache keys per permission set

#### Secrets Management Tests
**File:** `tests/unit/lib/security/secrets.test.ts`

**Test Cases:**
- [ ] `getGitHubAppConfig()` — reads from environment variables
- [ ] `getGitHubAppConfig()` — handles newlines in private key
- [ ] `getGitHubAppConfig()` — throws error if appId missing
- [ ] `getGitHubAppConfig()` — throws error if privateKey missing
- [ ] `getGitHubAppConfig()` — handles optional installationId
- [ ] `isGitHubAppConfigured()` — returns true when configured
- [ ] `isGitHubAppConfigured()` — returns false when missing config

---

### EPIC: Validation

#### Validation Schema Tests
**File:** `tests/unit/lib/validation.test.ts`

**Test Cases:**
- [ ] `createAgentSessionSchema` — validates required name
- [ ] `createAgentSessionSchema` — validates name length (1-100)
- [ ] `createAgentSessionSchema` — requires goal or initialPrompt
- [ ] `createAgentSessionSchema` — validates repo binding structure
- [ ] `createAgentSessionSchema` — accepts deprecated repository string
- [ ] `agentMessageSchema` — validates role enum
- [ ] `agentMessageSchema` — validates content not empty
- [ ] `validateRequest()` — throws ValidationError on invalid input
- [ ] `validateRequest()` — includes field path in error
- [ ] `validateRequest()` — returns parsed data on valid input

---

## Integration Tests

### API Integration Tests

#### Sessions API Tests
**File:** `tests/integration/api/sessions.test.ts`

**Test Cases:**
- [ ] `GET /api/sessions` — returns user's sessions
- [ ] `GET /api/sessions` — requires authentication
- [ ] `GET /api/sessions` — returns empty array for new user
- [ ] `POST /api/sessions` — creates new session
- [ ] `POST /api/sessions` — requires authentication
- [ ] `POST /api/sessions` — validates input schema
- [ ] `POST /api/sessions` — returns created session
- [ ] `GET /api/sessions/[id]` — returns session by ID
- [ ] `GET /api/sessions/[id]` — returns 404 for non-existent
- [ ] `GET /api/sessions/[id]` — enforces user isolation
- [ ] `PATCH /api/sessions/[id]` — updates session
- [ ] `PATCH /api/sessions/[id]` — validates state transitions
- [ ] `PATCH /api/sessions/[id]` — returns 409 on invalid transition

#### Steps API Tests
**File:** `tests/integration/api/sessions-steps.test.ts`

**Test Cases:**
- [ ] `GET /api/sessions/[id]/steps` — returns session steps
- [ ] `GET /api/sessions/[id]/steps` — returns empty array if no steps
- [ ] `POST /api/sessions/[id]/steps` — creates new step
- [ ] `POST /api/sessions/[id]/steps` — validates step schema
- [ ] `POST /api/sessions/[id]/steps` — generates step ID
- [ ] `POST /api/sessions/[id]/steps` — sets sessionId from params
- [ ] `POST /api/sessions/[id]/steps` — sets startedAt timestamp

#### GitHub API Tests
**File:** `tests/integration/api/github.test.ts`

**Test Cases:**
- [ ] `GET /api/github/repositories` — returns user repos
- [ ] `GET /api/github/repositories` — requires authentication
- [ ] `GET /api/github/repositories/[owner]/[repo]` — returns repo details
- [ ] `GET /api/github/repositories/[owner]/[repo]/commits` — returns commits
- [ ] Rate limiting — handles 403 rate limit responses
- [ ] Error handling — returns proper error format

---

## Security Tests

### Adversarial Tests
**File:** `tests/security/adversarial.test.ts`

**Test Cases:**
- [ ] Prompt injection — PALADIN blocks ≥ 95% of test payloads
- [ ] Hidden Unicode — sanitizer strips zero-width chars
- [ ] Hidden Unicode — sanitizer strips bidi markers
- [ ] Path traversal — path policy blocks ../ attacks
- [ ] Path traversal — path policy blocks absolute paths
- [ ] SQL injection — no SQL queries (file-based storage)
- [ ] XSS — input sanitization in API responses
- [ ] CSRF — API requires authentication
- [ ] Authorization — user isolation enforced
- [ ] State machine — invalid transitions rejected

### Path Policy Security Tests
**File:** `tests/security/path-policy-security.test.ts`

**Test Cases:**
- [ ] Forbidden paths — package.json blocked
- [ ] Forbidden paths — lockfiles blocked
- [ ] Forbidden paths — workflows blocked
- [ ] Override mechanism — requires explicit flag
- [ ] Allowlist enforcement — non-whitelisted paths blocked
- [ ] Edge cases — path normalization prevents bypass

---

## E2E Tests

### Critical User Flows
**File:** `tests/e2e/flows/critical.test.ts`

**Test Cases:**
- [ ] User sign-in flow — GitHub OAuth → session creation
- [ ] Session creation — create → view → update
- [ ] Session state flow — created → planning → preview_ready → awaiting_approval → applying → applied
- [ ] Session retry flow — failed → planning (retry)
- [ ] Step timeline — add steps → view timeline
- [ ] Repository browsing — list → view → browse commits
- [ ] Error handling — 404, 401, 500 responses

### Preview/Apply Workflow (When Implemented)
**File:** `tests/e2e/flows/preview-apply.test.ts`

**Test Cases:**
- [ ] Preview generation — goal → context → model → diff
- [ ] Preview display — shows unified diffs
- [ ] Approval flow — preview → approve → apply
- [ ] Rejection flow — preview → reject → planning
- [ ] Path policy enforcement — blocks forbidden paths
- [ ] PR creation — apply → branch → commit → PR
- [ ] Idempotency — duplicate requests handled

---

## Performance Tests

### Load Tests
**File:** `tests/performance/load.test.ts`

**Test Cases:**
- [ ] Session creation — handles 100 concurrent requests
- [ ] Session listing — handles 1000 sessions
- [ ] Token caching — reduces GitHub API calls
- [ ] File I/O — concurrent session updates safe
- [ ] API response times — P95 < 500ms for reads
- [ ] API response times — P95 < 1000ms for writes

### Stress Tests
**File:** `tests/performance/stress.test.ts`

**Test Cases:**
- [ ] Memory usage — no leaks under sustained load
- [ ] File handle leaks — all handles closed
- [ ] Token cache — evicts expired tokens
- [ ] Error recovery — handles GitHub API outages

---

## Test Data Management

### Fixtures
**Directory:** `tests/fixtures/data/`

**Files:**
- [ ] `sessions.json` — sample session data
- [ ] `steps.json` — sample step data
- [ ] `github-responses.json` — mocked GitHub API responses
- [ ] `adversarial-payloads.json` — prompt injection test cases
- [ ] `path-policy-cases.json` — path policy test cases

### Test Utilities
**File:** `tests/utils/test-helpers.ts`

**Functions:**
- [ ] `createTestSession()` — helper to create test session
- [ ] `createTestUser()` — helper to create test user
- [ ] `mockGitHubAPI()` — helper to mock GitHub responses
- [ ] `cleanupTestData()` — helper to clean up after tests
- [ ] `waitForState()` — helper to wait for async state changes

---

## Test Execution

### Running Tests
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run security tests
npm run test:security

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### CI Integration
- [ ] Run tests on every PR
- [ ] Require all tests to pass before merge
- [ ] Generate coverage reports
- [ ] Upload coverage to codecov
- [ ] Run security tests in separate job
- [ ] Run E2E tests on staging environment

---

## Test Coverage Goals

### Critical Paths (P0) — 90%+
- Session CRUD operations
- State machine transitions
- Path policy enforcement
- GitHub App authentication
- Security validations

### Important Features (P1) — 80%+
- API endpoints
- Validation schemas
- Error handling
- Token caching

### Nice-to-Have (P2) — 60%+
- UI components
- Utility functions
- Helpers

---

## Test Maintenance

### Review Checklist
- [ ] All new features have corresponding tests
- [ ] Bug fixes include regression tests
- [ ] Test data is realistic and covers edge cases
- [ ] Tests are independent and can run in any order
- [ ] Tests clean up after themselves
- [ ] Test names clearly describe what they test
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)

### Test Quality Metrics
- Test execution time < 30s for unit tests
- Test execution time < 5m for integration tests
- Test execution time < 15m for E2E tests
- Flaky test rate < 1%
- Test coverage increases with each PR

---

## Notes

- **Mocking Strategy**: Use MSW for API mocking, nock for GitHub API
- **Test Database**: Use in-memory file system for session storage in tests
- **Isolation**: Each test should be independent, no shared state
- **Fixtures**: Use factories for test data generation
- **Assertions**: Use descriptive assertion messages

---

**Next Steps:**
1. Set up Jest testing infrastructure
2. Implement unit tests for core modules
3. Add integration tests for API endpoints
4. Create E2E test suite for critical flows
5. Set up CI/CD test pipeline
