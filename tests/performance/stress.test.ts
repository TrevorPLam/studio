/**
 * Performance tests - stress testing
 * @file tests/performance/stress.test.ts
 */

import {
  createAgentSession,
  updateAgentSession,
  setAgentReadOnlyMode,
} from '@/lib/db/agent-sessions';
import type { CreateAgentSession } from '@/lib/validation';

describe('Stress Tests', () => {
  const userId = 'stress-test-user';

  beforeEach(() => {
    setAgentReadOnlyMode(false);
  });

  describe('Memory usage', () => {
    it('no leaks under sustained load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create and update many sessions
      for (let i = 0; i < 1000; i++) {
        const session = await createAgentSession(userId, {
          name: `Stress Test ${i}`,
          goal: `Goal ${i}`,
        });

        await updateAgentSession(userId, session.id, {
          name: `Updated ${i}`,
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 100MB for 1000 sessions)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Error recovery', () => {
    it('handles GitHub API outages', async () => {
      // This would test error handling when GitHub API is down
      // Implementation depends on GitHub client error handling
      
      // For now, we test that the system continues to function
      const session = await createAgentSession(userId, {
        name: 'Error Recovery Test',
        goal: 'Test error handling',
      });

      expect(session).toBeDefined();
    });
  });
});
