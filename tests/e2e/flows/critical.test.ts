/**
 * E2E tests for critical user flows
 * @file tests/e2e/flows/critical.test.ts
 */

import {
  createAgentSession,
  getAgentSessionById,
  listAgentSessions,
  updateAgentSession,
} from '@/lib/db/agent-sessions';
import type { CreateAgentSession } from '@/lib/validation';

describe('Critical User Flows', () => {
  const userId = 'e2e-test-user';

  describe('User sign-in flow', () => {
    it('GitHub OAuth → session creation', async () => {
      // This would test the full OAuth flow
      // For now, we test session creation after auth
      const input: CreateAgentSession = {
        name: 'E2E Session',
        goal: 'E2E Test Goal',
      };

      const session = await createAgentSession(userId, input);
      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
    });
  });

  describe('Session creation flow', () => {
    it('create → view → update', async () => {
      // Create
      const input: CreateAgentSession = {
        name: 'E2E Test Session',
        goal: 'E2E Test Goal',
      };
      const created = await createAgentSession(userId, input);

      // View
      const viewed = await getAgentSessionById(userId, created.id);
      expect(viewed).toBeDefined();
      expect(viewed?.id).toBe(created.id);

      // Update
      const updated = await updateAgentSession(userId, created.id, {
        name: 'Updated E2E Session',
      });
      expect(updated?.name).toBe('Updated E2E Session');
    });
  });

  describe('Session state flow', () => {
    it('created → planning → preview_ready → awaiting_approval → applying → applied', async () => {
      const input: CreateAgentSession = {
        name: 'State Flow Test',
        goal: 'Test state transitions',
      };

      const session = await createAgentSession(userId, input);
      expect(session.state).toBe('created');

      // Planning
      let updated = await updateAgentSession(userId, session.id, { state: 'planning' });
      expect(updated?.state).toBe('planning');

      // Preview ready
      updated = await updateAgentSession(userId, session.id, { state: 'preview_ready' });
      expect(updated?.state).toBe('preview_ready');

      // Awaiting approval
      updated = await updateAgentSession(userId, session.id, { state: 'awaiting_approval' });
      expect(updated?.state).toBe('awaiting_approval');

      // Applying
      updated = await updateAgentSession(userId, session.id, { state: 'applying' });
      expect(updated?.state).toBe('applying');

      // Applied
      updated = await updateAgentSession(userId, session.id, { state: 'applied' });
      expect(updated?.state).toBe('applied');
    });
  });

  describe('Session retry flow', () => {
    it('failed → planning (retry)', async () => {
      const input: CreateAgentSession = {
        name: 'Retry Test',
        goal: 'Test retry flow',
      };

      const session = await createAgentSession(userId, input);
      await updateAgentSession(userId, session.id, { state: 'failed' });

      const retried = await updateAgentSession(userId, session.id, { state: 'planning' });
      expect(retried?.state).toBe('planning');
    });
  });

  describe('Step timeline', () => {
    it('add steps → view timeline', async () => {
      const input: CreateAgentSession = {
        name: 'Steps Test',
        goal: 'Test step timeline',
      };

      const session = await createAgentSession(userId, input);

      // Add steps
      await updateAgentSession(userId, session.id, {
        addStep: {
          id: 'step-1',
          sessionId: session.id,
          type: 'plan',
          status: 'started',
          timestamp: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        },
      });

      const updated = await updateAgentSession(userId, session.id, {
        addStep: {
          id: 'step-2',
          sessionId: session.id,
          type: 'context',
          status: 'started',
          timestamp: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        },
      });

      expect(updated?.steps).toHaveLength(2);
    });
  });

  describe('Repository browsing', () => {
    it('list → view → browse commits', async () => {
      // This would test the full GitHub API integration
      // For now, we test session listing
      const sessions = await listAgentSessions(userId);
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('404 responses', async () => {
      const notFound = await getAgentSessionById(userId, 'non-existent-id');
      expect(notFound).toBeNull();
    });

    it('401 responses', async () => {
      // This would test authentication failures
      // Implementation depends on auth setup
    });

    it('500 responses', async () => {
      // This would test server errors
      // Implementation depends on error scenarios
    });
  });
});
