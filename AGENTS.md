# AI Agents Documentation

## Table of Contents

- [Overview](#overview)
- [Agent System Architecture](#agent-system-architecture)
- [Agent Sessions](#agent-sessions)
- [Repository Introspection](#repository-introspection)
- [Agent Lifecycle](#agent-lifecycle)
- [State Machine](#state-machine)
- [Context Building](#context-building)
- [Agent Capabilities](#agent-capabilities)
- [Integration Points](#integration-points)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

---

## Overview

Firebase Studio provides an AI-powered agent system that can analyze GitHub repositories, understand their structure, and propose changes through a safe preview-and-apply workflow. Agents operate through **sessions** that track the entire lifecycle from goal definition to change application.

### Key Concepts

- **Agent Session**: A single task execution with a specific goal
- **Repository Binding**: Links a session to a GitHub repository
- **State Machine**: Enforces valid lifecycle transitions
- **Preview/Apply Workflow**: Safe change proposal and application
- **Repository Introspection**: Automatic metadata extraction for context

---

## Agent System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Session                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Planning   │→ │   Context    │→ │    Model     │    │
│  │   Phase      │  │   Building    │  │  Execution   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                   │            │
│         └──────────────────┴───────────────────┘            │
│                            │                                 │
│                            ▼                                 │
│                  ┌──────────────────┐                        │
│                  │  Preview Diff    │                        │
│                  │  Generation      │                        │
│                  └──────────────────┘                        │
│                            │                                 │
│                            ▼                                 │
│                  ┌──────────────────┐                        │
│                  │  Human Approval  │                        │
│                  └──────────────────┘                        │
│                            │                                 │
│                            ▼                                 │
│                  ┌──────────────────┐                        │
│                  │  Apply Changes   │                        │
│                  │  (Create PR)     │                        │
│                  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Sessions

### Session Structure

An agent session represents a single AI-powered task execution:

```typescript
interface AgentSession {
  id: string; // UUID
  userId: string; // User identifier
  name: string; // Human-readable name
  model: string; // AI model (e.g., "googleai/gemini-2.5-flash")
  goal: string; // REQUIRED: User's objective
  repo?: AgentRepositoryBinding; // Repository binding
  state: AgentSessionState; // Current state
  messages: AgentMessage[]; // Conversation history
  steps?: AgentSessionStep[]; // Execution timeline
  previewId?: string; // Preview identifier
  pr?: {
    // Pull request info
    number: number;
    url: string;
    head: string;
    base: string;
  };
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
```

### Repository Binding

Sessions are bound to GitHub repositories:

```typescript
interface AgentRepositoryBinding {
  owner: string; // Repository owner (username or org)
  name: string; // Repository name
  baseBranch: string; // Base branch for operations
}
```

### Creating a Session

```typescript
import { createAgentSession } from '@/lib/db/agent-sessions';

const session = await createAgentSession(userId, {
  name: 'Add authentication feature',
  goal: 'Add user authentication with GitHub OAuth',
  model: 'googleai/gemini-2.5-flash',
  repo: {
    owner: 'myorg',
    name: 'myrepo',
    baseBranch: 'main',
  },
});
```

**API Endpoint:**

```bash
POST /api/sessions
Content-Type: application/json

{
  "name": "Add authentication feature",
  "goal": "Add user authentication with GitHub OAuth",
  "model": "googleai/gemini-2.5-flash",
  "repo": {
    "owner": "myorg",
    "name": "myrepo",
    "baseBranch": "main"
  }
}
```

---

## Repository Introspection

Before agents can propose changes, they need to understand the repository structure. This is where **Repository Introspection** comes in.

### What is Repository Introspection?

Repository introspection automatically extracts metadata from GitHub repositories to provide agents with context about:

1. **Language Detection** - What programming languages are used
2. **Dependency Graph** - What dependencies the project has
3. **Entry Points** - Where the application starts and what routes exist
4. **Test Locations** - Where tests are located and what frameworks are used
5. **Service vs Library Classification** - Whether it's a service or library

### Using Repository Introspection

The introspection module is located at `src/lib/repo-introspection/introspector.ts` and provides comprehensive repository analysis:

```typescript
import { GitHubClient } from '@/lib/github-client';
import { introspectRepository } from '@/lib/repo-introspection';

// Create GitHub client
const client = new GitHubClient({ token: githubToken });

// Introspect repository
const metadata = await introspectRepository(client, 'owner', 'repo-name', {
  maxFiles: 1000,
  maxDepth: 10,
  ref: 'main',
});

// Access metadata
console.log(metadata.languages.primary.name); // "TypeScript"
console.log(metadata.classification.type); // "service"
console.log(metadata.entryPoints.framework); // "Next.js"
console.log(metadata.dependencies.totalDependencies); // 150
console.log(metadata.tests.framework); // "Jest"
```

### Quick Summary Mode

For faster analysis with limited metadata:

```typescript
import { getRepositorySummary } from '@/lib/repo-introspection';

const summary = await getRepositorySummary(client, 'owner', 'repo-name');
// Returns: repository, languages, classification
```

### API Endpoint

```bash
# Full introspection
GET /api/github/repositories/{owner}/{repo}/introspect

# Quick summary
GET /api/github/repositories/{owner}/{repo}/introspect?quick=true

# With options
GET /api/github/repositories/{owner}/{repo}/introspect?maxFiles=500&maxDepth=5
```

### Integration with Agents

Agents use repository introspection during the **context building** phase:

1. **Session Created** → Agent receives goal and repository binding
2. **Planning Phase** → Agent calls repository introspection
3. **Context Built** → Agent uses metadata to understand:
   - What languages to work with
   - What framework is being used
   - Where entry points are located
   - What dependencies exist
   - Where tests should be placed
4. **Plan Generated** → Agent creates plan based on repository structure

### Example: Agent Using Introspection

```typescript
// During agent execution (pseudo-code)
async function buildContext(session: AgentSession) {
  const { owner, name } = session.repo!;

  // Introspect repository
  const metadata = await introspectRepository(githubClient, owner, name, {
    maxFiles: 1000,
    maxDepth: 10,
  });

  // Build context from metadata
  const context = {
    primaryLanguage: metadata.languages.primary.name,
    framework: metadata.entryPoints.framework,
    entryPoints: metadata.entryPoints.entryPoints,
    dependencies: metadata.dependencies.direct,
    testFramework: metadata.tests.framework,
    projectType: metadata.classification.type,
  };

  // Use context in AI prompt
  const prompt = buildPrompt(session.goal, context);
  return prompt;
}
```

### Metadata Structure

See [Repository Introspection README](./src/lib/repo-introspection/README.md) for complete metadata structure documentation.

**Key Metadata Fields:**

- `languages` - Detected languages with statistics
- `dependencies` - Dependency graph (direct, dev, transitive)
- `entryPoints` - Application entry points and API routes
- `tests` - Test files and frameworks
- `classification` - Service vs library classification

---

## Agent Lifecycle

### Lifecycle States

Agents progress through the following states:

1. **`created`** - Session created, ready to start
2. **`planning`** - AI is generating a plan
3. **`preview_ready`** - Preview of changes is ready
4. **`awaiting_approval`** - Waiting for human approval
5. **`applying`** - Applying changes to repository
6. **`applied`** - Changes successfully applied (terminal)
7. **`failed`** - Error occurred (can retry)

### State Transitions

```
created → planning → preview_ready → awaiting_approval → applying → applied
   │         │            │                │               │
   └─────────┴────────────┴────────────────┴───────────────┘
                            │
                            ▼
                         failed
                            │
                            └──→ planning (retry)
```

See [STATE_MACHINE.md](./docs/STATE_MACHINE.md) for complete state machine documentation.

---

## State Machine

The agent state machine enforces valid lifecycle transitions and prevents invalid state changes.

### Valid Transitions

- `created → planning` - Start planning
- `created → failed` - Immediate failure
- `planning → preview_ready` - Plan complete
- `planning → failed` - Planning failed
- `preview_ready → awaiting_approval` - Ready for review
- `preview_ready → planning` - Retry planning
- `awaiting_approval → applying` - Approved
- `awaiting_approval → preview_ready` - Request revision
- `applying → applied` - Success
- `applying → failed` - Application failed
- `failed → planning` - Retry

### Invalid Transitions

These are **rejected** with an error:

- `created → applying` (must go through planning)
- `applied → any` (terminal state)
- Any transition not listed above

### Implementation

```typescript
// State transition enforcement
const allowedTransitions: Record<string, string[]> = {
  created: ['planning', 'failed'],
  planning: ['preview_ready', 'failed'],
  preview_ready: ['awaiting_approval', 'planning', 'failed'],
  awaiting_approval: ['applying', 'preview_ready', 'failed'],
  applying: ['applied', 'failed'],
  applied: [], // Terminal state
  failed: ['planning'], // Allow retry
};

// Update session state
await updateAgentSession(userId, sessionId, {
  state: 'planning', // Valid transition
});
```

---

## Context Building

Agents build context from multiple sources:

### 1. Repository Introspection

Automatic metadata extraction (see [Repository Introspection](#repository-introspection) above).

### 2. File Reading

Agents read relevant files based on:

- Goal keywords
- Entry points
- Dependencies
- Test locations

### 3. Context Budgeting

Context is bounded to stay within token limits:

```typescript
// Priority-based context selection
enum ContextPriority {
  ALWAYS = 1, // README.md
  EXPLICIT = 2, // Files mentioned in goal
  SAME_DIR = 3, // Files in same dir as modified
  RECENT = 4, // Recently modified
  COMODIFIED = 5, // Frequently co-modified
  FALLBACK = 6, // Everything else
}
```

### 4. Context Manifest

Context is tracked for auditability:

```typescript
interface ContextManifest {
  sessionId: string;
  items: {
    path: string;
    sha256: string;
    bytes: number;
  }[];
}
```

---

## Agent Capabilities

### Current Capabilities

- ✅ **Repository Analysis** - Understand repository structure
- ✅ **Language Detection** - Identify programming languages
- ✅ **Dependency Analysis** - Understand project dependencies
- ✅ **Entry Point Discovery** - Find application entry points
- ✅ **Test Location Mapping** - Identify test files and frameworks
- ✅ **Service/Library Classification** - Determine project type
- ✅ **State Management** - Track session lifecycle
- ✅ **Step Timeline** - Record execution steps

### Planned Capabilities

- 🔄 **Preview Generation** - Generate unified diffs
- 🔄 **Change Application** - Create branches and PRs
- 🔄 **Multi-Hop Retrieval** - Iterative context gathering
- 🔄 **Confidence Scoring** - Assess proposal confidence
- 🔄 **Guardrails** - Security and safety checks
- 🔄 **Approval Workflow** - Human-in-the-loop approval

See [TODO.md](./TODO.md) for complete roadmap.

---

## Integration Points

### GitHub Integration

Agents integrate with GitHub through:

- **GitHub OAuth** - User authentication
- **GitHub App** - Installation tokens for repository access
- **GitHub API** - Repository operations

### AI Model Integration

Agents support multiple AI models:

- **Google AI (Gemini)** - `googleai/gemini-2.5-flash`
- **OpenAI (GPT)** - `openai/gpt-4`, `openai/gpt-3.5-turbo`
- **Anthropic (Claude)** - `anthropic/claude-3-opus`

### Database Integration

Sessions are persisted in:

- **File-based storage** - `.data/agent-sessions.json`
- **Future:** Database migration planned

---

## Usage Examples

### Example 1: Basic Agent Session

```typescript
// 1. Create session
const session = await createAgentSession(userId, {
  name: 'Add feature',
  goal: 'Add user authentication',
  model: 'googleai/gemini-2.5-flash',
  repo: {
    owner: 'myorg',
    name: 'myrepo',
    baseBranch: 'main',
  },
});

// 2. Agent automatically:
//    - Introspects repository
//    - Builds context
//    - Generates plan
//    - Creates preview

// 3. User reviews and approves
await updateAgentSession(userId, session.id, {
  state: 'awaiting_approval',
});

// 4. Apply changes
await updateAgentSession(userId, session.id, {
  state: 'applying',
});
```

### Example 2: Using Repository Introspection Directly

```typescript
import { introspectRepository } from '@/lib/repo-introspection';
import { GitHubClient } from '@/lib/github-client';

const client = new GitHubClient({ token: githubToken });

// Get repository metadata
const metadata = await introspectRepository(client, 'myorg', 'myrepo', { maxFiles: 1000 });

// Use metadata for custom logic
if (metadata.classification.type === 'service') {
  console.log('This is a service application');
  console.log(`Framework: ${metadata.entryPoints.framework}`);
  console.log(`Primary language: ${metadata.languages.primary.name}`);
}
```

### Example 3: API Usage

```bash
# Create agent session
curl -X POST http://localhost:9002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Add authentication",
    "goal": "Add GitHub OAuth authentication",
    "model": "googleai/gemini-2.5-flash",
    "repo": {
      "owner": "myorg",
      "name": "myrepo",
      "baseBranch": "main"
    }
  }'

# Introspect repository
curl http://localhost:9002/api/github/repositories/myorg/myrepo/introspect

# Get session
curl http://localhost:9002/api/sessions/{sessionId}
```

---

## Best Practices

### Session Management

1. **Always provide a clear goal** - Specific goals produce better results
2. **Use appropriate models** - Choose model based on task complexity
3. **Monitor state transitions** - Track session progress
4. **Handle failures gracefully** - Retry failed sessions

### Repository Introspection

1. **Use quick mode for large repos** - Faster analysis with limited metadata
2. **Set appropriate limits** - Use `maxFiles` and `maxDepth` for performance
3. **Cache results** - Introspection results can be cached
4. **Handle errors** - Repository access may fail

### Context Building

1. **Prioritize relevant files** - Use priority-based selection
2. **Respect token limits** - Stay within context budget
3. **Track context manifest** - For auditability
4. **Include README** - Always include README.md in context

### Security

1. **Enforce path policy** - Prevent unauthorized file modifications
2. **Require approval** - Always require human approval before applying
3. **Validate state transitions** - Prevent invalid state changes
4. **Audit all operations** - Log all agent actions

---

## Related Documentation

### Core Documentation

- **[FEATURES.md](./docs/FEATURES.md)** - Feature overview and capabilities
- **[STATE_MACHINE.md](./docs/STATE_MACHINE.md)** - Complete state machine documentation
- **[API.md](./docs/API.md)** - API endpoint reference
- **[DATABASE.md](./docs/DATABASE.md)** - Session persistence and data models

### Repository Introspection

- **[Repository Introspection README](./src/lib/repo-introspection/README.md)** - Complete introspection module documentation
- **[Introspector Source](./src/lib/repo-introspection/introspector.ts)** - Main orchestrator implementation

### Security & Configuration

- **[SECURITY.md](./docs/SECURITY.md)** - Security model and best practices
- **[PATH_POLICY.md](./docs/PATH_POLICY.md)** - Path policy documentation
- **[GITHUB_APP_SETUP.md](./docs/GITHUB_APP_SETUP.md)** - GitHub App setup

### Development

- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development workflow
- **[TESTING.md](./docs/TESTING.md)** - Testing guide
- **[TODO.md](./TODO.md)** - Development roadmap and tasks

---

## Quick Reference

### Agent Session States

| State               | Description          | Next States                               |
| ------------------- | -------------------- | ----------------------------------------- |
| `created`           | Initial state        | `planning`, `failed`                      |
| `planning`          | Generating plan      | `preview_ready`, `failed`                 |
| `preview_ready`     | Preview ready        | `awaiting_approval`, `planning`, `failed` |
| `awaiting_approval` | Waiting for approval | `applying`, `preview_ready`, `failed`     |
| `applying`          | Applying changes     | `applied`, `failed`                       |
| `applied`           | Success (terminal)   | _(none)_                                  |
| `failed`            | Error (can retry)    | `planning`                                |

### Repository Introspection Metadata

| Field                            | Description            | Example                    |
| -------------------------------- | ---------------------- | -------------------------- |
| `languages.primary.name`         | Primary language       | `"TypeScript"`             |
| `classification.type`            | Project type           | `"service"` or `"library"` |
| `entryPoints.framework`          | Detected framework     | `"Next.js"`                |
| `dependencies.totalDependencies` | Total dependency count | `150`                      |
| `tests.framework`                | Test framework         | `"Jest"`                   |

### API Endpoints

| Endpoint                                             | Method | Description           |
| ---------------------------------------------------- | ------ | --------------------- |
| `/api/sessions`                                      | GET    | List sessions         |
| `/api/sessions`                                      | POST   | Create session        |
| `/api/sessions/[id]`                                 | GET    | Get session           |
| `/api/sessions/[id]`                                 | PATCH  | Update session        |
| `/api/sessions/[id]/steps`                           | GET    | Get steps             |
| `/api/sessions/[id]/steps`                           | POST   | Add step              |
| `/api/github/repositories/[owner]/[repo]/introspect` | GET    | Introspect repository |

---

_Last updated: 2025-01-24_
