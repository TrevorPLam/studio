/**
 * ============================================================================
 * AGENT SESSION TYPE DEFINITIONS
 * ============================================================================
 *
 * @file src/lib/agent/session-types.ts
 * @module session-types
 * @epic AS-CORE-001, AS-CORE-002
 *
 * PURPOSE:
 * Central type definitions for agent sessions, messages, steps, and state machine.
 * This is the source of truth for session data structures.
 *
 * RELATED FILES:
 * - src/lib/db/agent-sessions.ts (Database operations using these types)
 * - src/app/api/sessions/route.ts (API endpoints using these types)
 * - src/lib/validation.ts (Validation schemas matching these types)
 *
 * VERSION HISTORY:
 * - v1: Initial schema with repository string
 * - v2: Added repo binding, required goal field (AS-CORE-001)
 * - v3: Updated step structure with type field (AS-CORE-002)
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: STEP TYPES & STATUS
// ============================================================================

/**
 * Status of an agent step execution.
 *
 * @see AS-CORE-002 AS-06
 */
export type AgentSessionStepStatus = 'started' | 'succeeded' | 'failed';

/**
 * Type of agent step in the execution pipeline.
 *
 * Pipeline flow: plan → context → model → diff → apply
 *
 * @see AS-CORE-002 AS-06
 */
export type AgentStepType = 'plan' | 'context' | 'model' | 'diff' | 'apply';

// ============================================================================
// SECTION: STEP INTERFACE
// ============================================================================

/**
 * Agent session step representing a stage in the execution pipeline.
 *
 * Per AS-CORE-002:
 * - Each step has a unique ID and session ID
 * - Type field is primary (name is deprecated)
 * - Timestamps track execution (startedAt, endedAt)
 * - Meta field for extensible metadata
 *
 * @see AS-CORE-002 AS-06
 */
export interface AgentSessionStep {
  /** Unique step identifier */
  id: string;

  /** Parent session identifier */
  sessionId: string;

  /** Step type in pipeline (plan/context/model/diff/apply) */
  type: AgentStepType; // Per AS-CORE-002, should use type instead of name

  /** Step name (deprecated: use type instead) */
  name?: string; // Deprecated: kept for backward compatibility

  /** Execution status */
  status: AgentSessionStepStatus;

  /** Timestamp (deprecated: use startedAt/endedAt) */
  timestamp: string;

  /** When step execution started (ISO 8601) */
  startedAt: string; // Per AS-CORE-002

  /** When step execution ended (ISO 8601, optional) */
  endedAt?: string; // Per AS-CORE-002

  /** Human-readable step details */
  details?: string;

  /** Extensible metadata for step-specific data */
  meta?: Record<string, unknown>; // Per AS-CORE-002
}

// ============================================================================
// SECTION: SESSION STATE MACHINE
// ============================================================================

/**
 * Agent session state in the lifecycle.
 *
 * State Flow:
 * 1. created → planning → preview_ready → awaiting_approval → applying → applied
 * 2. Any state → failed (error handling)
 * 3. failed → planning (retry)
 * 4. preview_ready ← awaiting_approval (revision)
 *
 * @see AS-CORE-002 AS-05 for allowed transitions
 */
export type AgentSessionState =
  | 'created' // Initial state after session creation
  | 'planning' // Generating plan for changes
  | 'preview_ready' // Preview generated, ready for review
  | 'awaiting_approval' // Waiting for human approval
  | 'applying' // Applying changes to repository
  | 'applied' // Changes successfully applied (terminal)
  | 'failed'; // Error occurred (can retry)

// ============================================================================
// SECTION: MESSAGE TYPES
// ============================================================================

/**
 * Role of message sender in conversation.
 */
export type AgentRole = 'user' | 'assistant';

/**
 * Message in agent session conversation.
 *
 * Used for chat history and context building.
 */
export interface AgentMessage {
  /** Message sender role */
  role: AgentRole;

  /** Message content */
  content: string;

  /** Message timestamp (ISO 8601) */
  timestamp: string;
}

// ============================================================================
// SECTION: REPOSITORY BINDING
// ============================================================================

/**
 * Repository binding for agent session.
 *
 * Primary format for repository association (per AS-CORE-001).
 * Replaces deprecated repository string field.
 *
 * @see AS-CORE-001 AS-01
 */
export interface AgentRepositoryBinding {
  /** Repository owner (username or org) */
  owner: string;

  /** Repository name */
  name: string;

  /** Base branch for operations */
  baseBranch: string;
}

// ============================================================================
// SECTION: SESSION INTERFACE
// ============================================================================

/**
 * Agent session representing a single AI agent task execution.
 *
 * Per AS-CORE-001:
 * - goal field is required (user's objective)
 * - repo binding is primary format (repository string is deprecated)
 * - state machine enforces valid transitions
 * - step timeline tracks execution progress
 *
 * @see AS-CORE-001 AS-01
 * @see AS-CORE-002 for state machine and step timeline
 */
export interface AgentSession {
  /** Unique session identifier (UUID) */
  id: string;

  /** User identifier (from auth session) */
  userId: string;

  /** Human-readable session name */
  name: string;

  /** AI model identifier (e.g., "googleai/gemini-2.5-flash") */
  model: string;

  /** User's goal/objective (REQUIRED per AS-CORE-001) */
  goal: string; // Required field per AS-CORE-001

  /** Repository binding (PRIMARY format per AS-CORE-001) */
  repo?: AgentRepositoryBinding; // Primary format for repository binding

  /** Repository identifier (DEPRECATED: use repo instead) */
  repository?: string; // Deprecated: kept for backward compatibility

  /** Current state in lifecycle */
  state: AgentSessionState;

  /** Conversation messages */
  messages: AgentMessage[];

  /** Execution step timeline */
  steps?: AgentSessionStep[];

  /** Preview identifier (when preview_ready) */
  previewId?: string;

  /** Pull request information (when applied) */
  pr?: { number: number; url: string; head: string; base: string };

  /** Branch name for session's work */
  headBranch?: string; // Branch name for the session's work

  /** Preview of last message (for list display) */
  lastMessage?: string;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}
