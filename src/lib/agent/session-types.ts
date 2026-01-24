export type AgentSessionStepStatus = 'started' | 'succeeded' | 'failed';

export interface AgentSessionStep {
  name: string;
  status: AgentSessionStepStatus;
  timestamp: string;
  details?: string;
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
  goal?: string;
  repo?: AgentRepositoryBinding;
  repository?: string;
  state: AgentSessionState;
  messages: AgentMessage[];
  steps?: AgentSessionStep[];
  previewId?: string;
  pr?: { number: number; url: string; head: string; base: string };
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}
