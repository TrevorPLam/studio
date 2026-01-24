# Pages Directory Best Practices (`src/pages/`)

Best practices for the legacy Pages Router directory.

## Directory Purpose

The `pages/` directory is the **legacy** Next.js Pages Router. This directory should be **minimized** in favor of the App Router (`src/app/`).

## Current Status

**Minimal Usage:** Only contains `_document.js` for custom document configuration.

## Best Practices

### 1. **Prefer App Router**

**Practice:** Use `src/app/` instead of `src/pages/`

**Why:**

- App Router is the modern approach
- Better performance with Server Components
- More features and flexibility
- Better TypeScript support

### 2. **Migration Strategy**

**Practice:** Migrate existing pages to App Router

**Migration Path:**

```
pages/index.js          → app/page.tsx
pages/about.js          → app/about/page.tsx
pages/api/endpoint.js    → app/api/endpoint/route.ts
```

### 3. **Legacy File Maintenance**

**Practice:** If you must use Pages Router, follow conventions

**File Naming:**

- `index.js` - Home page
- `[id].js` - Dynamic route
- `[...slug].js` - Catch-all route
- `_app.js` - Custom App component
- `_document.js` - Custom Document

### 4. **Documentation**

**Practice:** Document why Pages Router is used (if needed)

**Example:**

```javascript
/**
 * Legacy Pages Router file.
 *
 * TODO: Migrate to App Router (app/page.tsx)
 *
 * Reason for keeping: [explain if necessary]
 */
```

## Related Files

- `src/app/` - Modern App Router (preferred)
- `src/components/` - Shared components

## Recommendation

**Minimize or eliminate** the `pages/` directory. All new development should use the App Router in `src/app/`.
