/**
 * Unit tests for agent-sessions state machine
 * @file tests/unit/lib/db/agent-sessions-state.test.ts
 * @epic AS-CORE-002
 */

import { randomUUID } from 'crypto';
import {
  createAgentSession,
  updateAgentSession,
  setAgentReadOnlyMode,
} from '@/lib/db/agent-sessions';
import type { AgentSessionState } from '@/lib/agent/session-types';
import type { CreateAgentSession } from '@/lib/validation';

// Helper to create test session input
function createTestSessionInput(overrides?: Partial<CreateAgentSession>): CreateAgentSession {
  return {
    name: 'Test Session',
    goal: 'Test goal',
    ...overrides,
  };
}

describe('AS-CORE-002 — State Machine Tests', () => {
  const userId = 'test-user-1';

  beforeEach(() => {
    setAgentReadOnlyMode(false);
  });

  describe('Valid transitions', () => {
    it('created → planning', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const updated = await updateAgentSession(userId, session.id, {
        state: 'planning',
      });

      expect(updated?.state).toBe('planning');
    });

    it('created → failed', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const updated = await updateAgentSession(userId, session.id, {
        state: 'failed',
      });

      expect(updated?.state).toBe('failed');
    });

    it('planning → preview_ready', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'preview_ready',
      });

      expect(updated?.state).toBe('preview_ready');
    });

    it('planning → failed', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'failed',
      });

      expect(updated?.state).toBe('failed');
    });

    it('preview_ready → awaiting_approval', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'awaiting_approval',
      });

      expect(updated?.state).toBe('awaiting_approval');
    });

    it('preview_ready → planning (retry)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'planning',
      });

      expect(updated?.state).toBe('planning');
    });

    it('preview_ready → failed', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'failed',
      });

      expect(updated?.state).toBe('failed');
    });

    it('awaiting_approval → applying', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'applying',
      });

      expect(updated?.state).toBe('applying');
    });

    it('awaiting_approval → preview_ready (revision)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'preview_ready',
      });

      expect(updated?.state).toBe('preview_ready');
    });

    it('awaiting_approval → failed', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'failed',
      });

      expect(updated?.state).toBe('failed');
    });

    it('applying → applied', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      await updateAgentSession(userId, session.id, { state: 'applying' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'applied',
      });

      expect(updated?.state).toBe('applied');
    });

    it('applying → failed', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      await updateAgentSession(userId, session.id, { state: 'applying' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'failed',
      });

      expect(updated?.state).toBe('failed');
    });

    it('failed → planning (retry)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'failed' });
      const updated = await updateAgentSession(userId, session.id, {
        state: 'planning',
      });

      expect(updated?.state).toBe('planning');
    });
  });

  describe('Invalid transitions', () => {
    it('created → applying (should reject)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());

      await expect(
        updateAgentSession(userId, session.id, {
          state: 'applying' as AgentSessionState,
        })
      ).rejects.toThrow('Invalid session state transition');
    });

    it('applied → planning (should reject)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      await updateAgentSession(userId, session.id, { state: 'applying' });
      await updateAgentSession(userId, session.id, { state: 'applied' });

      await expect(
        updateAgentSession(userId, session.id, {
          state: 'planning' as AgentSessionState,
        })
      ).rejects.toThrow('Invalid session state transition');
    });

    it('applied → any state (should reject)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      await updateAgentSession(userId, session.id, { state: 'planning' });
      await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      await updateAgentSession(userId, session.id, { state: 'applying' });
      await updateAgentSession(userId, session.id, { state: 'applied' });

      await expect(
        updateAgentSession(userId, session.id, {
          state: 'failed' as AgentSessionState,
        })
      ).rejects.toThrow('Invalid session state transition');
    });
  });

  describe('Error handling', () => {
    it('throws descriptive error on invalid transition', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());

      await expect(
        updateAgentSession(userId, session.id, {
          state: 'applying' as AgentSessionState,
        })
      ).rejects.toThrow('Invalid session state transition: created -> applying');
    });
  });
});
