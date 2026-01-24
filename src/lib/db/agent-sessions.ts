// --- Kill Switch / Read-Only Mode ---
let AGENT_READ_ONLY_MODE = false;
export function setAgentReadOnlyMode(enabled: boolean) {
  AGENT_READ_ONLY_MODE = enabled;
}
function assertNotReadOnly() {
  if (AGENT_READ_ONLY_MODE) {
    throw new Error('Agent endpoints are in read-only mode');
  }
}
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// --- Path Policy Guardrails ---
const ALLOWED_DATA_DIRS = [
  path.join(process.cwd(), '.data'),
];
const DO_NOT_TOUCH_FILES = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'package.json'),
  path.join(process.cwd(), 'package-lock.json'),
  path.join(process.cwd(), 'yarn.lock'),
];

function isPathAllowed(targetPath: string): boolean {
  const normalized = path.resolve(targetPath);
  // Must be under an allowed data dir
  const allowed = ALLOWED_DATA_DIRS.some((dir) => normalized.startsWith(dir));
  // Must not be a do-not-touch file
  const forbidden = DO_NOT_TOUCH_FILES.some((file) => normalized === file);
  return allowed && !forbidden;
}
import type { AgentMessage, AgentSession, AgentSessionState } from '@/lib/agent/session-types';
import type { AgentMessageInput, CreateAgentSession } from '@/lib/validation';

interface SessionsFile {
  sessions: AgentSession[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'agent-sessions.json');
const DEFAULT_MODEL = 'googleai/gemini-2.5-flash';
const DEFAULT_STATE: AgentSessionState = 'created';

let cache: SessionsFile | null = null;
let writeQueue: Promise<void> = Promise.resolve();

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

async function persistSessions(data: SessionsFile) {
  assertNotReadOnly();
  if (!isPathAllowed(SESSIONS_FILE)) {
    throw new Error('Write access denied by path policy');
  }
  cache = data;
  writeQueue = writeQueue.then(() => fs.writeFile(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8'));
  await writeQueue;
}

function computeLastMessage(messages: AgentMessage[]): string | undefined {
  const lastUserOrAssistant = [...messages]
    .reverse()
    .find((message) => message.content.trim().length > 0);
  if (!lastUserOrAssistant) {
    return undefined;
  }
  return lastUserOrAssistant.content.slice(0, 100);
}

function normaliseMessages(messages: AgentMessageInput[]): AgentMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

export async function listAgentSessions(userId: string): Promise<AgentSession[]> {
  const data = await loadSessions();
  return data.sessions
    .filter((session) => session.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getAgentSessionById(userId: string, sessionId: string): Promise<AgentSession | null> {
  const data = await loadSessions();
  return data.sessions.find((session) => session.userId === userId && session.id === sessionId) ?? null;
}

export async function createAgentSession(userId: string, input: CreateAgentSession): Promise<AgentSession> {
  const data = await loadSessions();
  const now = new Date().toISOString();

  const sessionId = input.id?.trim() || randomUUID();
  const existing = data.sessions.find((session) => session.userId === userId && session.id === sessionId);
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
    repository: input.repository,
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

import type { AgentSessionStep } from '@/lib/agent/session-types';

interface UpdateAgentSessionInput {
  name?: string;
  model?: string;
  repository?: string;
  state?: AgentSessionState;
  messages?: AgentMessageInput[];
  steps?: AgentSessionStep[];
  addStep?: AgentSessionStep;
}

export async function updateAgentSession(
  userId: string,
  sessionId: string,
  updates: UpdateAgentSessionInput
): Promise<AgentSession | null> {
  const data = await loadSessions();
  const index = data.sessions.findIndex((session) => session.userId === userId && session.id === sessionId);

  if (index === -1) {
    return null;
  }

  const current = data.sessions[index];
  const nextMessages = updates.messages ? normaliseMessages(updates.messages) : current.messages;
  const updatedAt = new Date().toISOString();

  // --- Session state transition enforcement ---
  const allowedTransitions: Record<string, string[]> = {
    created: ['planning', 'failed'],
    planning: ['preview_ready', 'failed'],
    preview_ready: ['awaiting_approval', 'failed'],
    awaiting_approval: ['applying', 'failed'],
    applying: ['applied', 'failed'],
    applied: [],
    failed: [],
  };

  let nextState = current.state;
  if (typeof updates.state === 'string' && updates.state !== current.state) {
    const allowed = allowedTransitions[current.state] || [];
    if (!allowed.includes(updates.state)) {
      // Fail closed: invalid transition
      throw new Error(
        `Invalid session state transition: ${current.state} -> ${updates.state}`
      );
    }
    nextState = updates.state;
  }


  // Step timeline logic
  let nextSteps = Array.isArray(current.steps) ? [...current.steps] : [];
  if (Array.isArray(updates.steps)) {
    nextSteps = updates.steps;
  }
  if (updates.addStep) {
    nextSteps.push(updates.addStep);
  }

  const updated: AgentSession = {
    ...current,
    ...updates,
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
