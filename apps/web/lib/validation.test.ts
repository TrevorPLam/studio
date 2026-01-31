import { describe, expect, it } from 'vitest';
import {
  agentMessageSchema,
  agentChatRequestSchema,
  createAgentSessionSchema,
  validateRequest,
} from './validation';
import { ValidationError } from './types';

describe('agentMessageSchema', () => {
  it('validates valid user message', () => {
    const result = agentMessageSchema.parse({
      role: 'user',
      content: 'Hello, AI!',
    });

    expect(result.role).toBe('user');
    expect(result.content).toBe('Hello, AI!');
  });

  it('validates assistant message', () => {
    const result = agentMessageSchema.parse({
      role: 'assistant',
      content: 'Hello, human!',
    });

    expect(result.role).toBe('assistant');
  });

  it('sanitizes message content', () => {
    const result = agentMessageSchema.parse({
      role: 'user',
      content: '<script>alert("xss")</script>Hello',
    });

    expect(result.content).not.toContain('<script>');
  });

  it('rejects empty message content', () => {
    expect(() =>
      agentMessageSchema.parse({
        role: 'user',
        content: '',
      })
    ).toThrow();
  });

  it('rejects invalid role', () => {
    expect(() =>
      agentMessageSchema.parse({
        role: 'invalid',
        content: 'Hello',
      })
    ).toThrow();
  });

  it('includes timestamp if provided', () => {
    const timestamp = new Date().toISOString();
    const result = agentMessageSchema.parse({
      role: 'user',
      content: 'Hello',
      timestamp,
    });

    expect(result.timestamp).toBe(timestamp);
  });
});

describe('agentChatRequestSchema', () => {
  it('validates chat request with messages', () => {
    const result = agentChatRequestSchema.parse({
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
    });

    expect(result.messages).toHaveLength(2);
  });

  it('validates chat request with model and sessionId', () => {
    const result = agentChatRequestSchema.parse({
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'gemini-pro',
      sessionId: 'session-123',
    });

    expect(result.model).toBe('gemini-pro');
    expect(result.sessionId).toBe('session-123');
  });

  it('rejects empty messages array', () => {
    expect(() =>
      agentChatRequestSchema.parse({
        messages: [],
      })
    ).toThrow();
  });

  it('accepts optional fields', () => {
    const result = agentChatRequestSchema.parse({
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(result.model).toBeUndefined();
    expect(result.sessionId).toBeUndefined();
  });
});

describe('createAgentSessionSchema', () => {
  it('validates session creation with name', () => {
    const result = createAgentSessionSchema.parse({
      name: 'My AI Session',
    });

    expect(result.name).toBe('My AI Session');
  });

  it('validates session with all optional fields', () => {
    const result = createAgentSessionSchema.parse({
      name: 'Test Session',
      model: 'gemini-pro',
      goal: 'Implement feature X',
      repo: {
        owner: 'testuser',
        name: 'testrepo',
        baseBranch: 'main',
      },
    });

    expect(result.goal).toBe('Implement feature X');
    expect(result.repo?.owner).toBe('testuser');
  });

  it('rejects name that is too long', () => {
    const longName = 'a'.repeat(101);

    expect(() =>
      createAgentSessionSchema.parse({
        name: longName,
      })
    ).toThrow();
  });

  it('rejects empty name', () => {
    expect(() =>
      createAgentSessionSchema.parse({
        name: '',
      })
    ).toThrow();
  });

  it('validates repo object structure', () => {
    const result = createAgentSessionSchema.parse({
      name: 'Test',
      repo: {
        owner: 'owner',
        name: 'repo',
        baseBranch: 'develop',
      },
    });

    expect(result.repo).toBeDefined();
    expect(result.repo?.baseBranch).toBe('develop');
  });
});

describe('validateRequest', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
  });

  it('returns parsed data on valid input', () => {
    const result = validateRequest(testSchema, { name: 'John', age: 30 });

    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
  });

  it('throws ValidationError on invalid input', () => {
    expect(() =>
      validateRequest(testSchema, { name: '', age: -5 })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError with error details', () => {
    try {
      validateRequest(testSchema, { name: 'John', age: 'invalid' });
      expect.fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        expect(error.message).toContain('Validation failed');
      }
    }
  });

  it('handles missing required fields', () => {
    expect(() => validateRequest(testSchema, { name: 'John' })).toThrow(
      ValidationError
    );
  });
});
