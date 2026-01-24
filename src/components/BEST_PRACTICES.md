# Components Best Practices (`src/components/`)

Best practices for React components.

## Directory Purpose

The `components/` directory contains reusable React components. Components are organized into:

- **Feature components** - Application-specific components
- **UI components** (`ui/`) - Reusable UI primitives (shadcn/ui)

## File Structure

```
components/
├── error-boundary.tsx      # Error boundary component
├── providers.tsx           # Context providers wrapper
├── ui/                     # UI component library
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (38 UI components)
└── BEST_PRACTICES.md       # This file
```

## Best Practices

### 1. **Component File Structure**

**Practice:** Consistent structure for all components

**Template:**

````typescript
/**
 * ============================================================================
 * COMPONENT NAME
 * ============================================================================
 *
 * @file src/components/component-name.tsx
 *
 * PURPOSE:
 * Clear description of component purpose.
 *
 * FEATURES:
 * - Feature 1
 * - Feature 2
 *
 * USAGE:
 * ```tsx
 * <ComponentName prop1="value" prop2={value} />
 * ```
 *
 * RELATED FILES:
 * - src/app/page.tsx (Uses this component)
 *
 * ============================================================================
 */

'use client'; // Only if client component

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import React from 'react';
import { Button } from '@/components/ui/button';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

interface ComponentProps {
  /** Prop description */
  prop1: string;

  /** Optional prop description */
  prop2?: number;

  /** Children */
  children?: React.ReactNode;
}

// ============================================================================
// SECTION: COMPONENT
// ============================================================================

export function ComponentName({ prop1, prop2, children }: ComponentProps) {
  // Implementation
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
````

### 2. **Client vs Server Components**

**Practice:** Use Server Components by default, mark Client Components explicitly

**Server Component (default):**

```typescript
// No 'use client' directive
export default async function ServerComponent() {
  // Can use async/await
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Component:**

```typescript
'use client'; // Required directive

import { useState } from 'react';

export function ClientComponent() {
  const [state, setState] = useState();
  // Can use hooks, event handlers, etc.
  return <div>...</div>;
}
```

### 3. **Component Composition**

**Practice:** Compose components from smaller primitives

**Example:**

```typescript
export function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function CardWithButton({ title, buttonText, onClick }: CardWithButtonProps) {
  return (
    <Card title={title}>
      <Button onClick={onClick}>{buttonText}</Button>
    </Card>
  );
}
```

### 4. **Props Interface**

**Practice:** Always define TypeScript interfaces for props

**Example:**

```typescript
interface ButtonProps {
  /** Button text */
  children: React.ReactNode;

  /** Button variant */
  variant?: 'default' | 'outline' | 'destructive';

  /** Click handler */
  onClick?: () => void;

  /** Disabled state */
  disabled?: boolean;
}
```

### 5. **Error Boundaries**

**Practice:** Use error boundaries for graceful error handling

**Example (`error-boundary.tsx`):**

- Catches React component errors
- Displays user-friendly error UI
- Provides recovery options
- Logs errors for debugging

**Usage:**

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 6. **UI Component Library**

**Practice:** Use shadcn/ui components from `ui/` directory

**Benefits:**

- Consistent design system
- Accessible components
- Customizable
- Type-safe

**Example:**

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
```

### 7. **Styling**

**Practice:** Use Tailwind CSS classes

**Example:**

```typescript
<div className="flex items-center justify-center p-4 bg-background">
  <Card className="w-full max-w-md">
    {/* Content */}
  </Card>
</div>
```

### 8. **Accessibility**

**Practice:** Follow accessibility best practices

**Examples:**

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Maintain focus management
- Use proper heading hierarchy

### 9. **Component Organization**

**Practice:** Organize components by feature/domain

**Structure:**

```
components/
├── feature/          # Feature-specific components
│   ├── agent-card.tsx
│   └── session-list.tsx
├── ui/              # Reusable UI primitives
│   └── ...
└── shared/          # Shared components
    └── ...
```

### 10. **Props Documentation**

**Practice:** Document all props with JSDoc comments

**Example:**

```typescript
interface ComponentProps {
  /** Primary text content */
  title: string;

  /** Optional description text */
  description?: string;

  /** Callback fired on click */
  onClick?: () => void;
}
```

## UI Component Patterns

### Pattern 1: Button Component

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('button', variant, size, className)}
        {...props}
      />
    );
  }
);
```

### Pattern 2: Card Component

```typescript
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('card', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: CardHeaderProps) {
  return <div className="card-header">{children}</div>;
}

export function CardContent({ children }: CardContentProps) {
  return <div className="card-content">{children}</div>;
}
```

### Pattern 3: Dialog Component

```typescript
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  return <DialogPrimitive.Trigger>{children}</DialogPrimitive.Trigger>;
}
```

## Related Files

- `src/app/` - Pages using components
- `src/hooks/` - Hooks used by components
- `src/lib/` - Utilities used by components

## Anti-Patterns

### ❌ Don't

- ❌ Mix Server and Client Component code
- ❌ Use inline styles (use Tailwind classes)
- ❌ Create components without TypeScript types
- ❌ Skip accessibility considerations
- ❌ Hardcode values (use props)
- ❌ Create components that are too large (split into smaller components)
- ❌ Use `any` type for props

### ✅ Do

- ✅ Mark Client Components with `'use client'`
- ✅ Use TypeScript for all props
- ✅ Compose components from smaller pieces
- ✅ Follow accessibility guidelines
- ✅ Use Tailwind CSS for styling
- ✅ Document component purpose and usage
- ✅ Keep components focused and small

## Component Checklist

Before creating a component:

- [ ] Define TypeScript interface for props
- [ ] Add JSDoc comments
- [ ] Mark as `'use client'` if needed
- [ ] Use semantic HTML
- [ ] Add accessibility attributes
- [ ] Use Tailwind classes for styling
- [ ] Test component in isolation
- [ ] Document usage examples
