/**
 * ============================================================================
 * AGENTS PAGE COMPONENT
 * ============================================================================
 * 
 * @file src/app/agents/page.tsx
 * @route /agents
 * @epic AS-CORE-001, AS-03
 * 
 * PURPOSE:
 * Main page for listing and creating agent sessions.
 * Handles legacy localStorage migration and session management.
 * 
 * FEATURES:
 * - List user's agent sessions
 * - Create new sessions
 * - Migrate legacy localStorage sessions to server
 * - Authentication-gated access
 * 
 * RELATED FILES:
 * - src/app/api/sessions/route.ts (Session API)
 * - src/app/agents/[id]/page.tsx (Session detail page)
 * - src/lib/agents.ts (Legacy localStorage helpers)
 * 
 * MIGRATION:
 * Per AS-03: Migrates localStorage sessions to server on first load.
 * 
 * ============================================================================
 */

'use client';

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { AgentMessage, AgentSession } from '@/lib/agent/session-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Plus } from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Legacy session format from localStorage.
 * 
 * Used during migration from localStorage to server-side storage.
 * 
 * @deprecated Use AgentSession from @/lib/agent/session-types
 */
interface LegacyAgentSession {
  id: string;
  name: string;
  model?: string;
  createdAt?: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>;
  repository?: string;
}

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Convert legacy messages to AgentMessage format with timestamps.
 * 
 * @param messages - Legacy message array
 * @returns AgentMessage array with timestamps
 */
function withTimestamps(messages: LegacyAgentSession['messages']): AgentMessage[] {
  if (!messages) {
    return [];
  }

  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

// ============================================================================
// SECTION: AGENTS PAGE COMPONENT
// ============================================================================

/**
 * Agents page component.
 * 
 * Displays list of user's agent sessions and allows creating new ones.
 * 
 * @returns Agents page JSX
 */
export default function AgentsPage() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionPrompt, setNewSessionPrompt] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  const isAuthenticated = status === 'authenticated' && !!session;

  /**
   * Sessions sorted by most recently updated.
   */
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      ),
    [sessions]
  );

  // ========================================================================
  // EFFECT: LOAD SESSIONS & MIGRATE LEGACY DATA
  // ========================================================================
  // Per AS-03: Migrate localStorage sessions to server on first load

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    /**
     * Migrate legacy localStorage sessions to server.
     * 
     * Per AS-03: Server-side is now source of truth.
     * This function runs once to migrate existing localStorage data.
     */
    const migrateLegacySessions = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      // ====================================================================
      // COLLECT LEGACY SESSIONS FROM LOCALSTORAGE
      // ====================================================================
      const legacySessions: LegacyAgentSession[] = [];
      const legacyKeys: string[] = [];

      // Find all agentSession_* keys
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || !key.startsWith('agentSession_')) {
          continue;
        }

        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        try {
          legacySessions.push(JSON.parse(raw) as LegacyAgentSession);
          legacyKeys.push(key);
        } catch (error) {
          console.error('Failed to parse legacy session', error);
        }
      }

      // Also check for agentSessions collection
      const legacyCollection = localStorage.getItem('agentSessions');
      if (legacyCollection) {
        try {
          const parsed = JSON.parse(legacyCollection) as LegacyAgentSession[];
          legacySessions.push(...parsed);
        } catch (error) {
          console.error('Failed to parse legacy session collection', error);
        }
      }

      if (legacySessions.length === 0) {
        return;
      }

      // ====================================================================
      // MIGRATE EACH LEGACY SESSION TO SERVER
      // ====================================================================
      for (const legacy of legacySessions) {
        if (!legacy.id || !legacy.name) {
          continue;
        }

        try {
          // Extract goal from initial message or use session name as fallback
          // Per AS-CORE-001: goal field is required
          const goal = legacy.messages && legacy.messages.length > 0 
            ? legacy.messages[0].content.slice(0, 200) // Use first message as goal
            : legacy.name; // Fallback to session name
          
          // Create session on server
          const createResponse = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: legacy.id,
              name: legacy.name,
              goal: goal, // Per AS-CORE-001: goal is required
              model: legacy.model,
              repository: legacy.repository,
            }),
          });

          if (!createResponse.ok) {
            continue;
          }

          // Migrate messages if present
          if (legacy.messages && legacy.messages.length > 0) {
            await fetch(`/api/sessions/${legacy.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: withTimestamps(legacy.messages) }),
            });
          }
        } catch (error) {
          console.error('Failed to migrate legacy session', error);
        }
      }

      // ====================================================================
      // CLEAN UP LOCALSTORAGE
      // ====================================================================
      // Remove migrated sessions from localStorage
      for (const key of legacyKeys) {
        localStorage.removeItem(key);
      }
      localStorage.removeItem('agentSessions');
    };

    /**
     * Load sessions from server.
     * 
     * Runs after migration to fetch all sessions (including migrated ones).
     */
    const loadSessions = async () => {
      setIsLoadingSessions(true);
      setSessionError(null);

      try {
        // Migrate legacy data first
        await migrateLegacySessions();
        
        // Then load from server
        const response = await fetch('/api/sessions', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load sessions');
        }

        const data = (await response.json()) as { sessions: AgentSession[] };
        setSessions(data.sessions);
      } catch (error) {
        console.error('Error loading sessions', error);
        setSessionError('Unable to load sessions. Please refresh and try again.');
      } finally {
        setIsLoadingSessions(false);
      }
    };

    void loadSessions();
  }, [isAuthenticated]);

  // ========================================================================
  // FUNCTION: CREATE SESSION
  // ========================================================================

  /**
   * Create a new agent session.
   * 
   * Per AS-CORE-001: goal field is required.
   * Uses initialPrompt as goal if provided, otherwise uses session name.
   * 
   * @see AS-CORE-001 AS-01
   */
  const createSession = async () => {
    if (!newSessionName.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSessionName.trim(),
          goal: newSessionPrompt.trim() || newSessionName.trim(), // Per AS-CORE-001: goal is required
          initialPrompt: newSessionPrompt.trim() || undefined, // Keep for backward compatibility
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const created = (await response.json()) as AgentSession;
      // Update local state (optimistic update)
      setSessions((prev) => [created, ...prev.filter((sessionItem) => sessionItem.id !== created.id)]);
      setNewSessionName('');
      setNewSessionPrompt('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating session', error);
      setSessionError('Unable to create session. Please try again.');
    }
  };

  // ========================================================================
  // RENDER: LOADING STATE
  // ========================================================================
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: AUTHENTICATION REQUIRED
  // ========================================================================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in with GitHub to access agents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn('github')} className="w-full">
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // RENDER: MAIN CONTENT
  // ========================================================================
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* ================================================================
            HEADER & CREATE BUTTON
            ================================================================ */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Agent Sessions</h1>
            <p className="text-muted-foreground mt-1">Create and manage AI agent sessions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent Session</DialogTitle>
                <DialogDescription>Start a new conversation with an AI agent</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name</Label>
                  <Input
                    id="name"
                    placeholder="My Agent Session"
                    value={newSessionName}
                    onChange={(event) => setNewSessionName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Initial Prompt (Optional)</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you want the agent to help with..."
                    value={newSessionPrompt}
                    onChange={(event) => setNewSessionPrompt(event.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={createSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ================================================================
            ERROR MESSAGE
            ================================================================ */}
        {sessionError && (
          <Card className="mb-4 border-destructive/50">
            <CardContent className="py-4 text-sm text-destructive">{sessionError}</CardContent>
          </Card>
        )}

        {/* ================================================================
            SESSIONS LIST
            ================================================================ */}
        {isLoadingSessions ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Loading sessions...</CardContent>
          </Card>
        ) : sortedSessions.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No agent sessions yet. Create your first session to get started.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Sessions grid
          <div className="grid gap-4">
            {sortedSessions.map((agentSession) => (
              <Link key={agentSession.id} href={`/agents/${agentSession.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <CardTitle className="text-lg">{agentSession.name}</CardTitle>
                          <CardDescription>
                            {agentSession.model} • {new Date(agentSession.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {agentSession.lastMessage && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{agentSession.lastMessage}</p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
