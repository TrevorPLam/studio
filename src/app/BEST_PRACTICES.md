# App Directory Best Practices (`src/app/`)

Best practices for Next.js App Router pages and API routes.

## Directory Purpose

The `app/` directory follows Next.js App Router conventions. It contains:

- **Pages** (`page.tsx`) - React Server Components
- **API Routes** (`route.ts`) - API endpoints
- **Layouts** (`layout.tsx`) - Shared layouts
- **Assets** - Static files (CSS, images, etc.)

## File Structure

```
app/
├── page.tsx                    # Home page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── favicon.ico                 # Favicon
├── agents/                     # Agent pages
│   ├── page.tsx               # Agents listing
│   └── [id]/                  # Dynamic route
│       └── page.tsx           # Agent detail
├── repositories/               # Repository pages
│   ├── page.tsx               # Repositories listing
│   └── [owner]/[repo]/        # Nested dynamic routes
│       └── page.tsx           # Repository detail
└── api/                        # API routes
    ├── sessions/               # Session endpoints
    ├── agents/                 # Agent endpoints
    ├── github/                 # GitHub endpoints
    └── auth/                   # Authentication
```

## Best Practices

### 1. **Page Components (`page.tsx`)**

**Practice:** Use Server Components by default

**Example:**

```typescript
/**
 * Agent detail page.
 *
 * @route /agents/[id]
 */
export default async function AgentPage({ params }: { params: { id: string } }) {
  // Server Component - can use async/await
  const session = await getServerSession(authOptions);
  const agent = await getAgentById(params.id);

  return <AgentDetail agent={agent} />;
}
```

**Benefits:**

- Better performance (no client-side JS)
- Direct database access
- SEO-friendly

### 2. **API Routes (`route.ts`)**

**Practice:** Follow consistent structure for all API routes

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
 * Description of endpoint purpose.
 *
 * ENDPOINTS:
 * - GET /api/endpoint - Description
 * - POST /api/endpoint - Description
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 * - User isolation enforced
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

function getUserId(session: Session | null): string | null {
  return session?.user?.email || session?.user?.name || null;
}

// ============================================================================
// SECTION: API HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    // Error handling
  }
}
```

### 3. **Authentication**

**Practice:** Always check authentication in API routes

**Example:**

```typescript
const session = await getServerSession(authOptions);
const userId = getUserId(session);

if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 4. **Request Validation**

**Practice:** Validate all requests with Zod schemas

**Example:**

```typescript
import { validateRequest } from '@/lib/validation';
import { createAgentSessionSchema } from '@/lib/validation';

const body = await request.json();
const validated = validateRequest(createAgentSessionSchema, body);
```

### 5. **Error Handling**

**Practice:** Consistent error handling with proper HTTP status codes

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

  logger.error('API error', error as Error, { endpoint: '/api/sessions' });
  return NextResponse.json(
    { error: 'InternalServerError', message: 'An error occurred' },
    { status: 500 }
  );
}
```

### 6. **Dynamic Routes**

**Practice:** Use TypeScript for route parameters

**Example:**

```typescript
// app/agents/[id]/page.tsx
interface PageProps {
  params: {
    id: string;
  };
}

export default async function AgentPage({ params }: PageProps) {
  const { id } = params;
  // Use id
}
```

### 7. **Nested Dynamic Routes**

**Practice:** Type nested route parameters correctly

**Example:**

```typescript
// app/repositories/[owner]/[repo]/page.tsx
interface PageProps {
  params: {
    owner: string;
    repo: string;
  };
}

export default async function RepositoryPage({ params }: PageProps) {
  const { owner, repo } = params;
  // Use owner and repo
}
```

### 8. **Layout Components**

**Practice:** Use layouts for shared UI

**Example:**

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 9. **Streaming Responses**

**Practice:** Use Server-Sent Events for streaming

**Example:**

```typescript
export async function POST(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      // Stream data
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### 10. **Route Organization**

**Practice:** Organize routes by domain/resource

**Structure:**

```
api/
├── sessions/          # Session-related endpoints
├── agents/            # Agent-related endpoints
├── github/            # GitHub-related endpoints
└── auth/              # Authentication endpoints
```

## File Naming Conventions

| File Type | Naming          | Example                     |
| --------- | --------------- | --------------------------- |
| Page      | `page.tsx`      | `app/agents/page.tsx`       |
| API Route | `route.ts`      | `app/api/sessions/route.ts` |
| Layout    | `layout.tsx`    | `app/layout.tsx`            |
| Loading   | `loading.tsx`   | `app/agents/loading.tsx`    |
| Error     | `error.tsx`     | `app/agents/error.tsx`      |
| Not Found | `not-found.tsx` | `app/agents/not-found.tsx`  |

## Related Files

- `src/lib/db/agent-sessions.ts` - Database operations
- `src/lib/validation.ts` - Request validation
- `src/lib/logger.ts` - Logging utilities
- `src/components/` - React components

## Anti-Patterns

### ❌ Don't

- ❌ Use Client Components when Server Components work
- ❌ Skip authentication checks
- ❌ Skip request validation
- ❌ Use relative imports (use `@/` alias)
- ❌ Mix API logic with business logic
- ❌ Hardcode error messages
- ❌ Skip error handling

### ✅ Do

- ✅ Use Server Components by default
- ✅ Always check authentication
- ✅ Validate all requests
- ✅ Use proper HTTP status codes
- ✅ Log errors with context
- ✅ Keep API routes thin (delegate to `lib/`)
- ✅ Use TypeScript for route params

## Common Patterns

### Pattern 1: List Endpoint

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await listItems(userId);
  return NextResponse.json({ items });
}
```

### Pattern 2: Create Endpoint

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = validateRequest(createSchema, body);

  const item = await createItem(userId, validated);
  return NextResponse.json(item, { status: 201 });
}
```

### Pattern 3: Detail Endpoint

```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const item = await getItemById(params.id, userId);

  if (!item) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json(item);
}
```
