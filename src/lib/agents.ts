/**
 * DEPRECATED: Optional read-only cache helpers for localStorage.
 * 
 * Per AS-CORE-001 and AS-03: Server-side is now the source of truth.
 * These functions are retained only for reading legacy data during migration.
 * 
 * DO NOT use these functions for writing - all writes must go through the API.
 * The migration code in src/app/agents/page.tsx handles moving data from localStorage to server.
 */

interface LegacyAgentSession {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  repository?: string;
  lastMessage?: string;
}

/**
 * Read-only: Get a legacy session from localStorage cache.
 * @deprecated Use API endpoint /api/sessions/[id] instead
 */
export function getAgentSession(sessionId: string): LegacyAgentSession | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`agentSession_${sessionId}`);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Read-only: Get all legacy sessions from localStorage cache.
 * @deprecated Use API endpoint /api/sessions instead
 */
export function getAllAgentSessions(): LegacyAgentSession[] {
  if (typeof window === 'undefined') return [];
  const sessions: LegacyAgentSession[] = [];
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

// Removed: saveAgentSession, saveAgentMessage
// Writing to localStorage is no longer allowed - server-side is source of truth.
// Use API endpoints instead: POST /api/sessions, PATCH /api/sessions/[id]
