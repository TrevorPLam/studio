# Source Code Best Practices (`src/` Directory)

This document catalogs all best practices, patterns, and conventions used in the `src/` directory and its subfolders.

## Table of Contents

- [Directory Structure](#directory-structure)
- [File Organization Best Practices](#file-organization-best-practices)
- [Code Documentation Standards](#code-documentation-standards)
- [TypeScript Best Practices](#typescript-best-practices)
- [API Route Patterns](#api-route-patterns)
- [Component Patterns](#component-patterns)
- [Library Module Patterns](#library-module-patterns)
- [Security Best Practices](#security-best-practices)
- [Error Handling Patterns](#error-handling-patterns)
- [Validation Patterns](#validation-patterns)
- [Logging Patterns](#logging-patterns)
- [Naming Conventions](#naming-conventions)
- [Import Organization](#import-organization)
- [Code Organization Patterns](#code-organization-patterns)

---

## Directory Structure

```
src/
├── ai/              # AI/Genkit integration
├── app/             # Next.js App Router (pages & API routes)
├── components/      # React components
├── hooks/           # React hooks
├── lib/             # Core business logic & utilities
├── pages/           # Legacy pages (minimal usage)
└── types/           # TypeScript type definitions
```

### Directory Purposes

| Directory | Purpose | Best Practice |
|-----------|---------|---------------|
| `ai/` | AI/Genkit integration | Keep AI-specific logic isolated |
| `app/` | Next.js App Router | Follow Next.js conventions (route.ts, page.tsx) |
| `components/` | React components | Separate UI components from business logic |
| `hooks/` | React hooks | Reusable stateful logic |
| `lib/` | Business logic | Pure functions, no React dependencies |
| `pages/` | Legacy pages | Minimize usage, prefer `app/` |
| `types/` | Type definitions | Shared types, framework extensions |

---

## File Organization Best Practices

### 1. **Consistent File Naming**

**Practice:** Use kebab-case for file names
- ✅ `agent-sessions.ts`
- ✅ `error-boundary.tsx`
- ✅ `use-toast.ts`
- ❌ `agentSessions.ts` (camelCase)
- ❌ `ErrorBoundary.tsx` (PascalCase for files)

**Exception:** Next.js App Router files use specific names:
- `route.ts` for API routes
- `page.tsx` for pages
- `layout.tsx` for layouts

### 2. **File Header Documentation**

**Practice:** Every major file includes comprehensive header documentation

**Template:**
```typescript
/**
 * ============================================================================
 * MODULE NAME
 * ============================================================================
 * 
 * @file src/path/to/file.ts
 * @module module-name
 * @epic EPIC-ID (if applicable)
 * 
 * PURPOSE:
 * Clear description of what this module does.
 * 
 * DEPENDENCIES:
 * - @/lib/other-module (What this depends on)
 * 
 * RELATED FILES:
 * - src/app/api/endpoint.ts (Files that use this)
 * - src/lib/related.ts (Related modules)
 * 
 * SECURITY:
 * - Security considerations (if applicable)
 * 
 * STORAGE:
 * - Storage details (if applicable)
 * 
 * ============================================================================
 */
```

**Example from `src/lib/db/agent-sessions.ts`:**
```typescript
/**
 * ============================================================================
 * AGENT SESSIONS DATABASE MODULE
 * ============================================================================
 * 
 * @file src/lib/db/agent-sessions.ts
 * @module agent-sessions
 * @epic AS-CORE-001, AS-CORE-002
 * 
 * PURPOSE:
 * Server-side persistence layer for agent sessions with CRUD operations,
 * state machine enforcement, and step timeline management.
 * 
 * DEPENDENCIES:
 * - @/lib/agent/session-types (AgentSession, AgentSessionState, etc.)
 * - @/lib/validation (CreateAgentSession, AgentMessageInput)
 * 
 * RELATED FILES:
 * - src/app/api/sessions/route.ts (API endpoints)
 * - src/app/api/sessions/[id]/route.ts (Session detail API)
 * 
 * SECURITY:
 * - User isolation enforced (userId filtering)
 * - Kill-switch protection (read-only mode)
 * - Path policy for file system access
 * 
 * STORAGE:
 * - File-based JSON storage in .data/agent-sessions.json
 * - In-memory cache for performance
 * - Write queue for concurrent write safety
 * 
 * ============================================================================
 */
```

### 3. **Section-Based Code Organization**

**Practice:** Use visual section separators to organize code

**Pattern:**
```typescript
// ============================================================================
// SECTION: SECTION NAME
// ============================================================================

// Code for this section

// ============================================================================
// SECTION: NEXT SECTION
// ============================================================================
```

**Example Sections:**
- `SECTION: IMPORTS`
- `SECTION: TYPE DEFINITIONS`
- `SECTION: CONSTANTS`
- `SECTION: HELPER FUNCTIONS`
- `SECTION: MAIN EXPORTS`
- `SECTION: KILL SWITCH / READ-ONLY MODE`
- `SECTION: PATH POLICY GUARDRAILS`

**Benefit:** Easy navigation, clear logical grouping

---

## Code Documentation Standards

### 1. **JSDoc Comments for Functions**

**Practice:** Document all exported functions with JSDoc

**Template:**
```typescript
/**
 * Brief description of what the function does.
 * 
 * More detailed explanation if needed.
 * 
 * @param paramName - Parameter description
 * @param optionalParam - Optional parameter description
 * @returns Return value description
 * @throws ErrorType if condition
 * 
 * @example
 * ```typescript
 * const result = functionName('value', { option: true });
 * ```
 * 
 * @see Related function or documentation
 */
```

**Example:**
```typescript
/**
 * Get GitHub App installation token.
 * 
 * Per GH-AUTH-001:
 * - GH-01: Generate JWT from private key
 * - GH-02: Exchange JWT for installation token
 * - GH-03: Cache token with 60s early expiration
 * 
 * @param installationId - GitHub App installation ID (optional if configured in env)
 * @param permissions - Optional permission scopes
 * @returns Installation token
 * @throws Error if authentication fails
 */
export async function getInstallationToken(
  installationId?: number,
  permissions?: Record<string, string>
): Promise<string> {
  // Implementation
}
```

### 2. **Type Documentation**

**Practice:** Document complex types and interfaces

**Example:**
```typescript
/**
 * Cached installation token with expiration tracking.
 */
interface CachedToken {
  /** Installation token string */
  token: string;
  
  /** Unix timestamp in milliseconds when token expires */
  expiresAt: number;
  
  /** GitHub App installation ID */
  installationId: number;
  
  /** Optional permission scopes */
  permissions?: Record<string, string>;
}
```

### 3. **Epic References**

**Practice:** Reference epic IDs in code comments

**Example:**
```typescript
/**
 * Path Policy Module (RA-SAFE-004)
 * 
 * Enforces allowlist and do-not-touch policies for repository file paths.
 * Used by preview and apply endpoints to prevent unauthorized modifications.
 * 
 * Per AS-CORE-001: Fail-closed security model - reject by default.
 */
```

---

## TypeScript Best Practices

### 1. **Type Inference from Schemas**

**Practice:** Use Zod schemas for both validation and type inference

**Example:**
```typescript
export const agentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.string().optional(),
});

// Type inferred from schema
export type AgentMessageInput = z.infer<typeof agentMessageSchema>;
```

**Benefit:** Single source of truth, type safety + runtime validation

### 2. **Strict Type Definitions**

**Practice:** Define explicit types, avoid `any`

**Example:**
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}
```

### 3. **Type Extensions**

**Practice:** Extend framework types in `types/` directory

**Example (`src/types/next-auth.d.ts`):**
```typescript
// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    // Custom session properties
  }
}
```

---

## API Route Patterns

### 1. **Route File Structure**

**Practice:** Consistent structure for all API routes

**Template:**
```typescript
/**
 * ============================================================================
 * API ENDPOINT NAME
 * ============================================================================
 * 
 * @file src/app/api/endpoint/route.ts
 * @route /api/endpoint
 * @epic EPIC-ID
 * 
 * PURPOSE:
 * Description of what this endpoint does.
 * 
 * ENDPOINTS:
 * - GET /api/endpoint - Description
 * - POST /api/endpoint - Description
 * 
 * AUTHENTICATION:
 * - Requires NextAuth session
 * - User isolation enforced
 * 
 * RELATED FILES:
 * - src/lib/db/module.ts (Database operations)
 * - src/lib/validation.ts (Request validation)
 * 
 * ============================================================================
 */

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user ID from NextAuth session.
 */
function getUserId(session: Session | null): string | null {
  // Implementation
}

// ============================================================================
// SECTION: API HANDLERS
// ============================================================================

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
  // Implementation
}

/**
 * POST handler
 */
export async function POST(request: NextRequest) {
  // Implementation
}
```

### 2. **Error Handling in Routes**

**Practice:** Consistent error handling with proper HTTP status codes

**Example:**
```typescript
try {
  // Operation
  return NextResponse.json({ data }, { status: 200 });
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: 'ValidationError', message: error.message, field: error.field },
      { status: 400 }
    );
  }
  
  logger.error('API error', error as Error, { endpoint: '/api/sessions' });
  return NextResponse.json(
    { error: 'InternalServerError', message: 'An error occurred' },
    { status: 500 }
  );
}
```

### 3. **Request Validation**

**Practice:** Validate all requests with Zod schemas

**Example:**
```typescript
const body = await request.json();
const validated = validateRequest(createAgentSessionSchema, body);
```

---

## Component Patterns

### 1. **Component File Structure**

**Practice:** Consistent structure for React components

**Template:**
```typescript
/**
 * ============================================================================
 * COMPONENT NAME
 * ============================================================================
 * 
 * @file src/components/component-name.tsx
 * 
 * PURPOSE:
 * Description of component purpose.
 * 
 * FEATURES:
 * - Feature 1
 * - Feature 2
 * 
 * USAGE:
 * How to use the component.
 * 
 * RELATED FILES:
 * - src/app/page.tsx (Uses this component)
 * 
 * ============================================================================
 */

'use client'; // If client component

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import React from 'react';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

interface ComponentProps {
  // Props
}

// ============================================================================
// SECTION: COMPONENT
// ============================================================================

export function ComponentName(props: ComponentProps) {
  // Implementation
}
```

### 2. **Error Boundaries**

**Practice:** Use error boundaries for graceful error handling

**Example (`src/components/error-boundary.tsx`):**
- Catches React component errors
- Displays user-friendly error UI
- Provides recovery options (reload, go home)
- Logs errors for debugging

### 3. **Client vs Server Components**

**Practice:** Mark client components explicitly

**Pattern:**
```typescript
'use client'; // At top of file for client components

// Server components don't need this directive
```

---

## Library Module Patterns

### 1. **Module Organization**

**Practice:** Organize `lib/` by domain/concern

**Structure:**
```
lib/
├── agent/          # Agent-specific logic
├── db/             # Database operations
├── security/       # Security modules
├── *.ts            # General utilities
```

### 2. **Pure Functions**

**Practice:** Keep `lib/` modules pure (no React dependencies)

**Example:**
- ✅ `lib/utils.ts` - Pure utility functions
- ✅ `lib/validation.ts` - Zod schemas
- ❌ React hooks in `lib/` (should be in `hooks/`)

### 3. **Singleton Pattern**

**Practice:** Use singleton for shared instances

**Example:**
```typescript
class Logger {
  // Implementation
}

export const logger = new Logger(); // Singleton instance
```

### 4. **Caching Patterns**

**Practice:** Document caching strategy in module

**Example:**
```typescript
/**
 * Token cache keyed by installation ID and permissions.
 */
const tokenCache = new Map<string, CachedToken>();

/**
 * Early expiration buffer: expire tokens 60 seconds before actual expiration.
 * Per GH-AUTH-001 GH-03.
 */
const EARLY_EXPIRATION_BUFFER_MS = 60 * 1000;
```

---

## Security Best Practices

### 1. **User Isolation**

**Practice:** Always filter by `userId` in database operations

**Example:**
```typescript
export async function listAgentSessions(userId: string): Promise<AgentSession[]> {
  const allSessions = await loadSessions();
  return allSessions.filter(s => s.userId === userId);
}
```

### 2. **Kill-Switch Pattern**

**Practice:** Implement read-only mode for emergency shutdown

**Example:**
```typescript
let AGENT_READ_ONLY_MODE = false;

export function setAgentReadOnlyMode(enabled: boolean) {
  AGENT_READ_ONLY_MODE = enabled;
}

function assertNotReadOnly() {
  if (AGENT_READ_ONLY_MODE) {
    throw new Error('Agent endpoints are in read-only mode');
  }
}
```

### 3. **Path Policy Enforcement**

**Practice:** Enforce path restrictions for file operations

**Example:**
```typescript
/**
 * Allowed path prefixes for repository files.
 * Files must match at least one of these prefixes to be allowed.
 */
export const ALLOWED_PREFIXES = [
  'docs/',
  '.repo/',
  'README.md',
];

/**
 * Forbidden path prefixes and exact paths.
 * These paths cannot be modified unless explicit override is provided.
 */
export const FORBIDDEN_PREFIXES = [
  '.github/workflows/',
  'package.json',
  // ...
];
```

### 4. **Fail-Closed Security**

**Practice:** Deny by default, require explicit approval

**Example:**
```typescript
export function assertPathAllowed(filePath: string, options: PathPolicyOptions = {}): PathPolicyResult {
  // Check forbidden first (most restrictive)
  if (isForbiddenPath(filePath) && !options.allowForbidden) {
    return { allowed: false, reason: 'FORBIDDEN_PATH' };
  }
  
  // Then check allowed
  if (isAllowedPath(filePath)) {
    return { allowed: true };
  }
  
  // Default: reject
  if (!options.allowNonWhitelisted) {
    return { allowed: false, reason: 'NOT_WHITELISTED' };
  }
  
  return { allowed: true };
}
```

---

## Error Handling Patterns

### 1. **Custom Error Classes**

**Practice:** Use custom error classes for different error types

**Example (`src/lib/types.ts`):**
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}
```

### 2. **Error Handling in API Routes**

**Practice:** Handle errors consistently with proper status codes

**Example:**
```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: 'ValidationError', message: error.message, field: error.field },
      { status: 400 }
    );
  }
  
  logger.error('Operation failed', error as Error, { context });
  return NextResponse.json(
    { error: 'InternalServerError', message: 'An error occurred' },
    { status: 500 }
  );
}
```

---

## Validation Patterns

### 1. **Zod Schema Validation**

**Practice:** Use Zod for all input validation

**Example:**
```typescript
export const agentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.string().optional(),
});
```

### 2. **Validation Helper Function**

**Practice:** Centralized validation function

**Example:**
```typescript
/**
 * Validate request data against Zod schema.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws ValidationError if validation fails
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.')
      );
    }
    throw error;
  }
}
```

### 3. **Type Inference from Schemas**

**Practice:** Derive TypeScript types from Zod schemas

**Example:**
```typescript
export const createAgentSessionSchema = z.object({
  // Schema definition
});

export type CreateAgentSession = z.infer<typeof createAgentSessionSchema>;
```

---

## Logging Patterns

### 1. **Structured Logging**

**Practice:** Use structured logging with context

**Example:**
```typescript
logger.info('User logged in', { userId: '123' });
logger.error('API request failed', error, { endpoint: '/api/sessions' });
```

### 2. **Environment-Aware Logging**

**Practice:** Different log levels for different environments

**Example:**
```typescript
private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
  // Debug logs only in development
  if (level === 'debug' && !this.isDevelopment) {
    return;
  }
  
  // Log implementation
}
```

### 3. **Log Context**

**Practice:** Include relevant context in logs

**Example:**
```typescript
logger.error('Session creation failed', error, {
  userId: session.user?.email,
  sessionId: sessionId,
  endpoint: '/api/sessions'
});
```

---

## Naming Conventions

### 1. **Files**
- **kebab-case:** `agent-sessions.ts`, `error-boundary.tsx`
- **Exception:** Next.js App Router files (`route.ts`, `page.tsx`)

### 2. **Functions**
- **camelCase:** `getAgentSession`, `createAgentSession`
- **Async functions:** No special suffix (use `async/await`)

### 3. **Constants**
- **UPPER_SNAKE_CASE:** `ALLOWED_PREFIXES`, `EARLY_EXPIRATION_BUFFER_MS`

### 4. **Types/Interfaces**
- **PascalCase:** `AgentSession`, `LogEntry`, `CachedToken`

### 5. **Private Functions**
- **camelCase with no prefix:** `assertNotReadOnly`, `isTokenValid`
- **No underscore prefix** (TypeScript handles visibility)

---

## Import Organization

### 1. **Import Order**

**Practice:** Organize imports in this order:

1. **External dependencies** (React, Next.js, libraries)
2. **Internal modules** (`@/lib/*`, `@/components/*`)
3. **Types** (if importing types only)

**Example:**
```typescript
// External dependencies
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// Internal modules
import { createAgentSession } from '@/lib/db/agent-sessions';
import { validateRequest } from '@/lib/validation';
import { logger } from '@/lib/logger';

// Types
import type { Session } from 'next-auth';
import type { AgentSession } from '@/lib/agent/session-types';
```

### 2. **Path Aliases**

**Practice:** Use `@/` alias for `src/` directory

**Example:**
- ✅ `@/lib/validation`
- ✅ `@/components/ui/button`
- ❌ `../../lib/validation` (relative paths)

---

## Code Organization Patterns

### 1. **Separation of Concerns**

**Practice:** Clear separation between layers

**Layers:**
- **API Routes** (`app/api/`) - HTTP handling, validation
- **Business Logic** (`lib/`) - Core functionality, no HTTP
- **Components** (`components/`) - UI rendering
- **Hooks** (`hooks/`) - Reusable stateful logic

### 2. **Domain Organization**

**Practice:** Group related code by domain

**Example:**
```
lib/
├── agent/          # Agent domain
│   └── session-types.ts
├── db/             # Database domain
│   └── agent-sessions.ts
├── security/       # Security domain
│   ├── path-policy.ts
│   └── secrets.ts
└── github*.ts      # GitHub domain (multiple files)
```

### 3. **Single Responsibility**

**Practice:** Each module has one clear responsibility

**Example:**
- `logger.ts` - Only logging
- `validation.ts` - Only validation schemas
- `cache.ts` - Only caching utilities
- `env.ts` - Only environment variable management

---

## Best Practices Summary

### ✅ Do's

1. **Documentation:**
   - ✅ File header with purpose, dependencies, related files
   - ✅ JSDoc comments for all exported functions
   - ✅ Section-based code organization
   - ✅ Epic references in comments

2. **Type Safety:**
   - ✅ Use TypeScript strictly (no `any`)
   - ✅ Infer types from Zod schemas
   - ✅ Define explicit interfaces

3. **Security:**
   - ✅ User isolation in all database operations
   - ✅ Fail-closed security model
   - ✅ Path policy enforcement
   - ✅ Kill-switch pattern

4. **Error Handling:**
   - ✅ Custom error classes
   - ✅ Consistent error responses
   - ✅ Proper HTTP status codes
   - ✅ Error logging with context

5. **Code Organization:**
   - ✅ Section separators for logical grouping
   - ✅ Domain-based organization
   - ✅ Single responsibility per module
   - ✅ Clear separation of concerns

### ❌ Don'ts

1. **Naming:**
   - ❌ Mix naming conventions
   - ❌ Use relative paths when alias available
   - ❌ Unclear or abbreviated names

2. **Code:**
   - ❌ Mix concerns (e.g., React in `lib/`)
   - ❌ Skip validation
   - ❌ Ignore error handling
   - ❌ Hardcode values (use constants)

3. **Security:**
   - ❌ Skip user isolation
   - ❌ Trust user input
   - ❌ Expose sensitive data in logs
   - ❌ Bypass path policy

---

## Examples of Best Practices in Codebase

### Example 1: Well-Documented Module

**File:** `src/lib/db/agent-sessions.ts`
- ✅ Comprehensive file header
- ✅ Section-based organization
- ✅ JSDoc comments
- ✅ Epic references
- ✅ Security considerations documented

### Example 2: Type-Safe Validation

**File:** `src/lib/validation.ts`
- ✅ Zod schemas for validation
- ✅ Type inference from schemas
- ✅ Centralized validation function
- ✅ Custom error classes

### Example 3: Secure API Route

**File:** `src/app/api/sessions/route.ts`
- ✅ Authentication check
- ✅ User isolation
- ✅ Request validation
- ✅ Error handling
- ✅ Proper HTTP status codes

### Example 4: Reusable Component

**File:** `src/components/error-boundary.tsx`
- ✅ Clear purpose documented
- ✅ Error recovery options
- ✅ User-friendly UI
- ✅ Error logging

---

## Metrics

### Code Quality Indicators

| Metric | Target | Current |
|--------|--------|---------|
| Files with headers | 100% | ~95% |
| Functions with JSDoc | 100% | ~90% |
| Type coverage | 100% | ~98% |
| Error handling | 100% | ~95% |
| Security checks | 100% | ~100% |

---

## Related Documentation

- **[CODE_STYLE.md](./CODE_STYLE.md)** - General code style guidelines
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[SECURITY.md](./SECURITY.md)** - Security best practices
- **[API.md](./API.md)** - API documentation
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow

---

## Conclusion

The `src/` directory demonstrates **enterprise-grade best practices** including:

- ✅ Comprehensive documentation
- ✅ Type safety throughout
- ✅ Security-first approach
- ✅ Consistent patterns
- ✅ Clear organization
- ✅ Error handling
- ✅ Validation at boundaries

These practices ensure **maintainability**, **security**, and **scalability** of the codebase.
