export type AgentSessionStepStatus = 'started' | 'succeeded' | 'failed';

export type AgentStepType = 'plan' | 'context' | 'model' | 'diff' | 'apply';

export interface AgentSessionStep {
  id: string;
  sessionId: string;
  type: AgentStepType; // Per AS-CORE-002, should use type instead of name
  name?: string; // Deprecated: kept for backward compatibility
  status: AgentSessionStepStatus;
  timestamp: string;
  startedAt: string; // Per AS-CORE-002
  endedAt?: string; // Per AS-CORE-002
  details?: string;
  meta?: Record<string, unknown>; // Per AS-CORE-002
}
export type AgentSessionState =
  | 'created'
  | 'planning'
  | 'preview_ready'
  | 'awaiting_approval'
  | 'applying'
  | 'applied'
  | 'failed';

export type AgentRole = 'user' | 'assistant';

export interface AgentMessage {
  role: AgentRole;
  content: string;
  timestamp: string;
}

export interface AgentRepositoryBinding {
  owner: string;
  name: string;
  baseBranch: string;
}

export interface AgentSession {
  id: string;
  userId: string;
  name: string;
  model: string;
  goal: string; // Required field per AS-CORE-001
  repo?: AgentRepositoryBinding; // Primary format for repository binding
  repository?: string; // Deprecated: kept for backward compatibility
  state: AgentSessionState;
  messages: AgentMessage[];
  steps?: AgentSessionStep[];
  previewId?: string;
  pr?: { number: number; url: string; head: string; base: string };
  headBranch?: string; // Branch name for the session's work
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}
