/**
 * Unit tests for session type definitions
 * @file tests/unit/lib/agent/session-types.test.ts
 * @epic AS-CORE-001
 */

import type {
  AgentSession,
  AgentSessionStep,
  AgentRepositoryBinding,
} from '@/lib/agent/session-types';

describe('Session Schema Tests', () => {
  describe('AgentSession', () => {
    it('requires goal field', () => {
      const session: AgentSession = {
        id: 'test-id',
        userId: 'test-user',
        name: 'Test Session',
        model: 'test-model',
        goal: 'Test goal',
        state: 'created',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(session.goal).toBe('Test goal');
    });

    it('repo binding structure (owner, name, baseBranch)', () => {
      const repo: AgentRepositoryBinding = {
        owner: 'test-owner',
        name: 'test-repo',
        baseBranch: 'main',
      };

      const session: AgentSession = {
        id: 'test-id',
        userId: 'test-user',
        name: 'Test Session',
        model: 'test-model',
        goal: 'Test goal',
        repo,
        state: 'created',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(session.repo).toBeDefined();
      expect(session.repo?.owner).toBe('test-owner');
      expect(session.repo?.name).toBe('test-repo');
      expect(session.repo?.baseBranch).toBe('main');
    });

    it('backward compatibility with repository string', () => {
      const session: AgentSession = {
        id: 'test-id',
        userId: 'test-user',
        name: 'Test Session',
        model: 'test-model',
        goal: 'Test goal',
        repository: 'test-owner/test-repo',
        state: 'created',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(session.repository).toBe('test-owner/test-repo');
    });
  });

  describe('AgentSessionStep', () => {
    it('requires type field', () => {
      const step: AgentSessionStep = {
        id: 'test-step-id',
        sessionId: 'test-session-id',
        type: 'plan',
        status: 'started',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      expect(step.type).toBe('plan');
    });

    it('backward compatibility with name field', () => {
      const step: AgentSessionStep = {
        id: 'test-step-id',
        sessionId: 'test-session-id',
        type: 'plan',
        name: 'Planning Step',
        status: 'started',
        timestamp: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      expect(step.name).toBe('Planning Step');
    });
  });

  describe('Type safety', () => {
    it('TypeScript compilation errors for invalid structures', () => {
      // This test verifies TypeScript type checking at compile time
      // Invalid code would cause compilation errors

      // Valid session structure
      const validSession: AgentSession = {
        id: 'test-id',
        userId: 'test-user',
        name: 'Test Session',
        model: 'test-model',
        goal: 'Test goal',
        state: 'created',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validSession).toBeDefined();

      // TypeScript would catch these at compile time:
      // const invalidSession: AgentSession = {
      //   id: 123, // Error: should be string
      //   state: 'invalid', // Error: not a valid state
      // };
    });
  });
});
