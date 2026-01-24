# Testing Guide

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [E2E Tests](#e2e-tests)
- [Test Utilities](#test-utilities)
- [Mocking](#mocking)
- [Test Data Management](#test-data-management)
- [Coverage Goals](#coverage-goals)
- [Test Patterns](#test-patterns)
- [Common Test Scenarios](#common-test-scenarios)
- [Debugging Tests](#debugging-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Test Maintenance](#test-maintenance)
- [Resources](#resources)
- [Related Documentation](#related-documentation)

---

## Overview

This guide covers how to run and write tests for Firebase Studio.

## Test Structure

```
tests/
├── unit/              # Unit tests (individual modules)
├── integration/       # Integration tests (API endpoints)
├── e2e/               # End-to-end tests (user flows)
├── security/          # Security tests
├── performance/       # Performance tests
├── fixtures/         # Test data
└── utils/            # Test utilities
```

## Running Tests

### All Tests

```bash
npm test
```

### By Category

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Security tests
npm run test:security

# E2E tests
npm run test:e2e
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Writing Tests

### Unit Tests

Test individual functions and modules in isolation.

**Example:**
```typescript
// tests/unit/lib/validation.test.ts
import { validateRequest, createAgentSessionSchema } from '@/lib/validation';

describe('createAgentSessionSchema', () => {
  it('validates required name', () => {
    const result = createAgentSessionSchema.safeParse({
      goal: 'Test goal',
    });
    expect(result.success).toBe(false);
  });
});
```

**Best Practices:**
- Test one thing at a time
- Use descriptive test names
- Arrange-Act-Assert pattern
- Mock external dependencies

### Integration Tests

Test API endpoints and module interactions.

**Example:**
```typescript
// tests/integration/api/sessions.test.ts
import { GET, POST } from '@/app/api/sessions/route';

describe('Sessions API', () => {
  it('returns user sessions', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.sessions).toBeDefined();
  });
});
```

**Best Practices:**
- Mock external services (GitHub API, AI API)
- Test authentication
- Test error cases
- Test validation

### E2E Tests

Test complete user flows.

**Example:**
```typescript
// tests/e2e/flows/critical.test.ts
describe('Session Creation Flow', () => {
  it('create → view → update', async () => {
    // Create session
    const created = await createAgentSession(userId, input);
    
    // View session
    const viewed = await getAgentSessionById(userId, created.id);
    expect(viewed).toBeDefined();
    
    // Update session
    const updated = await updateAgentSession(userId, created.id, updates);
    expect(updated).toBeDefined();
  });
});
```

**Best Practices:**
- Test critical user paths
- Use realistic data
- Clean up after tests

## Test Utilities

### Test Helpers

Located in `tests/utils/test-helpers.ts`:

```typescript
import { createTestSession, createTestUser } from '@/tests/utils/test-helpers';

// Create test session input
const input = createTestSession({ name: 'Custom Name' });

// Create test user
const userId = createTestUser('prefix');
```

### Fixtures

Test data in `tests/fixtures/data/`:

```typescript
import sessions from '@/tests/fixtures/data/sessions.json';

// Use fixture data
const testSession = sessions[0];
```

## Mocking

### Mocking NextAuth

```typescript
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

import { getServerSession } from 'next-auth';

(getServerSession as jest.Mock).mockResolvedValue({
  user: { email: 'test@example.com' }
});
```

### Mocking GitHub API

```typescript
import nock from 'nock';

nock('https://api.github.com')
  .get('/user/repos')
  .reply(200, [{ id: 1, name: 'test-repo' }]);
```

### Mocking File System

```typescript
import { promises as fs } from 'fs';

jest.spyOn(fs, 'readFile').mockResolvedValue('{"sessions":[]}');
```

## Test Data Management

### Creating Test Data

```typescript
// Use helpers
const session = await createAgentSession(userId, createTestSessionInput());

// Or create manually
const session: AgentSession = {
  id: 'test-id',
  userId: 'test-user',
  // ... other fields
};
```

### Cleaning Up

```typescript
afterEach(async () => {
  await cleanupTestData();
});
```

## Coverage Goals

### Target Coverage

- **Critical Paths (P0):** 90%+
- **Important Features (P1):** 80%+
- **Nice-to-Have (P2):** 60%+

### Critical Paths

- Session CRUD operations
- State machine transitions
- Path policy enforcement
- GitHub App authentication
- Security validations

## Test Patterns

### AAA Pattern

```typescript
it('should do something', () => {
  // Arrange
  const input = createTestInput();
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

### Testing Async Code

```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw error on invalid input', async () => {
  await expect(
    functionUnderTest(invalidInput)
  ).rejects.toThrow('Expected error message');
});
```

## Common Test Scenarios

### Testing Authentication

```typescript
it('requires authentication', async () => {
  (getServerSession as jest.Mock).mockResolvedValue(null);
  
  const response = await GET();
  expect(response.status).toBe(401);
});
```

### Testing Validation

```typescript
it('validates input schema', async () => {
  const response = await POST(requestWithInvalidData);
  expect(response.status).toBe(400);
});
```

### Testing State Transitions

```typescript
it('allows valid state transition', async () => {
  await updateAgentSession(userId, sessionId, { state: 'planning' });
  const updated = await getAgentSessionById(userId, sessionId);
  expect(updated?.state).toBe('planning');
});

it('rejects invalid state transition', async () => {
  await expect(
    updateAgentSession(userId, sessionId, { state: 'applying' })
  ).rejects.toThrow('Invalid session state transition');
});
```

## Debugging Tests

### Running Single Test

```bash
npm test -- --testNamePattern="test name"
```

### Debugging in VS Code

1. Set breakpoint in test
2. Run test in debug mode
3. Step through code

### Verbose Output

```bash
npm test -- --verbose
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

### Do's

- ✅ Write tests before fixing bugs
- ✅ Test edge cases
- ✅ Keep tests independent
- ✅ Use descriptive test names
- ✅ Clean up test data
- ✅ Mock external dependencies

### Don'ts

- ❌ Test implementation details
- ❌ Share test state between tests
- ❌ Skip cleanup
- ❌ Test third-party libraries
- ❌ Write flaky tests

## Test Maintenance

### Regular Tasks

- **Weekly:** Review failing tests
- **Monthly:** Update test data
- **Quarterly:** Review coverage goals

### When to Update Tests

- When adding new features
- When fixing bugs
- When refactoring code
- When changing APIs

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com)
- [Test Plan](../TESTS.md) - Comprehensive test plan

---

## Related Documentation

- **[TESTS.md](../TESTS.md)** - Comprehensive test plan
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow
- **[CODE_STYLE.md](./CODE_STYLE.md)** - Code style for tests
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## Testing Pyramid

```
        /\
       /  \
      / E2E \         10% - Critical user flows
     /--------\
    /          \
   /Integration \       20% - API endpoints, workflows
  /--------------\
 /                \
/   Unit Tests     \   70% - Individual functions/modules
/------------------\
```

**Distribution:**
- **Unit Tests:** 70% - Fast, isolated, test individual functions
- **Integration Tests:** 20% - Test module interactions, API endpoints
- **E2E Tests:** 10% - Critical user flows, full stack validation
