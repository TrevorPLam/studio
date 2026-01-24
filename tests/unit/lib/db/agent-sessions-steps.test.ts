/**
 * Unit tests for agent-sessions step timeline
 * @file tests/unit/lib/db/agent-sessions-steps.test.ts
 * @epic AS-CORE-002
 */

import { randomUUID } from 'crypto';
import {
  createAgentSession,
  updateAgentSession,
} from '@/lib/db/agent-sessions';
import type { AgentSessionStep } from '@/lib/agent/session-types';
import type { CreateAgentSession } from '@/lib/validation';

// Helper to create test session input
function createTestSessionInput(overrides?: Partial<CreateAgentSession>): CreateAgentSession {
  return {
    name: 'Test Session',
    goal: 'Test goal',
    ...overrides,
  };
}

describe('AS-CORE-002 — Step Timeline Tests', () => {
  const userId = 'test-user-1';

  describe('addStep()', () => {
    it('creates step with required fields (id, sessionId, type, status)', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
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
      expect(updated?.steps?.[0].id).toBe(step.id);
      expect(updated?.steps?.[0].sessionId).toBe(session.id);
      expect(updated?.steps?.[0].type).toBe('plan');
      expect(updated?.steps?.[0].status).toBe('started');
    });

    it('sets startedAt timestamp', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const now = new Date().toISOString();
      const step: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'started',
        timestamp: now,
        startedAt: now,
      };

      const updated = await updateAgentSession(userId, session.id, {
        addStep: step,
      });

      expect(updated?.steps?.[0].startedAt).toBe(now);
    });

    it('allows endedAt for completed steps', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const step: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'succeeded',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
      };

      const updated = await updateAgentSession(userId, session.id, {
        addStep: step,
      });

      expect(updated?.steps?.[0].endedAt).toBeDefined();
    });

    it('stores meta data', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const step: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'started',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        meta: {
          filesChanged: 5,
          linesAdded: 100,
        },
      };

      const updated = await updateAgentSession(userId, session.id, {
        addStep: step,
      });

      expect(updated?.steps?.[0].meta).toEqual({
        filesChanged: 5,
        linesAdded: 100,
      });
    });
  });

  describe('Step types', () => {
    const stepTypes: Array<'plan' | 'context' | 'model' | 'diff' | 'apply'> = [
      'plan',
      'context',
      'model',
      'diff',
      'apply',
    ];

    stepTypes.forEach((type) => {
      it(`validates '${type}' step type`, async () => {
        const session = await createAgentSession(userId, createTestSessionInput());
        const step: AgentSessionStep = {
          id: randomUUID(),
          sessionId: session.id,
          type,
          status: 'started',
          timestamp: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        };

        const updated = await updateAgentSession(userId, session.id, {
          addStep: step,
        });

        expect(updated?.steps?.[0].type).toBe(type);
      });
    });
  });

  describe('Step status', () => {
    const statuses: Array<'started' | 'succeeded' | 'failed'> = [
      'started',
      'succeeded',
      'failed',
    ];

    statuses.forEach((status) => {
      it(`validates '${status}' step status`, async () => {
        const session = await createAgentSession(userId, createTestSessionInput());
        const step: AgentSessionStep = {
          id: randomUUID(),
          sessionId: session.id,
          type: 'plan',
          status,
          timestamp: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        };

        const updated = await updateAgentSession(userId, session.id, {
          addStep: step,
        });

        expect(updated?.steps?.[0].status).toBe(status);
      });
    });
  });

  describe('Step timeline', () => {
    it('maintains chronological order', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const step1: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'started',
        timestamp: new Date(Date.now() - 1000).toISOString(),
        startedAt: new Date(Date.now() - 1000).toISOString(),
      };
      const step2: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'context',
        status: 'started',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      await updateAgentSession(userId, session.id, { addStep: step1 });
      const updated = await updateAgentSession(userId, session.id, { addStep: step2 });

      expect(updated?.steps).toHaveLength(2);
      expect(updated?.steps?.[0].id).toBe(step1.id);
      expect(updated?.steps?.[1].id).toBe(step2.id);
    });

    it('allows multiple steps of same type', async () => {
      const session = await createAgentSession(userId, createTestSessionInput());
      const step1: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'started',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };
      const step2: AgentSessionStep = {
        id: randomUUID(),
        sessionId: session.id,
        type: 'plan',
        status: 'succeeded',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      await updateAgentSession(userId, session.id, { addStep: step1 });
      const updated = await updateAgentSession(userId, session.id, { addStep: step2 });

      expect(updated?.steps).toHaveLength(2);
      expect(updated?.steps?.every(s => s.type === 'plan')).toBe(true);
    });
  });
});
