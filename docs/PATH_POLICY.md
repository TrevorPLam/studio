# Path Policy Documentation

## Table of Contents

- [Overview](#overview)
- [Purpose](#purpose)
- [Policy Rules](#policy-rules)
- [Usage](#usage)
- [Override Mechanisms](#override-mechanisms)
- [Path Normalization](#path-normalization)
- [Security Considerations](#security-considerations)
- [Implementation Details](#implementation-details)
- [Testing](#testing)
- [Integration](#integration)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Future Enhancements](#future-enhancements)
- [Related Documentation](#related-documentation)

---

## Overview

The path policy module enforces security restrictions on repository file paths that can be modified by the agent system. It follows a **fail-closed** security model: reject by default, require explicit approval for risky operations.

## Purpose

- **Prevent Unauthorized Changes:** Block modifications to critical files
- **Enforce Allowlist:** Only allow changes to approved paths
- **Security:** Protect configuration files, lockfiles, and workflows

## Policy Rules

### Allowed Paths

Files matching these prefixes are **allowed**:

- `docs/` - Documentation files
- `.repo/` - Repository-specific files
- `README.md` - Root README file

**Examples:**
- ✅ `docs/guide.md`
- ✅ `docs/subfolder/file.md`
- ✅ `.repo/config.json`
- ✅ `README.md`

### Forbidden Paths

Files matching these patterns are **forbidden** (cannot be modified):

- `.github/workflows/` - GitHub Actions workflows
- `package.json` - Package configuration
- `package-lock.json` - npm lockfile
- `yarn.lock` - Yarn lockfile
- `pnpm-lock.yaml` - pnpm lockfile
- `pnpm-lock.yml` - pnpm lockfile (alternative)
- `.env` - Environment variables
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables
- `.env.development` - Development environment variables

**Examples:**
- ❌ `package.json`
- ❌ `.github/workflows/ci.yml`
- ❌ `package-lock.json`
- ❌ `.env`

### Not Whitelisted

Paths that don't match allowed prefixes are **blocked**:

- ❌ `src/components/Button.tsx`
- ❌ `lib/utils.ts`
- ❌ `app/page.tsx`

## Usage

### Basic Usage

```typescript
import { assertPathAllowed } from '@/lib/security/path-policy';

const result = assertPathAllowed('docs/guide.md');
if (!result.allowed) {
  throw new Error(result.reason);
}
```

### Validation (Throws Error)

```typescript
import { validatePath } from '@/lib/security/path-policy';

// Throws error if not allowed
validatePath('docs/guide.md');
```

### Validate Multiple Paths

```typescript
import { validatePaths } from '@/lib/security/path-policy';

// Validates all paths, throws if any invalid
validatePaths([
  'docs/file1.md',
  'docs/file2.md'
]);
```

### Check Path Status

```typescript
import { isAllowedPath, isForbiddenPath } from '@/lib/security/path-policy';

if (isAllowedPath('docs/file.md')) {
  // Path is in allowlist
}

if (isForbiddenPath('package.json')) {
  // Path is forbidden
}
```

## Override Mechanisms

### Allow Forbidden Paths

**⚠️ Use with caution - requires explicit user approval**

```typescript
const result = assertPathAllowed('package.json', {
  allowForbidden: true
});
// result.allowed === true
```

### Allow Non-Whitelisted Paths

**⚠️ Use with caution - requires explicit user approval**

```typescript
const result = assertPathAllowed('src/components/Button.tsx', {
  allowNonWhitelisted: true
});
// result.allowed === true
```

### Combined Overrides

```typescript
const result = assertPathAllowed('package.json', {
  allowForbidden: true,
  allowNonWhitelisted: true
});
```

## Path Normalization

Paths are automatically normalized:

- **Leading/trailing slashes:** Removed
- **Windows separators:** Converted to `/`
- **Empty strings:** Rejected

**Examples:**
- `/docs/file.md` → `docs/file.md`
- `docs\\file.md` → `docs/file.md`
- `docs/file.md/` → `docs/file.md`

## Security Considerations

### Fail-Closed Model

- **Default:** Reject all paths
- **Explicit Approval:** Required for overrides
- **No Bypass:** Path normalization prevents bypass attempts

### Bypass Prevention

Path normalization prevents common bypass attempts:

- ❌ `docs/../package.json` → Normalized and rejected
- ❌ `docs/./../.github/workflows/ci.yml` → Normalized and rejected
- ❌ `.repo/../../package.json` → Normalized and rejected

## Implementation Details

### Module Location

`src/lib/security/path-policy.ts`

### Key Functions

```typescript
// Check if path is allowed (returns result object)
assertPathAllowed(filePath: string, options?: PathPolicyOptions): PathPolicyResult

// Validate path (throws error if not allowed)
validatePath(filePath: string, options?: PathPolicyOptions): void

// Validate multiple paths (throws if any invalid)
validatePaths(filePaths: string[], options?: PathPolicyOptions): void

// Check if path is forbidden
isForbiddenPath(filePath: string): boolean

// Check if path is allowed
isAllowedPath(filePath: string): boolean
```

### Type Definitions

```typescript
interface PathPolicyOptions {
  allowForbidden?: boolean;
  allowNonWhitelisted?: boolean;
}

interface PathPolicyResult {
  allowed: boolean;
  reason?: string;
}
```

## Testing

### Unit Tests

See `tests/unit/lib/security/path-policy.test.ts` for comprehensive tests.

### Test Cases

- ✅ Allows `docs/` prefix
- ✅ Allows `.repo/` prefix
- ✅ Allows `README.md`
- ❌ Rejects `package.json`
- ❌ Rejects `.github/workflows/`
- ❌ Rejects non-whitelisted paths
- ✅ Override mechanisms work
- ✅ Path normalization works

## Integration

### Preview/Apply Endpoints

Path policy will be enforced at preview and apply endpoints (when implemented):

```typescript
// Future implementation
export async function POST(request: NextRequest) {
  const { filePaths } = await request.json();
  
  // Validate all paths
  validatePaths(filePaths);
  
  // Continue with preview/apply
}
```

## Configuration

### Modifying Allowed Paths

Edit `src/lib/security/path-policy.ts`:

```typescript
export const ALLOWED_PREFIXES = [
  'docs/',
  '.repo/',
  'README.md',
  // Add new allowed paths here
];
```

### Modifying Forbidden Paths

Edit `src/lib/security/path-policy.ts`:

```typescript
export const FORBIDDEN_PREFIXES = [
  '.github/workflows/',
  'package.json',
  // Add new forbidden paths here
];
```

## Best Practices

### When to Use Overrides

- **User Approval:** Only when user explicitly approves
- **Admin Operations:** For administrative tasks
- **Emergency Fixes:** With proper documentation

### When NOT to Use Overrides

- ❌ Default behavior
- ❌ Automated operations
- ❌ Without user consent

## Examples

### Example 1: Valid Path

```typescript
import { validatePath } from '@/lib/security/path-policy';

// This will succeed
validatePath('docs/guide.md');
```

### Example 2: Invalid Path

```typescript
import { validatePath } from '@/lib/security/path-policy';

// This will throw error
try {
  validatePath('package.json');
} catch (error) {
  // Error: Path "package.json" is in the forbidden list
}
```

### Example 3: With Override

```typescript
import { validatePath } from '@/lib/security/path-policy';

// This will succeed with override
validatePath('package.json', {
  allowForbidden: true // User explicitly approved
});
```

### Example 4: Multiple Paths

```typescript
import { validatePaths } from '@/lib/security/path-policy';

// All paths must be valid
validatePaths([
  'docs/file1.md',
  'docs/file2.md',
  '.repo/config.json'
]);
```

## Future Enhancements

- **Per-Repository Policies:** Custom policies per repository
- **Policy Inheritance:** Inherit from organization/global policies
- **Policy UI:** Admin interface for managing policies
- **Audit Logging:** Log all policy decisions

## Related Documentation

- **[SECURITY.md](./SECURITY.md)** - Security overview
- **[API.md](./API.md)** - API documentation (when preview/apply endpoints are added)
- **[DATABASE.md](./DATABASE.md)** - Data security

## Path Policy Decision Tree

```
Input: filePath
    │
    ▼
Normalize Path
    │
    ├─→ Empty? ──→ ❌ Reject
    │
    ├─→ Forbidden? ──→ ❌ Reject (unless allowForbidden=true)
    │
    ├─→ Allowed? ──→ ✅ Allow
    │
    └─→ Not Whitelisted? ──→ ❌ Reject (unless allowNonWhitelisted=true)
```

## Policy Enforcement Flow

```
User Request
    │
    ▼
Path Policy Check
    │
    ├─→ Allowed ──→ ✅ Continue
    │
    ├─→ Forbidden ──→ ❌ Block (unless override)
    │
    └─→ Not Whitelisted ──→ ❌ Block (unless override)
```
