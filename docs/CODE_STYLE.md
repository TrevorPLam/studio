# Code Style Guide

## Table of Contents

- [TypeScript](#typescript)
- [React Components](#react-components)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Comments](#comments)
- [Error Handling](#error-handling)
- [Async/Await](#asyncawait)
- [Code Organization](#code-organization)
- [Best Practices](#best-practices)
- [Formatting](#formatting)
- [Linting](#linting)
- [Resources](#resources)
- [Related Documentation](#related-documentation)

---

## TypeScript

### Type Definitions

```typescript
// ✅ Good: Explicit interface
interface UserSession {
  id: string;
  userId: string;
  name: string;
}

// ❌ Bad: Using any
function processSession(session: any) { }

// ✅ Good: Proper typing
function processSession(session: UserSession) { }
```

### Function Declarations

```typescript
// ✅ Good: Explicit return type
function createSession(input: CreateSessionInput): Promise<Session> {
  // Implementation
}

// ✅ Good: Arrow function for callbacks
const sessions = data.map(session => session.id);
```

### Error Handling

```typescript
// ✅ Good: Specific error types
if (error instanceof ValidationError) {
  return handleValidationError(error);
}

// ✅ Good: Error logging with context
logger.error('Operation failed', error, { context: 'value' });
```

## React Components

### Component Structure

```typescript
// ✅ Good: Functional component with TypeScript
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### Hooks

```typescript
// ✅ Good: Custom hooks
function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  // Implementation
  return session;
}
```

## File Organization

### Imports

```typescript
// 1. External dependencies
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 2. Internal modules
import { createAgentSession } from '@/lib/db/agent-sessions';
import { validateRequest } from '@/lib/validation';

// 3. Types
import type { AgentSession } from '@/lib/agent/session-types';
```

### Export Order

```typescript
// 1. Types/interfaces
export interface MyType { }

// 2. Constants
export const MY_CONSTANT = 'value';

// 3. Functions
export function myFunction() { }
```

## Naming Conventions

### Variables

```typescript
// ✅ Good: Descriptive names
const userSession = await getSession(userId);
const isAuthenticated = session !== null;

// ❌ Bad: Abbreviations
const us = await getSession(uid);
const auth = session !== null;
```

### Functions

```typescript
// ✅ Good: Verb-based names
function createSession() { }
function updateSession() { }
function deleteSession() { }

// ❌ Bad: Noun-based names
function session() { }
```

### Constants

```typescript
// ✅ Good: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 30000;

// ✅ Good: camelCase for module constants
const allowedPrefixes = ['docs/', '.repo/'];
```

## Comments

### When to Comment

- **Complex logic:** Explain why, not what
- **Business rules:** Document requirements
- **TODOs:** Mark incomplete work
- **API documentation:** JSDoc for public APIs

### Comment Style

```typescript
// ✅ Good: Explain why
// Retry failed sessions to allow recovery from transient errors
if (session.state === 'failed') {
  await retrySession(session);
}

// ❌ Bad: Explain what (obvious)
// Check if session state is failed
if (session.state === 'failed') {
  // Retry the session
  await retrySession(session);
}
```

### JSDoc

```typescript
/**
 * Create a new agent session.
 * 
 * @param userId - User identifier (from auth session)
 * @param input - Session creation input
 * @returns Created session
 * @throws Error if validation fails
 */
export async function createAgentSession(
  userId: string,
  input: CreateAgentSession
): Promise<AgentSession> {
  // Implementation
}
```

## Error Handling

### Error Types

```typescript
// ✅ Good: Specific error types
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ✅ Good: Use error types
if (error instanceof ValidationError) {
  return handleValidationError(error);
}
```

### Error Messages

```typescript
// ✅ Good: Descriptive messages
throw new Error('Invalid session state transition: created -> applying');

// ❌ Bad: Generic messages
throw new Error('Invalid state');
```

## Async/Await

```typescript
// ✅ Good: Use async/await
async function fetchSession(id: string) {
  const session = await getSession(id);
  return session;
}

// ❌ Bad: Promise chains (unless necessary)
function fetchSession(id: string) {
  return getSession(id).then(session => session);
}
```

## Code Organization

### File Structure

```typescript
// 1. Imports
import { ... } from '...';

// 2. Types
interface MyType { }

// 3. Constants
const MY_CONSTANT = 'value';

// 4. Helper functions
function helperFunction() { }

// 5. Main exports
export function mainFunction() { }
```

### Module Organization

- **One main export per file** (when possible)
- **Related functions together**
- **Helper functions at top**
- **Exports at bottom**

## Best Practices

### Do's

- ✅ Use TypeScript strict mode
- ✅ Write self-documenting code
- ✅ Use descriptive names
- ✅ Handle errors explicitly
- ✅ Add comments for complex logic
- ✅ Keep functions small and focused

### Don'ts

- ❌ Use `any` type
- ❌ Leave TODO comments without context
- ❌ Commit console.logs
- ❌ Use magic numbers/strings
- ❌ Write overly complex functions
- ❌ Ignore TypeScript errors

## Formatting

### Prettier (if configured)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Manual Formatting

- **Indentation:** 2 spaces
- **Quotes:** Single quotes (when possible)
- **Semicolons:** Always
- **Trailing commas:** Yes (multi-line)

## Linting

### ESLint Rules

- Follow Next.js ESLint config
- Fix all warnings
- No unused variables
- No console.logs in production code

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Next.js Style Guide](https://nextjs.org/docs)

---

## Related Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[TESTING.md](./TESTING.md)** - Testing patterns

## Code Style Decision Matrix

| Scenario | Pattern | Example |
|----------|---------|---------|
| Component | PascalCase | `MyComponent.tsx` |
| Utility Function | camelCase | `formatDate()` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Type/Interface | PascalCase | `UserSession` |
| File Name | kebab-case | `user-session.ts` |
| Hook | camelCase with "use" | `useSession()` |
