# Database Schema Documentation

## Table of Contents

- [Overview](#overview)
- [Storage Location](#storage-location)
- [Data Models](#data-models)
- [State Machine](#state-machine)
- [Data Relationships](#data-relationships)
- [Storage Operations](#storage-operations)
- [Data Persistence](#data-persistence)
- [Migration Considerations](#migration-considerations)
- [Backup and Restore](#backup-and-restore)
- [Data Validation](#data-validation)
- [Performance Considerations](#performance-considerations)
- [Data Retention](#data-retention)
- [Security Considerations](#security-considerations)
- [Example Queries](#example-queries)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

Firebase Studio currently uses file-based JSON storage. This document describes the data models and storage structure.

## Storage Location

- **File:** `.data/agent-sessions.json`
- **Format:** JSON
- **Structure:**
  ```json
  {
    "sessions": [
      // Array of AgentSession objects
    ]
  }
  ```

## Data Models

### AgentSession

Core session entity representing an AI agent task execution.

```typescript
interface AgentSession {
  id: string;                    // UUID, unique identifier
  userId: string;                // User identifier (email or name)
  name: string;                  // Human-readable session name (1-100 chars)
  model: string;                 // AI model identifier (e.g., "googleai/gemini-2.5-flash")
  goal: string;                  // REQUIRED: User's objective
  repo?: AgentRepositoryBinding; // PRIMARY: Repository binding
  repository?: string;           // DEPRECATED: Repository string format
  state: AgentSessionState;      // Current state in lifecycle
  messages: AgentMessage[];      // Conversation messages
  steps?: AgentSessionStep[];    // Execution step timeline
  previewId?: string;            // Preview identifier (when preview_ready)
  pr?: {                         // Pull request info (when applied)
    number: number;
    url: string;
    head: string;
    base: string;
  };
  headBranch?: string;           // Branch name for session's work
  lastMessage?: string;          // Preview of last message (for list display)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### AgentRepositoryBinding

Repository binding structure (primary format).

```typescript
interface AgentRepositoryBinding {
  owner: string;      // Repository owner (username or org)
  name: string;      // Repository name
  baseBranch: string; // Base branch for operations
}
```

### AgentMessage

Message in agent session conversation.

```typescript
interface AgentMessage {
  role: 'user' | 'assistant';  // Message sender role
  content: string;              // Message content
  timestamp: string;            // ISO 8601 timestamp
}
```

### AgentSessionStep

Step in the execution pipeline.

```typescript
interface AgentSessionStep {
  id: string;                    // UUID, unique step identifier
  sessionId: string;            // Parent session identifier
  type: AgentStepType;          // Step type: 'plan' | 'context' | 'model' | 'diff' | 'apply'
  name?: string;                // DEPRECATED: Step name
  status: AgentSessionStepStatus; // 'started' | 'succeeded' | 'failed'
  timestamp: string;            // DEPRECATED: Use startedAt/endedAt
  startedAt: string;            // ISO 8601: When step started
  endedAt?: string;             // ISO 8601: When step ended (optional)
  details?: string;             // Human-readable step details
  meta?: Record<string, unknown>; // Extensible metadata
}
```

### AgentSessionState

Session state in lifecycle.

```typescript
type AgentSessionState =
  | 'created'           // Initial state after session creation
  | 'planning'          // Generating plan for changes
  | 'preview_ready'     // Preview generated, ready for review
  | 'awaiting_approval' // Waiting for human approval
  | 'applying'          // Applying changes to repository
  | 'applied'           // Changes successfully applied (terminal)
  | 'failed';           // Error occurred (can retry)
```

## State Machine

### Valid Transitions

```
created → planning
created → failed

planning → preview_ready
planning → failed

preview_ready → awaiting_approval
preview_ready → planning (retry)
preview_ready → failed

awaiting_approval → applying
awaiting_approval → preview_ready (revision)
awaiting_approval → failed

applying → applied
applying → failed

failed → planning (retry)

applied → (terminal, no transitions)
```

### Invalid Transitions

- `created → applying` (must go through planning)
- `applied → any` (terminal state)
- Any transition not listed above

## Data Relationships

### Session → Steps

- One session has many steps
- Steps are stored in `session.steps` array
- Steps maintain chronological order

### Session → Messages

- One session has many messages
- Messages are stored in `session.messages` array
- Messages maintain chronological order

### User → Sessions

- One user has many sessions
- Sessions filtered by `userId`
- User isolation enforced at query level

## Storage Operations

### Create Session

```typescript
const session = await createAgentSession(userId, {
  name: 'Session Name',
  goal: 'User goal',
  // ... other fields
});
```

**Behavior:**
- Generates UUID if `id` not provided
- Sets default state to `'created'`
- Sets `createdAt` and `updatedAt` timestamps
- Requires `goal` or `initialPrompt`

### Read Session

```typescript
const session = await getAgentSessionById(userId, sessionId);
```

**Behavior:**
- Returns `null` if not found
- Enforces user isolation
- Uses in-memory cache if available

### Update Session

```typescript
const updated = await updateAgentSession(userId, sessionId, {
  name: 'Updated Name',
  state: 'planning',
  // ... other fields
});
```

**Behavior:**
- Validates state transitions
- Preserves unchanged fields
- Updates `updatedAt` timestamp
- Enforces user isolation

### List Sessions

```typescript
const sessions = await listAgentSessions(userId);
```

**Behavior:**
- Returns only user's sessions
- Sorted by `updatedAt` descending
- Uses in-memory cache

## Data Persistence

### File Structure

```json
{
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user@example.com",
      "name": "My Session",
      "model": "googleai/gemini-2.5-flash",
      "goal": "Add feature X",
      "state": "created",
      "messages": [],
      "steps": [],
      "createdAt": "2025-01-24T00:00:00.000Z",
      "updatedAt": "2025-01-24T00:00:00.000Z"
    }
  ]
}
```

### Write Queue

Concurrent writes are serialized using a write queue to prevent file corruption:

```typescript
writeQueue = writeQueue.then(() => 
  fs.writeFile(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8')
);
```

### Caching

- **In-memory cache:** Reduces file I/O for reads
- **Cache invalidation:** On write operations
- **Cache persistence:** Lost on process restart

## Migration Considerations

### Future Database Migration

When migrating to a database (PostgreSQL/MongoDB):

1. **Schema Design:**
   - Sessions table/collection
   - Steps as nested documents or separate table
   - Messages as nested documents or separate table

2. **Migration Script:**
   ```typescript
   // Read from JSON file
   const data = JSON.parse(fs.readFileSync('.data/agent-sessions.json'));
   
   // Insert into database
   for (const session of data.sessions) {
     await db.sessions.insert(session);
   }
   ```

3. **Data Validation:**
   - Validate all sessions before migration
   - Handle duplicate IDs
   - Verify user isolation

## Backup and Restore

### Backup

```bash
# Manual backup
cp .data/agent-sessions.json backups/sessions-$(date +%Y%m%d).json

# Automated backup (cron)
0 2 * * * cp /path/to/.data/agent-sessions.json /path/to/backups/sessions-$(date +\%Y\%m\%d).json
```

### Restore

```bash
# Restore from backup
cp backups/sessions-YYYYMMDD.json .data/agent-sessions.json
```

## Data Validation

### Schema Validation

All session data is validated using Zod schemas:

```typescript
const session = validateRequest(createAgentSessionSchema, input);
```

### Runtime Validation

- Required fields enforced
- Type checking
- Length limits
- Format validation

## Performance Considerations

### File I/O

- **Reads:** Cached in memory
- **Writes:** Serialized via write queue
- **Concurrency:** Safe for concurrent reads, serialized writes

### Scalability

**Current Limitations:**
- File-based storage doesn't scale horizontally
- All sessions in single file
- No indexing

**Future Improvements:**
- Database with indexes
- Pagination for large datasets
- Archival for old sessions

## Data Retention

### Current Policy

- No automatic deletion
- All sessions retained indefinitely

### Future Policies

- Archive sessions older than X days
- Delete failed sessions after Y days
- Compress old session data

## Security Considerations

### User Isolation

- All queries filtered by `userId`
- Cross-user access prevented
- No shared data between users

### Data Protection

- File permissions: `600` (read/write owner only)
- No sensitive data in logs
- Backup encryption (future)

## Example Queries

### Get All Sessions for User

```typescript
const sessions = await listAgentSessions('user@example.com');
```

### Get Session with Steps

```typescript
const session = await getAgentSessionById('user@example.com', 'session-id');
const steps = session?.steps ?? [];
```

### Filter Sessions by State

```typescript
const sessions = await listAgentSessions('user@example.com');
const activeSessions = sessions.filter(s => s.state !== 'applied' && s.state !== 'failed');
```

## Troubleshooting

### File Corruption

If file becomes corrupted:

1. **Restore from backup**
2. **Validate JSON structure**
3. **Repair manually if needed**

### Performance Issues

- **Large file size:** Consider archiving old sessions
- **Slow queries:** Consider database migration
- **Memory usage:** Monitor cache size

---

## Related Documentation

- **[STATE_MACHINE.md](./STATE_MACHINE.md)** - State machine documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[API.md](./API.md)** - API endpoints using data models
- **[SECURITY.md](./SECURITY.md)** - Data security considerations

## Data Model Relationships Diagram

```
User (userId)
    │
    ├─→ AgentSession (1:N)
    │       │
    │       ├─→ AgentMessage (1:N)
    │       │
    │       ├─→ AgentSessionStep (1:N)
    │       │
    │       └─→ AgentRepositoryBinding (1:1, optional)
    │
    └─→ (Future: Multiple sessions, teams, etc.)
```

## Storage Architecture Diagram

```
┌─────────────────────────────────────┐
│      Application Layer               │
│  (createAgentSession, etc.)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Cache Layer (In-Memory)        │
│  - Reduces file I/O                │
│  - Invalidated on writes            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Write Queue (Serialization)    │
│  - Prevents race conditions         │
│  - Ensures data integrity           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      File System (.data/)          │
│  - agent-sessions.json              │
│  - Persistent storage               │
└─────────────────────────────────────┘
```
