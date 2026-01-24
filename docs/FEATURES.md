# Features Documentation

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
  - [Agent Sessions](#1-agent-sessions)
  - [AI Chat](#2-ai-chat)
  - [GitHub Integration](#3-github-integration)
  - [Session State Management](#4-session-state-management)
  - [Step Timeline](#5-step-timeline)
  - [Path Policy](#6-path-policy)
- [Planned Features](#planned-features)
- [Feature Usage Examples](#feature-usage-examples)
- [Feature Roadmap](#feature-roadmap)
- [Related Documentation](#related-documentation)

---

## Overview

Firebase Studio provides AI-powered agent sessions and GitHub repository management capabilities.

## Core Features

### 1. Agent Sessions

**Purpose:** Create and manage AI agent task executions.

**Key Capabilities:**
- Create sessions with goals
- Track session state through lifecycle
- Store conversation history
- Manage execution steps
- Retry failed sessions

**User Flow:**
1. User creates session with goal
2. Session moves through states: created → planning → preview_ready → awaiting_approval → applying → applied
3. User can view session history and steps
4. User can retry failed sessions

**API Endpoints:**
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/[id]` - Get session
- `PATCH /api/sessions/[id]` - Update session

See [API.md](./API.md) for details.

### 2. AI Chat

**Purpose:** Interact with AI models for assistance.

**Key Capabilities:**
- Non-streaming chat responses
- Streaming chat responses (SSE)
- Multiple AI model support
- Session persistence
- Request timeout protection

**User Flow:**
1. User sends message
2. AI generates response
3. Response returned (streaming or complete)
4. Optionally persisted to session

**API Endpoints:**
- `POST /api/agents/chat` - Non-streaming chat
- `POST /api/agents/chat-stream` - Streaming chat

**Supported Models:**
- Google AI (Gemini)
- OpenAI (GPT models)
- Anthropic (Claude)

### 3. GitHub Integration

**Purpose:** Access and manage GitHub repositories.

**Key Capabilities:**
- List user repositories
- View repository details
- Browse commit history
- GitHub App authentication
- Token caching

**User Flow:**
1. User authenticates with GitHub
2. User views repositories
3. User selects repository
4. User views commits/details

**API Endpoints:**
- `GET /api/github/repositories` - List repositories
- `GET /api/github/repositories/[owner]/[repo]` - Repository details
- `GET /api/github/repositories/[owner]/[repo]/commits` - Commit history

**Authentication:**
- GitHub OAuth (user repositories)
- GitHub App (installation tokens)

### 4. Session State Management

**Purpose:** Track session lifecycle with state machine.

**Key Capabilities:**
- Enforce valid state transitions
- Prevent invalid state changes
- Support retry from failed state
- Terminal state (applied)

**States:**
- `created` - Initial state
- `planning` - Generating plan
- `preview_ready` - Preview generated
- `awaiting_approval` - Waiting for approval
- `applying` - Applying changes
- `applied` - Successfully applied (terminal)
- `failed` - Error occurred (can retry)

See [STATE_MACHINE.md](./STATE_MACHINE.md) for details.

### 5. Step Timeline

**Purpose:** Track execution steps in session.

**Key Capabilities:**
- Record step execution
- Track step status
- Store step metadata
- Chronological ordering

**Step Types:**
- `plan` - Planning phase
- `context` - Context gathering
- `model` - AI model execution
- `diff` - Diff generation
- `apply` - Applying changes

**API Endpoints:**
- `GET /api/sessions/[id]/steps` - Get steps
- `POST /api/sessions/[id]/steps` - Add step

### 6. Path Policy

**Purpose:** Enforce security restrictions on file paths.

**Key Capabilities:**
- Allowlist enforcement
- Forbidden paths blocking
- Override mechanisms
- Path normalization

**Allowed Paths:**
- `docs/` prefix
- `.repo/` prefix
- `README.md`

**Forbidden Paths:**
- `.github/workflows/`
- `package.json` and lockfiles
- `.env` files

See [PATH_POLICY.md](./PATH_POLICY.md) for details.

## Planned Features

### 1. Preview/Apply Workflow

**Status:** Not yet implemented

**Purpose:** Generate and apply code changes.

**Planned Flow:**
1. User creates session with goal
2. AI generates plan
3. AI gathers context
4. AI generates diff preview
5. User reviews preview
6. User approves
7. Changes applied via PR

### 2. Approval System

**Status:** Not yet implemented

**Purpose:** Human-in-the-loop approval for changes.

**Planned Features:**
- Preview review UI
- Approve/reject actions
- Revision requests
- Approval history

### 3. Security Frameworks

**Status:** Not yet implemented

**Planned Features:**
- PALADIN prompt injection detection
- Unicode sanitization
- Rate limiting
- IP allowlist for webhooks

## Feature Usage Examples

### Creating a Session

```typescript
const session = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Add Feature X',
    goal: 'Add authentication feature to the app',
    repo: {
      owner: 'username',
      name: 'repository',
      baseBranch: 'main'
    }
  })
});
```

### Sending Chat Message

```typescript
const response = await fetch('/api/agents/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, AI!' }
    ],
    sessionId: 'session-id' // Optional
  })
});

const data = await response.json();
console.log(data.response);
```

### Streaming Chat

```typescript
const response = await fetch('/api/agents/chat-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Process SSE chunks
}
```

## Feature Roadmap

### Short Term

- [ ] Preview/Apply workflow
- [ ] Approval system UI
- [ ] Enhanced error handling
- [ ] Rate limiting

### Medium Term

- [ ] PALADIN framework
- [ ] Unicode sanitization
- [ ] Webhook support
- [ ] Database migration

### Long Term

- [ ] Multi-repository support
- [ ] Team collaboration
- [ ] Advanced AI models
- [ ] Analytics dashboard

## Related Documentation

- **[API.md](./API.md)** - API reference
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[STATE_MACHINE.md](./STATE_MACHINE.md)** - State management
- **[PATH_POLICY.md](./PATH_POLICY.md)** - Path policy feature
- **[GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md)** - GitHub integration setup

## Feature Comparison Matrix

| Feature | Status | Priority | Documentation |
|---------|--------|----------|---------------|
| Agent Sessions | ✅ Implemented | P0 | [API.md](./API.md) |
| AI Chat | ✅ Implemented | P0 | [API.md](./API.md) |
| GitHub Integration | ✅ Implemented | P0 | [API.md](./API.md) |
| State Machine | ✅ Implemented | P0 | [STATE_MACHINE.md](./STATE_MACHINE.md) |
| Path Policy | ✅ Implemented | P0 | [PATH_POLICY.md](./PATH_POLICY.md) |
| Preview/Apply | ❌ Planned | P0 | - |
| Approval System | ❌ Planned | P1 | - |
| PALADIN Framework | ❌ Planned | P0 | - |
