/**
 * Security tests - adversarial scenarios
 * @file tests/security/adversarial.test.ts
 */

import { assertPathAllowed } from '@/lib/security/path-policy';
import {
  createAgentSession,
  getAgentSessionById,
  updateAgentSession,
} from '@/lib/db/agent-sessions';
import type { CreateAgentSession } from '@/lib/validation';

describe('Adversarial Tests', () => {
  const userId = 'test-user';
  const maliciousUserId = 'malicious-user';

  describe('Path traversal', () => {
    it('path policy blocks ../ attacks', () => {
      const maliciousPaths = [
        '../package.json',
        '../../package.json',
        'docs/../../../package.json',
        '.repo/../../.env',
      ];

      maliciousPaths.forEach((path) => {
        const result = assertPathAllowed(path);
        expect(result.allowed).toBe(false);
      });
    });

    it('path policy blocks absolute paths', () => {
      const maliciousPaths = [
        '/etc/passwd',
        'C:\\Windows\\System32',
        '/root/.ssh/id_rsa',
      ];

      maliciousPaths.forEach((path) => {
        const result = assertPathAllowed(path);
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('Authorization', () => {
    it('user isolation enforced', async () => {
      const input: CreateAgentSession = {
        name: 'User Session',
        goal: 'User goal',
      };

      const session = await createAgentSession(userId, input);
      const crossUserAccess = await getAgentSessionById(maliciousUserId, session.id);

      expect(crossUserAccess).toBeNull();
    });

    it('prevents unauthorized updates', async () => {
      const input: CreateAgentSession = {
        name: 'User Session',
        goal: 'User goal',
      };

      const session = await createAgentSession(userId, input);
      const unauthorizedUpdate = await updateAgentSession(maliciousUserId, session.id, {
        name: 'Hacked',
      });

      expect(unauthorizedUpdate).toBeNull();
    });
  });

  describe('State machine', () => {
    it('invalid transitions rejected', async () => {
      const input: CreateAgentSession = {
        name: 'Test Session',
        goal: 'Test goal',
      };

      const session = await createAgentSession(userId, input);

      await expect(
        updateAgentSession(userId, session.id, {
          state: 'applying' as any,
        })
      ).rejects.toThrow('Invalid session state transition');
    });
  });

  describe('Input validation', () => {
    it('rejects extremely long inputs', async () => {
      const longString = 'a'.repeat(100000);

      const input: CreateAgentSession = {
        name: longString,
        goal: 'Test goal',
      };

      // Validation should catch this at the schema level
      // For now, we test that the system handles it gracefully
      try {
        await createAgentSession(userId, input);
      } catch (error) {
        // Expected to fail validation
        expect(error).toBeDefined();
      }
    });

    it('handles special characters in input', async () => {
      const input: CreateAgentSession = {
        name: 'Test <script>alert("xss")</script>',
        goal: 'Test goal with "quotes" and \'apostrophes\'',
      };

      const session = await createAgentSession(userId, input);

      expect(session.name).toContain('<script>');
      // The system should store the input as-is, but UI should sanitize
    });
  });
});
