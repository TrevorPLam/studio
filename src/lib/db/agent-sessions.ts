/**
 * ============================================================================
 * AGENT SESSIONS DATABASE MODULE
 * ============================================================================
 *
 * @file src/lib/db/agent-sessions.ts
 * @module agent-sessions
 * @epic AS-CORE-001, AS-CORE-002
 *
 * PURPOSE:
 * Server-side persistence layer for agent sessions with CRUD operations,
 * state machine enforcement, and step timeline management.
 *
 * DEPENDENCIES:
 * - @/lib/agent/session-types (AgentSession, AgentSessionState, etc.)
 * - @/lib/validation (CreateAgentSession, AgentMessageInput)
 *
 * RELATED FILES:
 * - src/app/api/sessions/route.ts (API endpoints)
 * - src/app/api/sessions/[id]/route.ts (Session detail API)
 * - src/app/api/sessions/[id]/steps/route.ts (Step timeline API)
 * - src/lib/agent/session-types.ts (Type definitions)
 *
 * SECURITY:
 * - User isolation enforced (userId filtering)
 * - Kill-switch protection (read-only mode)
 * - Path policy for file system access
 * - Fail-closed state transitions
 *
 * STORAGE:
 * - File-based JSON storage in .data/agent-sessions.json
 * - In-memory cache for performance
 * - Write queue for concurrent write safety
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: KILL SWITCH / READ-ONLY MODE
// ============================================================================
// Per P0 Kill-switch: feature-flag disables all mutative actions globally ≤ 5s
// Now using centralized kill-switch module

import { assertNotKilled, setKillSwitch } from '@/lib/ops/killswitch';

/**
 * @deprecated Use setKillSwitch from @/lib/ops/killswitch instead
 * Kept for backward compatibility during migration
 */
export function setAgentReadOnlyMode(enabled: boolean) {
  setKillSwitch(enabled);
}

/**
 * Assert that kill-switch is not active.
 * Delegates to centralized kill-switch module.
 *
 * @throws KillSwitchActiveError if kill-switch is enabled
 */
function assertNotReadOnly() {
  assertNotKilled();
}

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type {
  AgentMessage,
  AgentSession,
  AgentSessionState,
  AgentRepositoryBinding,
} from '@/lib/agent/session-types';
import type { AgentMessageInput, CreateAgentSession } from '@/lib/validation';

// ============================================================================
// SECTION: PATH POLICY GUARDRAILS (FILESYSTEM-LEVEL)
// ============================================================================
// IMPORTANT: This is for filesystem path protection (data directory).
// This protects against directory traversal attacks when writing session data
// to the local filesystem (.data/ directory).
//
// For repository path policy (which restricts which repository files can be
// modified by agents), see @/lib/security/path-policy.ts (RA-SAFE-004).
//
// These are two separate concerns:
// - Filesystem path policy: protects local server filesystem (this section)
// - Repository path policy: protects repository files from agent modifications (RA-SAFE-004)

/**
 * Allowed data directories for file operations.
 * Sessions file must be within these directories.
 */
const ALLOWED_DATA_DIRS = [path.join(process.cwd(), '.data')];

/**
 * Files that cannot be modified by the agent system.
 * Protects critical configuration files.
 */
const DO_NOT_TOUCH_FILES = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'package.json'),
  path.join(process.cwd(), 'package-lock.json'),
  path.join(process.cwd(), 'yarn.lock'),
];

/**
 * Check if a filesystem path is allowed for agent operations.
 *
 * @param targetPath - Absolute filesystem path
 * @returns true if path is allowed
 */
function isPathAllowed(targetPath: string): boolean {
  const normalized = path.resolve(targetPath);
  // Must be under an allowed data dir
  const allowed = ALLOWED_DATA_DIRS.some((dir) => normalized.startsWith(dir));
  // Must not be a do-not-touch file
  const forbidden = DO_NOT_TOUCH_FILES.some((file) => normalized === file);
  return allowed && !forbidden;
}

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * File structure for sessions storage.
 */
interface SessionsFile {
  sessions: AgentSession[];
}

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================

const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'agent-sessions.json');
const DEFAULT_MODEL = 'googleai/gemini-2.5-flash';
const DEFAULT_STATE: AgentSessionState = 'created';

// ============================================================================
// SECTION: CACHE & QUEUE MANAGEMENT
// ============================================================================

/**
 * In-memory cache for sessions data.
 * Reduces file I/O for read operations.
 */
let cache: SessionsFile | null = null;

/**
 * Write queue to serialize concurrent write operations.
 * Prevents file corruption from race conditions.
 */
let writeQueue: Promise<void> = Promise.resolve();

// ============================================================================
// SECTION: FILE OPERATIONS
// ============================================================================

/**
 * Ensure the data file exists, creating it if necessary.
 *
 * @throws Error if path policy violation or read-only mode
 */
async function ensureDataFile() {
  assertNotReadOnly();
  if (!isPathAllowed(SESSIONS_FILE)) {
    throw new Error('Write access denied by path policy');
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SESSIONS_FILE);
  } catch {
    const initial: SessionsFile = { sessions: [] };
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

/**
 * Load sessions from file, using cache if available.
 *
 * @returns SessionsFile with all sessions
 */
async function loadSessions(): Promise<SessionsFile> {
  if (cache) {
    return cache;
  }

  await ensureDataFile();
  const raw = await fs.readFile(SESSIONS_FILE, 'utf8');

  try {
    const parsed = JSON.parse(raw) as SessionsFile;
    cache = {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    cache = { sessions: [] };
  }

  return cache;
}

/**
 * Persist sessions to file with write queue serialization.
 *
 * @param data - SessionsFile to persist
 * @throws Error if path policy violation or read-only mode
 */
async function persistSessions(data: SessionsFile) {
  assertNotReadOnly();
  if (!isPathAllowed(SESSIONS_FILE)) {
    throw new Error('Write access denied by path policy');
  }
  cache = data;
  writeQueue = writeQueue.then(() =>
    fs.writeFile(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8')
  );
  await writeQueue;
}

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Compute the last message preview for a session.
 * Used for session list display.
 *
 * @param messages - Array of agent messages
 * @returns Last message content (truncated to 100 chars) or undefined
 */
function computeLastMessage(messages: AgentMessage[]): string | undefined {
  const lastUserOrAssistant = [...messages]
    .reverse()
    .find((message) => message.content.trim().length > 0);
  if (!lastUserOrAssistant) {
    return undefined;
  }
  return lastUserOrAssistant.content.slice(0, 100);
}

/**
 * Normalize message inputs to AgentMessage format.
 * Ensures timestamps are present.
 *
 * @param messages - Array of message inputs
 * @returns Array of normalized AgentMessage objects
 */
function normaliseMessages(messages: AgentMessageInput[]): AgentMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

// ============================================================================
// SECTION: PUBLIC CRUD OPERATIONS
// ============================================================================

/**
 * List all sessions for a user, sorted by most recently updated.
 *
 * @param userId - User identifier (from auth session)
 * @returns Array of user's sessions, sorted by updatedAt descending
 *
 * @see AS-CORE-001 AS-02
 */
export async function listAgentSessions(userId: string): Promise<AgentSession[]> {
  const data = await loadSessions();
  return data.sessions
    .filter((session) => session.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get a specific session by ID, enforcing user isolation.
 *
 * @param userId - User identifier (from auth session)
 * @param sessionId - Session identifier
 * @returns Session if found and belongs to user, null otherwise
 *
 * @see AS-CORE-001 AS-02
 */
export async function getAgentSessionById(
  userId: string,
  sessionId: string
): Promise<AgentSession | null> {
  const data = await loadSessions();
  return (
    data.sessions.find((session) => session.userId === userId && session.id === sessionId) ?? null
  );
}

/**
 * Create a new agent session.
 *
 * Per AS-CORE-001:
 * - Generates UUID if id not provided
 * - Sets default state to 'created'
 * - Requires goal field (from input.goal or input.initialPrompt)
 * - Supports repo binding (primary) and repository string (deprecated)
 *
 * @param userId - User identifier (from auth session)
 * @param input - Session creation input
 * @returns Created session (or existing if duplicate ID)
 *
 * @see AS-CORE-001 AS-01, AS-02
 */
export async function createAgentSession(
  userId: string,
  input: CreateAgentSession
): Promise<AgentSession> {
  // Per P0 Kill-switch: block mutative operations when kill-switch is active
  assertNotKilled();

  const data = await loadSessions();
  const now = new Date().toISOString();

  const sessionId = input.id?.trim() || randomUUID();
  const existing = data.sessions.find(
    (session) => session.userId === userId && session.id === sessionId
  );
  if (existing) {
    return existing;
  }

  const messages: AgentMessage[] = input.initialPrompt
    ? [
        {
          role: 'user',
          content: input.initialPrompt,
          timestamp: now,
        },
      ]
    : [];

  const session: AgentSession = {
    id: sessionId,
    userId,
    name: input.name,
    model: input.model || DEFAULT_MODEL,
    goal: input.goal || input.initialPrompt || '', // Required field per AS-CORE-001
    repo: input.repo, // Primary format per AS-CORE-001
    repository: input.repository, // Deprecated: kept for backward compatibility
    state: DEFAULT_STATE,
    messages,
    lastMessage: computeLastMessage(messages),
    createdAt: now,
    updatedAt: now,
  };

  const nextData: SessionsFile = {
    sessions: [session, ...data.sessions],
  };

  await persistSessions(nextData);
  return session;
}

// ============================================================================
// SECTION: UPDATE OPERATIONS & STATE MACHINE
// ============================================================================

import type { AgentSessionStep } from '@/lib/agent/session-types';

/**
 * Input type for session updates.
 */
interface UpdateAgentSessionInput {
  name?: string;
  model?: string;
  goal?: string; // Per AS-CORE-001
  repo?: AgentRepositoryBinding; // Per AS-CORE-001
  repository?: string; // Deprecated
  state?: AgentSessionState;
  messages?: AgentMessageInput[];
  steps?: AgentSessionStep[];
  addStep?: AgentSessionStep;
}

/**
 * Update an existing agent session.
 *
 * Per AS-CORE-002:
 * - Enforces state machine transitions (fail-closed)
 * - Allows retry from failed state
 * - Manages step timeline
 * - Preserves unchanged fields
 *
 * State Transitions:
 * - created → planning, failed
 * - planning → preview_ready, failed
 * - preview_ready → awaiting_approval, planning (retry), failed
 * - awaiting_approval → applying, preview_ready (revision), failed
 * - applying → applied, failed
 * - applied → (terminal, no transitions)
 * - failed → planning (retry)
 *
 * @param userId - User identifier (from auth session)
 * @param sessionId - Session identifier
 * @param updates - Fields to update
 * @returns Updated session or null if not found
 * @throws Error if invalid state transition
 *
 * @see AS-CORE-002 AS-05, AS-06, AS-08
 */
export async function updateAgentSession(
  userId: string,
  sessionId: string,
  updates: UpdateAgentSessionInput
): Promise<AgentSession | null> {
  // Per P0 Kill-switch: block mutative operations when kill-switch is active
  assertNotKilled();

  const data = await loadSessions();
  const index = data.sessions.findIndex(
    (session) => session.userId === userId && session.id === sessionId
  );

  if (index === -1) {
    return null;
  }

  const current = data.sessions[index];
  const nextMessages = updates.messages ? normaliseMessages(updates.messages) : current.messages;
  const updatedAt = new Date().toISOString();

  // ========================================================================
  // STATE MACHINE TRANSITION ENFORCEMENT
  // ========================================================================
  // Per AS-CORE-002: allow retry from failed state
  // Fail-closed: reject invalid transitions with descriptive error

  const allowedTransitions: Record<string, string[]> = {
    created: ['planning', 'failed'],
    planning: ['preview_ready', 'failed'],
    preview_ready: ['awaiting_approval', 'planning', 'failed'], // Allow returning to planning
    awaiting_approval: ['applying', 'preview_ready', 'failed'], // Allow returning to preview
    applying: ['applied', 'failed'],
    applied: [], // Terminal state
    failed: ['planning'], // Allow retry per AS-CORE-002
  };

  let nextState = current.state;
  if (typeof updates.state === 'string' && updates.state !== current.state) {
    const allowed = allowedTransitions[current.state] || [];
    if (!allowed.includes(updates.state)) {
      // Fail closed: invalid transition
      throw new Error(`Invalid session state transition: ${current.state} -> ${updates.state}`);
    }
    nextState = updates.state;
  }

  // ========================================================================
  // STEP TIMELINE MANAGEMENT
  // ========================================================================
  // Per AS-CORE-002 AS-06: persist steps with type, status, timestamps

  let nextSteps = Array.isArray(current.steps) ? [...current.steps] : [];
  if (Array.isArray(updates.steps)) {
    nextSteps = updates.steps;
  }
  if (updates.addStep) {
    nextSteps.push(updates.addStep);
  }

  // ========================================================================
  // BUILD UPDATED SESSION
  // ========================================================================

  const updated: AgentSession = {
    ...current,
    name: updates.name ?? current.name,
    model: updates.model ?? current.model,
    goal: updates.goal ?? current.goal, // Ensure goal is always present
    repo: updates.repo ?? current.repo,
    repository: updates.repository ?? current.repository,
    state: nextState,
    messages: nextMessages,
    steps: nextSteps,
    lastMessage: computeLastMessage(nextMessages),
    updatedAt,
  };

  const nextSessions = [...data.sessions];
  nextSessions[index] = updated;

  await persistSessions({ sessions: nextSessions });
  return updated;
}
