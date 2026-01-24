# Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Storage Architecture](#storage-architecture)
- [Error Handling](#error-handling)
- [Observability](#observability)
- [Performance Considerations](#performance-considerations)
- [Scalability](#scalability)
- [Design Decisions](#design-decisions)
- [Module Dependencies](#module-dependencies)
- [Testing Architecture](#testing-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Related Documentation](#related-documentation)

---

## Overview

Firebase Studio is a Next.js application that provides AI-powered agent sessions and GitHub repository management. The application follows a server-side architecture with client-side React components.

## Technology Stack

- **Framework:** Next.js 15.3.8 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 18.3.1
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js 4.24.13
- **AI Integration:** Google Genkit 1.20.0
- **GitHub Integration:** Octokit (@octokit/auth-app, @octokit/rest)
- **Validation:** Zod 3.24.2
- **UI Components:** Radix UI (shadcn/ui)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │    Hooks     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (API Routes)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Sessions    │  │   Agents     │  │   GitHub    │     │
│  │    API       │  │     API      │  │     API     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Database   │    │  AI Models   │    │ GitHub API   │
│  (File-based)│    │  (Genkit)    │    │  (Octokit)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── sessions/       # Session management endpoints
│   │   ├── agents/         # AI agent endpoints
│   │   ├── github/         # GitHub integration endpoints
│   │   └── auth/           # Authentication endpoints
│   ├── agents/             # Agent pages
│   ├── repositories/       # Repository pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # UI component library
│   ├── error-boundary.tsx  # Error boundary
│   └── providers.tsx       # Context providers
├── lib/                    # Core libraries
│   ├── db/                 # Database operations
│   ├── agent/              # Agent types and logic
│   ├── security/           # Security modules
│   ├── github-app.ts       # GitHub App auth
│   ├── github-client.ts    # GitHub API client
│   ├── validation.ts       # Validation schemas
│   └── logger.ts           # Logging utilities
├── hooks/                  # React hooks
├── types/                  # TypeScript type definitions
└── ai/                     # AI/Genkit integration
```

## Core Components

### 1. Session Management

**Location:** `src/lib/db/agent-sessions.ts`

- **Storage:** File-based JSON storage (`.data/agent-sessions.json`)
- **Caching:** In-memory cache for performance
- **Concurrency:** Write queue for safe concurrent writes
- **Features:**
  - CRUD operations
  - State machine enforcement
  - Step timeline management
  - User isolation
  - Kill-switch (read-only mode)

**State Machine:**
```
created → planning → preview_ready → awaiting_approval → applying → applied
   ↓         ↓            ↓                ↓              ↓
 failed    failed       failed          failed        failed
   │
   └──→ planning (retry)
```

### 2. Authentication

**Location:** `src/app/api/auth/[...nextauth]/route.ts`

- **Provider:** NextAuth.js**
- **Method:** GitHub OAuth
- **Session:** Server-side session cookies
- **User ID:** Email (primary) or name (fallback)

### 3. GitHub Integration

**Location:** `src/lib/github-app.ts`, `src/lib/github-client.ts`

- **Authentication:** GitHub App JWT + Installation tokens
- **Token Caching:** In-memory cache with 60s early expiration
- **Permissions:** Reader (read-only) and Actor (write) tokens
- **API Client:** Octokit REST API

### 4. AI Integration

**Location:** `src/ai/genkit.ts`

- **Framework:** Google Genkit
- **Models:** Multi-model support (Google AI, OpenAI, Anthropic)
- **Default Model:** `googleai/gemini-2.5-flash`
- **Features:**
  - Non-streaming chat
  - Streaming chat (SSE)
  - Request timeout protection (30s)

### 5. Path Policy

**Location:** `src/lib/security/path-policy.ts`

- **Purpose:** Enforce repository file path restrictions
- **Model:** Fail-closed (reject by default)
- **Features:**
  - Allowlist enforcement
  - Forbidden paths blocking
  - Override mechanisms (with explicit flags)

## Data Flow

### Session Creation Flow

```
User → POST /api/sessions
  → Validate request (Zod)
  → Authenticate (NextAuth)
  → Create session (agent-sessions.ts)
  → Persist to file
  → Return session
```

### Chat Flow

```
User → POST /api/agents/chat
  → Authenticate
  → Validate messages
  → Generate AI response (Genkit)
  → (Optional) Persist to session
  → Return response
```

### GitHub Repository Access Flow

```
User → GET /api/github/repositories
  → Authenticate (NextAuth)
  → Get GitHub OAuth token
  → Call GitHub API (Octokit)
  → Cache response
  → Return repositories
```

## Security Architecture

### Authentication Layers

1. **NextAuth Session:** Browser-based authentication
2. **GitHub OAuth:** For GitHub API access
3. **GitHub App JWT:** For installation token generation

### Authorization

- **User Isolation:** All queries filtered by `userId`
- **Path Policy:** Repository file access restrictions
- **Kill-Switch:** Read-only mode for emergency stops

### Data Protection

- **Secrets Management:** Environment variables only
- **No Secrets in Logs:** Structured logging excludes sensitive data
- **Fail-Closed:** Default deny for security checks

## Storage Architecture

### Session Storage

- **Format:** JSON file (`.data/agent-sessions.json`)
- **Structure:**
  ```json
  {
    "sessions": [
      {
        "id": "uuid",
        "userId": "user@example.com",
        "name": "Session Name",
        "state": "created",
        "messages": [],
        "steps": [],
        ...
      }
    ]
  }
  ```
- **Persistence:** File-based, survives process restarts
- **Concurrency:** Write queue prevents race conditions

### Caching

- **Session Cache:** In-memory cache for reads
- **GitHub API Cache:** 5-minute TTL for repository data
- **Token Cache:** Installation tokens with expiration tracking

## Error Handling

### Error Types

1. **ValidationError:** Input validation failures
2. **GitHubAPIError:** GitHub API failures
3. **AIAPIError:** AI model API failures
4. **Generic Errors:** Unexpected server errors

### Error Flow

```
Error occurs
  → Log error (structured logging)
  → Return appropriate HTTP status
  → Include error message (sanitized)
```

## Observability

### Logging

- **Structured Logging:** JSON format with context
- **Log Levels:** debug, info, warn, error
- **Context:** Session ID, user ID, request metadata
- **Location:** `src/lib/logger.ts`

### Correlation

- **Session ID:** Tracks session lifecycle
- **User ID:** Tracks user actions
- **Request ID:** (Planned) Track request flow

## Performance Considerations

### Caching Strategy

- **Session Cache:** Reduces file I/O
- **GitHub API Cache:** Reduces external API calls
- **Token Cache:** Reduces authentication overhead

### Optimization

- **Write Queue:** Serializes writes to prevent corruption
- **Lazy Loading:** Components loaded on demand
- **Streaming:** SSE for real-time AI responses

## Scalability

### Current Limitations

- **File-based Storage:** Not suitable for high concurrency
- **In-memory Cache:** Lost on restart
- **Single Process:** No horizontal scaling

### Future Improvements

- **Database Migration:** Move to PostgreSQL/MongoDB
- **Redis Cache:** Distributed caching
- **Horizontal Scaling:** Multi-instance support
- **Queue System:** Background job processing

## Design Decisions

### Why File-based Storage?

- **Simplicity:** No database setup required
- **Portability:** Easy to backup/restore
- **Development:** Fast iteration
- **Future:** Easy migration path to database

### Why Next.js App Router?

- **Modern:** Latest Next.js features
- **Server Components:** Better performance
- **API Routes:** Integrated API endpoints
- **Type Safety:** Full TypeScript support

### Why Genkit?

- **Multi-model:** Support for multiple AI providers
- **Type-safe:** TypeScript integration
- **Streaming:** Built-in streaming support
- **Google Integration:** Native Google AI support

## Module Dependencies

```
app/
  ├── api/
  │   ├── sessions/ → lib/db/agent-sessions
  │   ├── agents/ → ai/genkit
  │   └── github/ → lib/github-client
  └── pages/ → components/

lib/
  ├── db/agent-sessions → lib/agent/session-types
  ├── github-app → lib/security/secrets
  └── validation → lib/types

components/ → hooks/
```

## Testing Architecture

- **Unit Tests:** Individual module testing
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Full user flow testing
- **Security Tests:** Adversarial testing
- **Performance Tests:** Load and stress testing

See [TESTING.md](./TESTING.md) for details.

## Deployment Architecture

### Development

- **Server:** Next.js dev server (port 9002)
- **Storage:** Local file system
- **Cache:** In-memory

### Production (Planned)

- **Server:** Next.js production server
- **Storage:** Database (PostgreSQL/MongoDB)
- **Cache:** Redis
- **CDN:** Static asset delivery
- **Monitoring:** Error tracking, metrics

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

## Related Documentation

- **[API.md](./API.md)** - API endpoint architecture
- **[DATABASE.md](./DATABASE.md)** - Data architecture
- **[SECURITY.md](./SECURITY.md)** - Security architecture
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment architecture
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance architecture
- **[MONITORING.md](./MONITORING.md)** - Observability architecture

## Architecture Decision Records (ADRs)

### ADR-001: File-based Storage

**Decision:** Use file-based JSON storage initially

**Rationale:**
- Simplicity: No database setup required
- Portability: Easy to backup/restore
- Development: Fast iteration
- Future: Easy migration path to database

**Alternatives Considered:**
- PostgreSQL: Too complex for MVP
- MongoDB: Requires infrastructure
- SQLite: File-based but more complex

**Status:** Implemented, migration path planned

### ADR-002: Next.js App Router

**Decision:** Use Next.js App Router (not Pages Router)

**Rationale:**
- Modern: Latest Next.js features
- Server Components: Better performance
- API Routes: Integrated API endpoints
- Type Safety: Full TypeScript support

**Status:** Implemented

### ADR-003: Google Genkit

**Decision:** Use Google Genkit for AI integration

**Rationale:**
- Multi-model: Support for multiple AI providers
- Type-safe: TypeScript integration
- Streaming: Built-in streaming support
- Google Integration: Native Google AI support

**Status:** Implemented
