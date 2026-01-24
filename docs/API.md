# API Documentation

Complete reference for all API endpoints in the application.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Responses](#error-responses)
- [Sessions API](#sessions-api)
  - [GET /api/sessions](#get-apisessions)
  - [POST /api/sessions](#post-apisessions)
  - [GET /api/sessions/[id]](#get-apisessionsid)
  - [PATCH /api/sessions/[id]](#patch-apisessionsid)
- [Session Steps API](#session-steps-api)
  - [GET /api/sessions/[id]/steps](#get-apisessionsidsteps)
  - [POST /api/sessions/[id]/steps](#post-apisessionsidsteps)
- [Agents API](#agents-api)
  - [POST /api/agents/chat](#post-apiagentschat)
  - [POST /api/agents/chat-stream](#post-apiagentschat-stream)
- [GitHub API](#github-api)
  - [GET /api/github/repositories](#get-apigithubrepositories)
  - [GET /api/github/repositories/[owner]/[repo]](#get-apigithubrepositoriesownerrepo)
  - [GET /api/github/repositories/[owner]/[repo]/commits](#get-apigithubrepositoriesownerrepocommits)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Webhooks](#webhooks)
- [Related Documentation](#related-documentation)

---

## Base URL

- **Development:** `http://localhost:9002`
- **Production:** (configured per environment)

## Authentication

All API endpoints require authentication via NextAuth. Include the session cookie in requests, or use the `Authorization` header for programmatic access.

**Authentication Method:** NextAuth session cookie (automatic in browser)  
**User Identification:**** Email (primary) or name (fallback)

## Error Responses

All endpoints may return these error responses:

- **401 Unauthorized:** Missing or invalid authentication
- **400 Bad Request:** Validation error or missing required fields
- **404 Not Found:** Resource not found
- **408 Request Timeout:** Request exceeded timeout limit
- **500 Internal Server Error:** Server error

Error response format:
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "field": "field.path" // Optional, for validation errors
}
```

---

## Sessions API

### GET /api/sessions

List all sessions for the authenticated user.

**Authentication:** Required  
**Response:** `200 OK`

```json
{
  "sessions": [
    {
      "id": "session-id",
      "userId": "user@example.com",
      "name": "Session Name",
      "model": "googleai/gemini-2.5-flash",
      "goal": "User's goal",
      "state": "created",
      "messages": [],
      "createdAt": "2025-01-24T00:00:00.000Z",
      "updatedAt": "2025-01-24T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - User identity unavailable

---

### POST /api/sessions

Create a new agent session.

**Authentication:** Required  
**Request Body:**

```json
{
  "id": "optional-session-id", // Optional, UUID generated if not provided
  "name": "Session Name", // Required, 1-100 characters
  "goal": "User's goal", // Required (or initialPrompt)
  "initialPrompt": "Initial prompt", // Optional, used as goal if goal not provided
  "model": "googleai/gemini-2.5-flash", // Optional, defaults to default model
  "repo": { // Optional, primary format
    "owner": "username",
    "name": "repository",
    "baseBranch": "main"
  },
  "repository": "username/repository" // Optional, deprecated
}
```

**Response:** `201 Created`

```json
{
  "id": "session-id",
  "userId": "user@example.com",
  "name": "Session Name",
  "model": "googleai/gemini-2.5-flash",
  "goal": "User's goal",
  "state": "created",
  "messages": [],
  "createdAt": "2025-01-24T00:00:00.000Z",
  "updatedAt": "2025-01-24T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Validation error or user identity unavailable
- `500` - Server error

**Validation Rules:**
- `name`: Required, 1-100 characters
- `goal` OR `initialPrompt`: At least one must be provided
- `repo.owner`, `repo.name`, `repo.baseBranch`: Required if `repo` is provided

---

### GET /api/sessions/[id]

Get a specific session by ID.

**Authentication:** Required  
**Path Parameters:**
- `id` (string) - Session ID

**Response:** `200 OK`

```json
{
  "id": "session-id",
  "userId": "user@example.com",
  "name": "Session Name",
  "model": "googleai/gemini-2.5-flash",
  "goal": "User's goal",
  "state": "created",
  "messages": [],
  "steps": [],
  "createdAt": "2025-01-24T00:00:00.000Z",
  "updatedAt": "2025-01-24T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Not authenticated
- `404` - Session not found
- `400` - User identity unavailable

---

### PATCH /api/sessions/[id]

Update a session's fields.

**Authentication:** Required  
**Path Parameters:**
- `id` (string) - Session ID

**Request Body:**

```json
{
  "name": "Updated Name", // Optional, 1-100 characters
  "model": "googleai/gemini-2.5-flash", // Optional
  "goal": "Updated goal", // Optional
  "repo": { // Optional
    "owner": "username",
    "name": "repository",
    "baseBranch": "main"
  },
  "repository": "username/repository", // Optional, deprecated
  "messages": [] // Optional, array of messages
}
```

**Response:** `200 OK`

Returns the updated session object.

**Error Responses:**
- `401` - Not authenticated
- `404` - Session not found
- `400` - Validation error
- `500` - Server error (may include state transition errors)

**State Transitions:**
State changes are validated according to the state machine. Invalid transitions return a 500 error with message "Invalid session state transition: [current] -> [requested]".

---

## Session Steps API

### GET /api/sessions/[id]/steps

Get the step timeline for a session.

**Authentication:** Required  
**Path Parameters:**
- `id` (string) - Session ID

**Response:** `200 OK`

```json
{
  "steps": [
    {
      "id": "step-id",
      "sessionId": "session-id",
      "type": "plan",
      "status": "started",
      "timestamp": "2025-01-24T00:00:00.000Z",
      "startedAt": "2025-01-24T00:00:00.000Z",
      "endedAt": "2025-01-24T00:05:00.000Z",
      "details": "Step details",
      "meta": {}
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `404` - Session not found
- `400` - User identity unavailable

---

### POST /api/sessions/[id]/steps

Add a step to the session timeline.

**Authentication:** Required  
**Path Parameters:**
- `id` (string) - Session ID

**Request Body:**

```json
{
  "type": "plan", // Required: "plan" | "context" | "model" | "diff" | "apply"
  "status": "started", // Required: "started" | "succeeded" | "failed"
  "name": "Step Name", // Optional, deprecated
  "timestamp": "2025-01-24T00:00:00.000Z", // Optional, deprecated
  "startedAt": "2025-01-24T00:00:00.000Z", // Optional, defaults to now
  "endedAt": "2025-01-24T00:05:00.000Z", // Optional
  "details": "Step details", // Optional
  "meta": {} // Optional, extensible metadata
}
```

**Response:** `200 OK`

```json
{
  "steps": [
    // Array of all steps including the newly added one
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `404` - Session not found
- `400` - Validation error
- `500` - Server error

**Step Types:**
- `plan` - Planning phase
- `context` - Context gathering
- `model` - AI model execution
- `diff` - Diff generation
- `apply` - Applying changes

---

## Agents API

### POST /api/agents/chat

Send a chat message to the AI agent and get a response.

**Authentication:** Required  
**Request Body:**

```json
{
  "messages": [
    {
      "role": "user", // Required: "user" | "assistant"
      "content": "Hello, AI!", // Required, non-empty
      "timestamp": "2025-01-24T00:00:00.000Z" // Optional
    }
  ],
  "model": "googleai/gemini-2.5-flash", // Optional
  "sessionId": "session-id" // Optional, for persistence
}
```

**Response:** `200 OK`

```json
{
  "response": "AI-generated response text"
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Validation error or no user message
- `408` - Request timeout (30 seconds)
- `500` - Server error or AI API error

**Timeout:** 30 seconds

**Session Persistence:** If `sessionId` is provided, the conversation is automatically persisted to the session.

---

### POST /api/agents/chat-stream

Send a chat message and receive a streaming response via Server-Sent Events (SSE).

**Authentication:** Required  
**Request Body:** Same as `/api/agents/chat`

**Response:** `200 OK` (Stream)

Content-Type: `text/event-stream`

```
data: {"chunk": "Hello"}

data: {"chunk": " there"}

data: {"chunk": "!"}

data: {"done": true}
```

**Error Responses:**
- Same as `/api/agents/chat`

**Usage Example:**
```javascript
const response = await fetch('/api/agents/chat-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
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

---

## GitHub API

### GET /api/github/repositories

List repositories accessible to the authenticated user.

**Authentication:** Required (GitHub OAuth token)  
**Response:** `200 OK`

```json
{
  "repositories": [
    {
      "id": 123456,
      "name": "repo-name",
      "full_name": "owner/repo-name",
      "description": "Repository description",
      "private": false,
      "updated_at": "2025-01-24T00:00:00.000Z",
      "created_at": "2025-01-24T00:00:00.000Z",
      "pushed_at": "2025-01-24T00:00:00.000Z",
      "owner": {
        "login": "owner",
        "avatar_url": "https://...",
        "id": 1
      },
      "default_branch": "main",
      "language": "TypeScript",
      "stargazers_count": 10,
      "forks_count": 2
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Rate limit exceeded
- `500` - Server error

**Caching:** Responses are cached for 5 minutes.

---

### GET /api/github/repositories/[owner]/[repo]

Get details for a specific repository.

**Authentication:** Required  
**Path Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name

**Response:** `200 OK`

Returns repository details (same format as list endpoint, single object).

**Error Responses:**
- `401` - Not authenticated
- `404` - Repository not found
- `500` - Server error

---

### GET /api/github/repositories/[owner]/[repo]/commits

Get commit history for a repository.

**Authentication:** Required  
**Path Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name

**Query Parameters:**
- `branch` (string, optional) - Branch name, defaults to default branch
- `limit` (number, optional) - Number of commits to return, defaults to 30

**Response:** `200 OK`

```json
{
  "commits": [
    {
      "sha": "abc123...",
      "commit": {
        "message": "Commit message",
        "author": {
          "name": "Author Name",
          "email": "author@example.com",
          "date": "2025-01-24T00:00:00.000Z"
        },
        "committer": {
          "name": "Committer Name",
          "email": "committer@example.com",
          "date": "2025-01-24T00:00:00.000Z"
        }
      },
      "author": {
        "login": "author",
        "avatar_url": "https://...",
        "id": 1
      },
      "committer": {
        "login": "committer",
        "avatar_url": "https://...",
        "id": 2
      },
      "html_url": "https://github.com/owner/repo/commit/abc123"
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `404` - Repository not found
- `500` - Server error

---

## Rate Limiting

Currently, rate limiting is not implemented. Future versions will include:
- Per-user rate limits
- Per-endpoint rate limits
- Rate limit headers in responses

---

## Pagination

Currently, pagination is not implemented for list endpoints. Future versions will support:
- `page` query parameter
- `limit` query parameter
- Pagination metadata in responses

---

## Webhooks

Webhook endpoints are planned but not yet implemented. Future versions will support:
- GitHub webhook events
- Session state change notifications
- Event delivery retry logic

---

## Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[SECURITY.md](./SECURITY.md)** - Security model and authentication
- **[STATE_MACHINE.md](./STATE_MACHINE.md)** - Session state transitions
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common API issues and solutions

## Quick Reference

### Authentication Flow

```
User → NextAuth Session → API Endpoint
         ↓
    User ID extracted
         ↓
    User isolation enforced
```

### Request Flow

```
Client Request
    ↓
Authentication Check
    ↓
User Identification
    ↓
Request Validation (Zod)
    ↓
Business Logic
    ↓
Response (JSON/SSE)
```

### Error Handling Flow

```
Error Occurs
    ↓
Error Classification
    ├─→ ValidationError → 400
    ├─→ AuthenticationError → 401
    ├─→ NotFoundError → 404
    ├─→ TimeoutError → 408
    └─→ ServerError → 500
    ↓
Error Response (with context)
```
