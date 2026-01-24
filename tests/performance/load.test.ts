/**
 * Performance tests - load testing
 * @file tests/performance/load.test.ts
 */

import {
  createAgentSession,
  listAgentSessions,
} from '@/lib/db/agent-sessions';
import type { CreateAgentSession } from '@/lib/validation';

describe('Load Tests', () => {
  const userId = 'load-test-user';

  describe('Session creation', () => {
    it('handles 100 concurrent requests', async () => {
      const requests = Array.from({ length: 100 }, (_, i) =>
        createAgentSession(userId, {
          name: `Load Test Session ${i}`,
          goal: `Load test goal ${i}`,
        })
      );

      const startTime = Date.now();
      const sessions = await Promise.all(requests);
      const duration = Date.now() - startTime;

      expect(sessions).toHaveLength(100);
      expect(duration).toBeLessThan(10000); // Should complete in < 10s
    });
  });

  describe('Session listing', () => {
    it('handles 1000 sessions', async () => {
      // Create 1000 sessions
      const createPromises = Array.from({ length: 1000 }, (_, i) =>
        createAgentSession(userId, {
          name: `Session ${i}`,
          goal: `Goal ${i}`,
        })
      );

      await Promise.all(createPromises);

      // List all sessions
      const startTime = Date.now();
      const sessions = await listAgentSessions(userId);
      const duration = Date.now() - startTime;

      expect(sessions.length).toBeGreaterThanOrEqual(1000);
      expect(duration).toBeLessThan(5000); // Should complete in < 5s
    });
  });

  describe('API response times', () => {
    it('P95 < 500ms for reads', async () => {
      const session = await createAgentSession(userId, {
        name: 'Performance Test',
        goal: 'Test read performance',
      });

      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        await listAgentSessions(userId);
        times.push(Date.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[Math.floor(times.length * 0.95)];

      expect(p95).toBeLessThan(500);
    });

    it('P95 < 1000ms for writes', async () => {
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        await createAgentSession(userId, {
          name: `Write Test ${i}`,
          goal: `Goal ${i}`,
        });
        times.push(Date.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[Math.floor(times.length * 0.95)];

      expect(p95).toBeLessThan(1000);
    });
  });
});
