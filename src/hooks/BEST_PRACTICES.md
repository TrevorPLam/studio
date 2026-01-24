# Hooks Best Practices (`src/hooks/`)

Best practices for React hooks.

## Directory Purpose

The `hooks/` directory contains reusable React hooks. Hooks encapsulate stateful logic that can be shared across components.

## File Structure

```
hooks/
├── use-toast.ts         # Toast notification hook
├── use-mobile.tsx      # Mobile device detection hook
└── BEST_PRACTICES.md   # This file
```

## Best Practices

### 1. **Hook File Structure**

**Practice:** Consistent structure for all hooks

**Template:**

````typescript
/**
 * ============================================================================
 * HOOK NAME
 * ============================================================================
 *
 * @file src/hooks/use-hook-name.ts
 *
 * PURPOSE:
 * Description of hook purpose and functionality.
 *
 * FEATURES:
 * - Feature 1
 * - Feature 2
 *
 * USAGE:
 * ```tsx
 * const { value, setValue } = useHookName();
 * ```
 *
 * RELATED FILES:
 * - src/components/component.tsx (Uses this hook)
 *
 * ============================================================================
 */

'use client'; // Required for hooks

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import { useState, useEffect } from 'react';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

interface HookReturn {
  /** Return value description */
  value: string;

  /** Setter function */
  setValue: (value: string) => void;
}

interface HookOptions {
  /** Optional configuration */
  option?: boolean;
}

// ============================================================================
// SECTION: HOOK
// ============================================================================

/**
 * Hook description.
 *
 * @param options - Optional configuration
 * @returns Hook return value
 *
 * @example
 * ```tsx
 * const { value, setValue } = useHookName({ option: true });
 * ```
 */
export function useHookName(options?: HookOptions): HookReturn {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    // Effect logic
  }, []);

  return { value, setValue };
}
````

### 2. **Hook Naming**

**Practice:** Always prefix hooks with `use`

**Examples:**

- ✅ `useToast`
- ✅ `useMobile`
- ✅ `useSession`
- ❌ `toast` (not a hook)
- ❌ `getMobile` (not a hook)

### 3. **Custom Hook Return Types**

**Practice:** Define explicit return types for hooks

**Example:**

```typescript
interface UseToastReturn {
  toast: (props: ToastProps) => string;
  dismiss: (toastId: string) => void;
  toasts: Toast[];
}

export function useToast(): UseToastReturn {
  // Implementation
}
```

### 4. **State Management**

**Practice:** Use appropriate React hooks for state

**Examples:**

- `useState` - Local component state
- `useReducer` - Complex state logic
- `useContext` - Shared state
- `useRef` - Mutable values that don't trigger re-renders

### 5. **Effect Dependencies**

**Practice:** Always include all dependencies in useEffect

**Example:**

```typescript
useEffect(() => {
  // Effect logic using value and otherValue
}, [value, otherValue]); // Include all dependencies
```

### 6. **Cleanup in Effects**

**Practice:** Clean up subscriptions and timers

**Example:**

```typescript
useEffect(() => {
  const subscription = subscribe();
  const timer = setInterval(() => {}, 1000);

  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

### 7. **Memoization**

**Practice:** Use `useMemo` and `useCallback` when appropriate

**Example:**

```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(dep1, dep2);
}, [dep1, dep2]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 8. **Hook Composition**

**Practice:** Compose hooks from other hooks

**Example:**

```typescript
export function useSession() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const userId = session?.user?.email;

  return { session, isAuthenticated, userId };
}
```

### 9. **Error Handling**

**Practice:** Handle errors in hooks gracefully

**Example:**

```typescript
export function useData(id: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await fetchDataById(id);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return { data, error, loading };
}
```

### 10. **TypeScript Types**

**Practice:** Use strict TypeScript types

**Example:**

```typescript
interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: T;
}

interface UseApiReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

export function useApi<T>(options: UseApiOptions<T>): UseApiReturn<T> {
  // Implementation
}
```

## Common Hook Patterns

### Pattern 1: State Hook

```typescript
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle] as const;
}
```

### Pattern 2: Effect Hook

```typescript
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
```

### Pattern 3: Async Hook

```typescript
export function useAsync<T>(asyncFunction: () => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    asyncFunction()
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => setState({ data: null, error, loading: false }));
  }, [asyncFunction]);

  return state;
}
```

## Related Files

- `src/components/` - Components using hooks
- `src/app/` - Pages using hooks

## Anti-Patterns

### ❌ Don't

- ❌ Forget `'use client'` directive
- ❌ Use hooks conditionally
- ❌ Skip dependency arrays
- ❌ Forget cleanup in effects
- ❌ Use `any` type
- ❌ Create hooks that are too complex (split into smaller hooks)
- ❌ Mix hook logic with component logic

### ✅ Do

- ✅ Always prefix with `use`
- ✅ Define return types
- ✅ Include all dependencies
- ✅ Clean up effects
- ✅ Use TypeScript strictly
- ✅ Keep hooks focused
- ✅ Document hook purpose and usage

## Hook Checklist

Before creating a hook:

- [ ] Prefix name with `use`
- [ ] Add `'use client'` directive
- [ ] Define TypeScript return type
- [ ] Document hook purpose
- [ ] Include all dependencies in effects
- [ ] Clean up subscriptions/timers
- [ ] Handle errors gracefully
- [ ] Provide usage examples
