# Library Module Best Practices (`src/lib/`)

Best practices for core business logic and utility modules.

## Directory Purpose

The `lib/` directory contains pure business logic, utilities, and shared modules. These modules:

- Have no React dependencies
- Are reusable across the application
- Contain core business logic
- Provide utilities and helpers

## File Structure

```
lib/
├── agent/              # Agent domain logic
│   └── session-types.ts
├── db/                 # Database operations
│   └── agent-sessions.ts
├── security/           # Security modules
│   ├── path-policy.ts
│   └── secrets.ts
├── agents.ts           # Agent orchestration
├── ai-models.ts        # AI model configuration
├── cache.ts            # Caching utilities
├── env.ts              # Environment variables
├── github-app.ts       # GitHub App auth
├── github-client.ts    # GitHub API client
├── github.ts           # GitHub utilities
├── logger.ts           # Logging utilities
├── types.ts            # Shared types
├── utils.ts            # General utilities
├── validation.ts       # Validation schemas
└── BEST_PRACTICES.md   # This file
```

## Best Practices

### 1. **Module Organization by Domain**

**Practice:** Group related modules by domain/concern

**Structure:**

```
lib/
├── agent/          # Agent domain
├── db/             # Database domain
├── security/       # Security domain
└── *.ts            # General utilities
```

**Benefits:**

- Clear domain boundaries
- Easier to find related code
- Better code organization

### 2. **Pure Functions**

**Practice:** Keep `lib/` modules pure (no React dependencies)

**Example:**

```typescript
// ✅ Good - Pure function
export function formatDate(date: Date): string {
  return date.toISOString();
}

// ❌ Bad - React dependency
import { useState } from 'react'; // Don't do this in lib/
```

**Benefits:**

- Reusable across contexts
- Easier to test
- No framework coupling

### 3. **File Header Documentation**

**Practice:** Every module has comprehensive header documentation

**Template:**

```typescript
/**
 * ============================================================================
 * MODULE NAME
 * ============================================================================
 *
 * @file src/lib/module-name.ts
 * @module module-name
 * @epic EPIC-ID (if applicable)
 *
 * PURPOSE:
 * Clear description of module purpose.
 *
 * DEPENDENCIES:
 * - @/lib/other-module (What this depends on)
 *
 * RELATED FILES:
 * - src/app/api/endpoint.ts (Files that use this)
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

### 4. **Section-Based Organization**

**Practice:** Use visual section separators

**Example:**

```typescript
// ============================================================================
// SECTION: IMPORTS
// ============================================================================

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

// ============================================================================
// SECTION: MAIN EXPORTS
// ============================================================================
```

### 5. **Singleton Pattern**

**Practice:** Use singleton for shared instances

**Example:**

```typescript
class Logger {
  // Implementation
}

export const logger = new Logger(); // Singleton
```

### 6. **Type Safety**

**Practice:** Use strict TypeScript types

**Example:**

```typescript
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  ttl: number;
}

export function getCacheEntry<T>(key: string): CacheEntry<T> | null {
  // Implementation
}
```

### 7. **Error Handling**

**Practice:** Use custom error classes

**Example:**

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
```

### 8. **Validation with Zod**

**Practice:** Use Zod for runtime validation

**Example:**

```typescript
export const agentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export type AgentMessage = z.infer<typeof agentMessageSchema>;

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors[0].message);
    }
    throw error;
  }
}
```

### 9. **Caching Patterns**

**Practice:** Document caching strategy

**Example:**

```typescript
/**
 * Token cache keyed by installation ID and permissions.
 */
const tokenCache = new Map<string, CachedToken>();

/**
 * Early expiration buffer: expire tokens 60 seconds before actual expiration.
 */
const EARLY_EXPIRATION_BUFFER_MS = 60 * 1000;

function isTokenValid(cached: CachedToken): boolean {
  const now = Date.now();
  const expiresAtWithBuffer = cached.expiresAt - EARLY_EXPIRATION_BUFFER_MS;
  return now < expiresAtWithBuffer;
}
```

### 10. **Environment Variables**

**Practice:** Use `env.ts` for environment variable access

**Example:**

```typescript
// ✅ Good
import { env } from '@/lib/env';
const apiKey = env.GOOGLE_AI_API_KEY;

// ❌ Bad
const apiKey = process.env.GOOGLE_AI_API_KEY; // Don't do this
```

**Benefits:**

- Type safety
- Validation
- Centralized configuration

## Domain-Specific Patterns

### Database Module Pattern

```typescript
/**
 * Database operations for resource.
 */
export async function createResource(userId: string, data: CreateResource): Promise<Resource> {
  // User isolation
  // Validation
  // Create operation
  // Return result
}

export async function getResourceById(id: string, userId: string): Promise<Resource | null> {
  // User isolation
  // Fetch operation
  // Return result
}
```

### Security Module Pattern

```typescript
/**
 * Security policy enforcement.
 */
export function assertPathAllowed(filePath: string): void {
  if (isForbiddenPath(filePath)) {
    throw new SecurityError('Path is forbidden');
  }

  if (!isAllowedPath(filePath)) {
    throw new SecurityError('Path is not whitelisted');
  }
}
```

### Validation Module Pattern

```typescript
/**
 * Validation schema.
 */
export const resourceSchema = z.object({
  // Schema definition
});

export type Resource = z.infer<typeof resourceSchema>;

/**
 * Validate request data.
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  // Validation logic
}
```

## Related Files

- `src/app/api/` - API routes using lib modules
- `src/components/` - Components using lib utilities
- `src/hooks/` - Hooks using lib modules

## Anti-Patterns

### ❌ Don't

- ❌ Import React in `lib/` modules
- ❌ Mix concerns (keep modules focused)
- ❌ Use `any` type
- ❌ Skip error handling
- ❌ Use `process.env` directly (use `@/lib/env`)
- ❌ Create circular dependencies
- ❌ Skip documentation

### ✅ Do

- ✅ Keep modules pure (no React)
- ✅ Organize by domain
- ✅ Use strict TypeScript
- ✅ Document all exports
- ✅ Handle errors properly
- ✅ Use section separators
- ✅ Follow single responsibility

## Module Checklist

Before creating a module:

- [ ] Define clear purpose
- [ ] Add file header documentation
- [ ] Use section separators
- [ ] Define TypeScript types
- [ ] Handle errors properly
- [ ] Document all exports
- [ ] Keep module focused
- [ ] No React dependencies
