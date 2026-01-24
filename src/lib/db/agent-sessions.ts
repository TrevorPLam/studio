import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
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

interface UpdateAgentSessionInput {
  name?: string;
  model?: string;
  repository?: string;
  state?: AgentSessionState;
  messages?: AgentMessageInput[];
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

  const updated: AgentSession = {
    ...current,
    ...updates,
    messages: nextMessages,
    lastMessage: computeLastMessage(nextMessages),
    updatedAt,
  };

  const nextSessions = [...data.sessions];
  nextSessions[index] = updated;

  await persistSessions({ sessions: nextSessions });
  return updated;
}
