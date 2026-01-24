# Types Directory Best Practices (`src/types/`)

Best practices for TypeScript type definitions and extensions.

## Directory Purpose

The `types/` directory contains:

- TypeScript type extensions for third-party libraries
- Global type definitions
- Framework-specific type augmentations

## File Structure

```
types/
├── next-auth.d.ts      # NextAuth type extensions
└── BEST_PRACTICES.md   # This file
```

## Best Practices

### 1. **Type Extension Files**

**Practice:** Use `.d.ts` extension for type declaration files

**Example:**

```typescript
// types/next-auth.d.ts
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }
}
```

### 2. **Module Augmentation**

**Practice:** Extend third-party types using module augmentation

**Template:**

```typescript
/**
 * Type extensions for [Library Name].
 *
 * @file src/types/library-name.d.ts
 */

declare module 'library-name' {
  interface ExistingInterface {
    /** New property */
    newProperty?: string;
  }

  // New types
  interface NewType {
    // Type definition
  }
}
```

### 3. **Global Types**

**Practice:** Use global type declarations when appropriate

**Example:**

```typescript
// types/global.d.ts
declare global {
  interface Window {
    customProperty: string;
  }
}

export {}; // Make this a module
```

### 4. **Type Organization**

**Practice:** Keep types organized by library/domain

**Structure:**

```
types/
├── next-auth.d.ts      # NextAuth extensions
├── global.d.ts         # Global types
└── custom.d.ts         # Custom type definitions
```

### 5. **Documentation**

**Practice:** Document type extensions

**Example:**

```typescript
/**
 * NextAuth type extensions.
 *
 * Extends NextAuth Session interface with custom properties.
 *
 * @file src/types/next-auth.d.ts
 */

declare module 'next-auth' {
  /**
   * Extended Session interface.
   */
  interface Session {
    /** Custom user ID */
    userId?: string;

    /** Custom properties */
    customData?: Record<string, unknown>;
  }
}
```

## Related Files

- `src/lib/types.ts` - Shared application types
- `src/lib/agent/session-types.ts` - Domain-specific types

## Anti-Patterns

### ❌ Don't

- ❌ Put business logic types here (use `lib/types.ts`)
- ❌ Create duplicate type definitions
- ❌ Use `any` type
- ❌ Skip module augmentation syntax

### ✅ Do

- ✅ Use `.d.ts` extension
- ✅ Use module augmentation for third-party types
- ✅ Document type extensions
- ✅ Keep types organized
- ✅ Use TypeScript strictly
