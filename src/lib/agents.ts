// Legacy localStorage helpers retained as a cache/migration aid.
interface AgentSession {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  repository?: string;
  lastMessage?: string;
}

export function getAgentSession(sessionId: string): AgentSession | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`agentSession_${sessionId}`);
  return stored ? JSON.parse(stored) : null;
}

export function saveAgentSession(session: AgentSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`agentSession_${session.id}`, JSON.stringify(session));
}

export function saveAgentMessage(
  sessionId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  if (typeof window === 'undefined') return;
  const session = getAgentSession(sessionId);
  if (session) {
    session.messages = messages;
    if (messages.length > 0) {
      session.lastMessage = messages[messages.length - 1].content.substring(0, 100);
    }
    saveAgentSession(session);
  }
}

export function getAllAgentSessions(): AgentSession[] {
  if (typeof window === 'undefined') return [];
  const sessions: AgentSession[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('agentSession_')) {
      const session = localStorage.getItem(key);
      if (session) {
        sessions.push(JSON.parse(session));
      }
    }
  }
  return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
