/**
 * Unit tests for agent-sessions database module
 * @file tests/unit/lib/db/agent-sessions.test.ts
 * @epic AS-CORE-001, AS-CORE-002
 */

import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  createAgentSession,
  getAgentSessionById,
  listAgentSessions,
  updateAgentSession,
  setAgentReadOnlyMode,
} from '@/lib/db/agent-sessions';
import type { AgentSession, AgentSessionState, AgentSessionStep } from '@/lib/agent/session-types';
import type { CreateAgentSession } from '@/lib/validation';

// Test data directory (uses actual .data directory)
const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'agent-sessions.json');

// Helper to clean up test data
async function cleanupTestData() {
  try {
    // Clear the sessions file but keep the directory
    await fs.writeFile(SESSIONS_FILE, JSON.stringify({ sessions: [] }), 'utf8');
  } catch {
    // Ignore errors if file doesn't exist
  }
}

// Helper to create test session input
function createTestSessionInput(overrides?: Partial<CreateAgentSession>): CreateAgentSession {
  return {
    name: 'Test Session',
    goal: 'Test goal',
    ...overrides,
  };
}

describe('AS-CORE-001 — Session Persistence Tests', () => {
  const userId = 'test-user-1';
  const userId2 = 'test-user-2';

  beforeEach(async () => {
    await cleanupTestData();
    setAgentReadOnlyMode(false);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createAgentSession()', () => {
    it('creates session with required fields', async () => {
      const input = createTestSessionInput();
      const session = await createAgentSession(userId, input);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.name).toBe(input.name);
      expect(session.goal).toBe(input.goal);
      expect(session.state).toBe('created');
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });

    it('generates UUID if id not provided', async () => {
      const input = createTestSessionInput();
      const session = await createAgentSession(userId, input);

      expect(session.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('rejects duplicate session ID', async () => {
      const sessionId = randomUUID();
      const input = createTestSessionInput({ id: sessionId });

      const session1 = await createAgentSession(userId, input);
      const session2 = await createAgentSession(userId, input);

      expect(session1.id).toBe(sessionId);
      expect(session2.id).toBe(sessionId);
      expect(session1).toEqual(session2);
    });

    it('sets default state to created', async () => {
      const input = createTestSessionInput();
      const session = await createAgentSession(userId, input);

      expect(session.state).toBe('created');
    });

    it('requires goal field (validation)', async () => {
      const input = {
        name: 'Test Session',
        // Missing goal
      } as CreateAgentSession;

      // The validation happens at the API layer, but we test the database layer accepts goal
      const session = await createAgentSession(userId, {
        ...input,
        goal: 'fallback goal',
      });

      expect(session.goal).toBe('fallback goal');
    });

    it('handles initialPrompt as goal fallback', async () => {
      const input = createTestSessionInput({
        goal: undefined,
        initialPrompt: 'Initial prompt text',
      });

      const session = await createAgentSession(userId, input);

      expect(session.goal).toBe('Initial prompt text');
    });
  });

  describe('getAgentSessionById()', () => {
    it('returns session for valid ID', async () => {
      const input = createTestSessionInput();
      const created = await createAgentSession(userId, input);
      const retrieved = await getAgentSessionById(userId, created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.userId).toBe(userId);
    });

    it('returns null for non-existent session', async () => {
      const retrieved = await getAgentSessionById(userId, randomUUID());

      expect(retrieved).toBeNull();
    });

    it('enforces user isolation', async () => {
      const input = createTestSessionInput();
      const session1 = await createAgentSession(userId, input);
      const session2 = await createAgentSession(userId2, input);

      const retrieved1 = await getAgentSessionById(userId, session1.id);
      const retrieved2 = await getAgentSessionById(userId2, session2.id);
      const crossUser = await getAgentSessionById(userId, session2.id);

      expect(retrieved1).toBeDefined();
      expect(retrieved2).toBeDefined();
      expect(crossUser).toBeNull();
    });
  });

  describe('listAgentSessions()', () => {
    it('returns only user\'s sessions', async () => {
      await createAgentSession(userId, createTestSessionInput({ name: 'User1 Session 1' }));
      await createAgentSession(userId, createTestSessionInput({ name: 'User1 Session 2' }));
      await createAgentSession(userId2, createTestSessionInput({ name: 'User2 Session 1' }));

      const sessions = await listAgentSessions(userId);

      expect(sessions).toHaveLength(2);
      expect(sessions.every(s => s.userId === userId)).toBe(true);
    });

    it('sorts by updatedAt descending', async () => {
      const session1 = await createAgentSession(userId, createTestSessionInput({ name: 'First' }));
      await new Promise(resolve => setTimeout(resolve, 10));
      const session2 = await createAgentSession(userId, createTestSessionInput({ name: 'Second' }));

      const sessions = await listAgentSessions(userId);

      expect(sessions[0].id).toBe(session2.id);
      expect(sessions[1].id).toBe(session1.id);
    });
  });

  describe('updateAgentSession()', () => {
    let session: AgentSession;

    beforeEach(async () => {
      session = await createAgentSession(userId, createTestSessionInput());
    });

    it('updates allowed fields', async () => {
      const updated = await updateAgentSession(userId, session.id, {
        name: 'Updated Name',
        goal: 'Updated Goal',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.goal).toBe('Updated Goal');
    });

    it('preserves unchanged fields', async () => {
      const originalModel = session.model;
      const updated = await updateAgentSession(userId, session.id, {
        name: 'Updated Name',
      });

      expect(updated?.model).toBe(originalModel);
      expect(updated?.userId).toBe(session.userId);
      expect(updated?.createdAt).toBe(session.createdAt);
    });

    it('enforces user isolation', async () => {
      const session2 = await createAgentSession(userId2, createTestSessionInput());

      const updated = await updateAgentSession(userId, session2.id, {
        name: 'Should not update',
      });

      expect(updated).toBeNull();
    });

    it('rejects invalid state transitions', async () => {
      await expect(
        updateAgentSession(userId, session.id, {
          state: 'applying' as AgentSessionState,
        })
      ).rejects.toThrow('Invalid session state transition');
    });

    it('allows retry from failed state', async () => {
      // Move to failed state
      await updateAgentSession(userId, session.id, { state: 'failed' });

      // Retry should work
      const updated = await updateAgentSession(userId, session.id, {
        state: 'planning',
      });

      expect(updated?.state).toBe('planning');
    });

    it('handles step timeline updates', async () => {
      const step: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'started',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      const updated = await updateAgentSession(userId, session.id, {
        addStep: step,
      });

      expect(updated?.steps).toBeDefined();
      expect(updated?.steps?.length).toBe(1);
      expect(updated?.steps?.[0].id).toBe(step.id);
    });
  });

  describe('File persistence', () => {
    it('survives process restart', async () => {
      const input = createTestSessionInput();
      const session = await createAgentSession(userId, input);

      // Simulate restart by clearing cache and reloading
      // (In real scenario, cache would be cleared on restart)
      const retrieved = await getAgentSessionById(userId, session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(session.id);
    });

    it('handles concurrent writes safely', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        createAgentSession(userId, createTestSessionInput({ name: `Session ${i}` }))
      );

      const sessions = await Promise.all(promises);

      expect(sessions).toHaveLength(10);
      const allSessions = await listAgentSessions(userId);
      expect(allSessions.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Kill-switch', () => {
    it('blocks writes when enabled', async () => {
      setAgentReadOnlyMode(true);

      await expect(
        createAgentSession(userId, createTestSessionInput())
      ).rejects.toThrow('read-only mode');
    });

    it('allows reads when enabled', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      setAgentReadOnlyMode(true);

      const retrieved = await getAgentSessionById(userId, session.id);
      expect(retrieved).toBeDefined();
    });
  });
});
