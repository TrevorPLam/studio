/**
 * Unit tests for validation schemas
 * @file tests/unit/lib/validation.test.ts
 */

import {
  createAgentSessionSchema,
  agentMessageSchema,
  validateRequest,
} from '@/lib/validation';
import { ValidationError } from '@/lib/types';

describe('Validation Schema Tests', () => {
  describe('createAgentSessionSchema', () => {
    it('validates required name', () => {
      const result = createAgentSessionSchema.safeParse({
        goal: 'Test goal',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('name');
      }
    });

    it('validates name length (1-100)', () => {
      const tooShort = createAgentSessionSchema.safeParse({
        name: '',
        goal: 'Test goal',
      });
      expect(tooShort.success).toBe(false);

      const tooLong = createAgentSessionSchema.safeParse({
        name: 'a'.repeat(101),
        goal: 'Test goal',
      });
      expect(tooLong.success).toBe(false);

      const valid = createAgentSessionSchema.safeParse({
        name: 'Valid Name',
        goal: 'Test goal',
      });
      expect(valid.success).toBe(true);
    });

    it('requires goal or initialPrompt', () => {
      const noGoal = createAgentSessionSchema.safeParse({
        name: 'Test Session',
      });
      expect(noGoal.success).toBe(false);

      const withGoal = createAgentSessionSchema.safeParse({
        name: 'Test Session',
        goal: 'Test goal',
      });
      expect(withGoal.success).toBe(true);

      const withInitialPrompt = createAgentSessionSchema.safeParse({
        name: 'Test Session',
        initialPrompt: 'Initial prompt',
      });
      expect(withInitialPrompt.success).toBe(true);
    });

    it('validates repo binding structure', () => {
      const valid = createAgentSessionSchema.safeParse({
        name: 'Test Session',
        goal: 'Test goal',
        repo: {
          owner: 'test-owner',
          name: 'test-repo',
          baseBranch: 'main',
        },
      });
      expect(valid.success).toBe(true);

      const invalid = createAgentSessionSchema.safeParse({
        name: 'Test Session',
        goal: 'Test goal',
        repo: {
          owner: '',
          name: 'test-repo',
        },
      });
      expect(invalid.success).toBe(false);
    });

    it('accepts deprecated repository string', () => {
      const result = createAgentSessionSchema.safeParse({
        name: 'Test Session',
        goal: 'Test goal',
        repository: 'test-owner/test-repo',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('agentMessageSchema', () => {
    it('validates role enum', () => {
      const validUser = agentMessageSchema.safeParse({
        role: 'user',
        content: 'Test message',
      });
      expect(validUser.success).toBe(true);

      const validAssistant = agentMessageSchema.safeParse({
        role: 'assistant',
        content: 'Test message',
      });
      expect(validAssistant.success).toBe(true);

      const invalid = agentMessageSchema.safeParse({
        role: 'invalid',
        content: 'Test message',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates content not empty', () => {
      const empty = agentMessageSchema.safeParse({
        role: 'user',
        content: '',
      });
      expect(empty.success).toBe(false);

      const valid = agentMessageSchema.safeParse({
        role: 'user',
        content: 'Non-empty content',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('validateRequest()', () => {
    it('throws ValidationError on invalid input', () => {
      expect(() => {
        validateRequest(createAgentSessionSchema, {
          name: '',
        });
      }).toThrow(ValidationError);
    });

    it('includes field path in error', () => {
      try {
        validateRequest(createAgentSessionSchema, {
          name: '',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.field).toBeDefined();
        }
      }
    });

    it('returns parsed data on valid input', () => {
      const input = {
        name: 'Test Session',
        goal: 'Test goal',
      };

      const result = validateRequest(createAgentSessionSchema, input);

      expect(result.name).toBe('Test Session');
      expect(result.goal).toBe('Test goal');
    });
  });
});
