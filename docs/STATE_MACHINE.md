# State Machine Documentation

## Table of Contents

- [Overview](#overview)
- [States](#states)
- [State Diagram](#state-diagram)
- [Valid Transitions](#valid-transitions)
- [Invalid Transitions](#invalid-transitions)
- [Implementation](#implementation)
- [Use Cases](#use-cases)
- [Error Handling](#error-handling)
- [Testing State Transitions](#testing-state-transitions)
- [State Persistence](#state-persistence)
- [State History](#state-history)
- [Best Practices](#best-practices)
- [Future Enhancements](#future-enhancements)
- [Related Documentation](#related-documentation)

---

## Overview

Agent sessions follow a state machine that enforces valid lifecycle transitions and prevents invalid state changes.

## States

### created
**Initial state** after session creation.

- **Entry:** When session is created
- **Exit:** Transitions to `planning` or `failed`

### planning
**Planning phase** where the AI generates a plan for changes.

- **Entry:** From `created` or `failed` (retry)
- **Exit:** Transitions to `preview_ready` or `failed`

### preview_ready
**Preview generated** and ready for review.

- **Entry:** From `planning`
- **Exit:** Transitions to `awaiting_approval`, `planning` (retry), or `failed`

### awaiting_approval
**Waiting for human approval** before applying changes.

- **Entry:** From `preview_ready`
- **Exit:** Transitions to `applying`, `preview_ready` (revision), or `failed`

### applying
**Applying changes** to the repository.

- **Entry:** From `awaiting_approval`
- **Exit:** Transitions to `applied` or `failed`

### applied
**Terminal state** - changes successfully applied.

- **Entry:** From `applying`
- **Exit:** None (terminal state)

### failed
**Error state** - operation failed, can retry.

- **Entry:** From any state (error handling)
- **Exit:** Transitions to `planning` (retry)

## State Diagram

```
                    ┌─────────┐
                    │ created │
                    └────┬────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
      ┌──────────┐            ┌──────────┐
      │ planning │            │  failed  │
      └────┬─────┘            └────┬─────┘
           │                       │
           │                       │ (retry)
           ▼                       │
   ┌───────────────┐               │
   │preview_ready  │◄──────────────┘
   └───────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────────┐ ┌──────────┐
│awaiting_    │ │ planning │
│approval     │ │ (retry)  │
└──────┬──────┘ └──────────┘
       │
       │
       ▼
  ┌─────────┐
  │applying │
  └────┬────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌──────┐
│applied│ │failed│
└───────┘ └──────┘
```

## Valid Transitions

### From `created`
- ✅ `created → planning`
- ✅ `created → failed`

### From `planning`
- ✅ `planning → preview_ready`
- ✅ `planning → failed`

### From `preview_ready`
- ✅ `preview_ready → awaiting_approval`
- ✅ `preview_ready → planning` (retry)
- ✅ `preview_ready → failed`

### From `awaiting_approval`
- ✅ `awaiting_approval → applying`
- ✅ `awaiting_approval → preview_ready` (revision)
- ✅ `awaiting_approval → failed`

### From `applying`
- ✅ `applying → applied`
- ✅ `applying → failed`

### From `failed`
- ✅ `failed → planning` (retry)

### From `applied`
- ❌ No transitions (terminal state)

## Invalid Transitions

These transitions are **rejected** with an error:

- ❌ `created → applying` (must go through planning)
- ❌ `created → preview_ready` (must go through planning)
- ❌ `applied → any` (terminal state)
- ❌ Any transition not listed in valid transitions

## Implementation

### State Transition Enforcement

```typescript
// src/lib/db/agent-sessions.ts

const allowedTransitions: Record<string, string[]> = {
  created: ['planning', 'failed'],
  planning: ['preview_ready', 'failed'],
  preview_ready: ['awaiting_approval', 'planning', 'failed'],
  awaiting_approval: ['applying', 'preview_ready', 'failed'],
  applying: ['applied', 'failed'],
  applied: [], // Terminal state
  failed: ['planning'], // Allow retry
};

if (typeof updates.state === 'string' && updates.state !== current.state) {
  const allowed = allowedTransitions[current.state] || [];
  if (!allowed.includes(updates.state)) {
    throw new Error(
      `Invalid session state transition: ${current.state} -> ${updates.state}`
    );
  }
}
```

### Updating State

```typescript
// Valid transition
await updateAgentSession(userId, sessionId, {
  state: 'planning'
});

// Invalid transition (throws error)
await updateAgentSession(userId, sessionId, {
  state: 'applying' // Error: Invalid transition from 'created'
});
```

## Use Cases

### Normal Flow

```
1. User creates session → created
2. AI generates plan → planning
3. Plan complete → preview_ready
4. User reviews → awaiting_approval
5. User approves → applying
6. Changes applied → applied
```

### Retry Flow

```
1. Session in planning → failed
2. User retries → planning
3. Continue from step 2
```

### Revision Flow

```
1. Session in awaiting_approval
2. User requests revision → preview_ready
3. AI updates preview → awaiting_approval
4. Continue from step 1
```

### Error Flow

```
1. Any state → error occurs → failed
2. User retries → planning
3. Continue normal flow
```

## Error Handling

### Invalid Transition Error

```typescript
try {
  await updateAgentSession(userId, sessionId, {
    state: 'applying' // Invalid from 'created'
  });
} catch (error) {
  // Error: "Invalid session state transition: created -> applying"
}
```

### Error Response

API returns `500 Internal Server Error` with error message:

```json
{
  "error": "Internal server error",
  "message": "Invalid session state transition: created -> applying"
}
```

## Testing State Transitions

### Unit Tests

```typescript
// tests/unit/lib/db/agent-sessions-state.test.ts

it('allows valid transition: created → planning', async () => {
  const session = await createAgentSession(userId, input);
  const updated = await updateAgentSession(userId, session.id, {
    state: 'planning'
  });
  expect(updated?.state).toBe('planning');
});

it('rejects invalid transition: created → applying', async () => {
  const session = await createAgentSession(userId, input);
  await expect(
    updateAgentSession(userId, session.id, {
      state: 'applying'
    })
  ).rejects.toThrow('Invalid session state transition');
});
```

## State Persistence

States are persisted in the session object:

```json
{
  "id": "session-id",
  "state": "planning",
  "updatedAt": "2025-01-24T00:00:00.000Z"
}
```

## State History

State changes are tracked via:
- `updatedAt` timestamp (last state change)
- Step timeline (detailed execution history)

Future: Add state change history/audit log.

## Best Practices

### When to Change State

- **Automatically:** When operation completes (planning → preview_ready)
- **User Action:** When user approves (awaiting_approval → applying)
- **Error:** When operation fails (any → failed)

### State Validation

Always validate state before operations:

```typescript
const session = await getAgentSessionById(userId, sessionId);
if (session?.state !== 'awaiting_approval') {
  throw new Error('Session must be in awaiting_approval state');
}
```

### Retry Logic

```typescript
if (session.state === 'failed') {
  // Allow retry
  await updateAgentSession(userId, sessionId, {
    state: 'planning'
  });
}
```

## Future Enhancements

- **State History:** Track all state changes with timestamps
- **State Locking:** Prevent concurrent state changes
- **State Callbacks:** Execute actions on state transitions
- **State Validation:** Custom validation rules per state

---

## Related Documentation

- **[DATABASE.md](./DATABASE.md)** - State persistence
- **[API.md](./API.md)** - State transition endpoints
- **[SECURITY.md](./SECURITY.md)** - State machine security
- **[TESTING.md](./TESTING.md)** - Testing state transitions

## State Transition Matrix

| From State | To States (Valid) | Invalid Examples |
|------------|------------------|------------------|
| `created` | `planning`, `failed` | `applying`, `preview_ready` |
| `planning` | `preview_ready`, `failed` | `applying`, `applied` |
| `preview_ready` | `awaiting_approval`, `planning`, `failed` | `applying`, `applied` |
| `awaiting_approval` | `applying`, `preview_ready`, `failed` | `planning`, `created` |
| `applying` | `applied`, `failed` | `planning`, `preview_ready` |
| `applied` | *(none - terminal)* | Any state |
| `failed` | `planning` | `applying`, `applied` |
