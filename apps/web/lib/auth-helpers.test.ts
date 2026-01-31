import { describe, expect, it } from 'vitest';
import { getUserId, ensureTimestamps } from './auth-helpers';
import type { Session } from 'next-auth';
import type { AgentMessage, AgentMessageInput } from '@studio/contracts';

describe('getUserId', () => {
  it('returns email when available', () => {
    const session: Session = {
      user: {
        email: 'user@example.com',
        name: 'John Doe',
      },
      expires: '2026-12-31',
    };

    expect(getUserId(session)).toBe('user@example.com');
  });

  it('falls back to name when email is null', () => {
    const session: Session = {
      user: {
        email: null,
        name: 'John Doe',
      },
      expires: '2026-12-31',
    };

    expect(getUserId(session)).toBe('John Doe');
  });

  it('returns null when both email and name are null', () => {
    const session: Session = {
      user: {
        email: null,
        name: null,
      },
      expires: '2026-12-31',
    };

    expect(getUserId(session)).toBeNull();
  });

  it('returns null when session is null', () => {
    expect(getUserId(null)).toBeNull();
  });

  it('returns null when user is missing', () => {
    const session = {
      expires: '2026-12-31',
    } as Session;

    expect(getUserId(session)).toBeNull();
  });

  it('prefers email over name when both are present', () => {
    const session: Session = {
      user: {
        email: 'user@example.com',
        name: 'John Doe',
      },
      expires: '2026-12-31',
    };

    expect(getUserId(session)).toBe('user@example.com');
    expect(getUserId(session)).not.toBe('John Doe');
  });
});

describe('ensureTimestamps', () => {
  it('adds timestamps to messages without them', () => {
    const messages: AgentMessageInput[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    const result = ensureTimestamps(messages);

    expect(result[0].timestamp).toBeDefined();
    expect(result[1].timestamp).toBeDefined();
  });

  it('preserves existing timestamps', () => {
    const timestamp = '2026-01-31T00:00:00.000Z';
    const messages: AgentMessageInput[] = [
      { role: 'user', content: 'Hello', timestamp },
    ];

    const result = ensureTimestamps(messages);

    expect(result[0].timestamp).toBe(timestamp);
  });

  it('handles mix of messages with and without timestamps', () => {
    const existingTimestamp = '2026-01-31T00:00:00.000Z';
    const messages: AgentMessageInput[] = [
      { role: 'user', content: 'First', timestamp: existingTimestamp },
      { role: 'assistant', content: 'Second' },
    ];

    const result = ensureTimestamps(messages);

    expect(result[0].timestamp).toBe(existingTimestamp);
    expect(result[1].timestamp).toBeDefined();
    expect(result[1].timestamp).not.toBe(existingTimestamp);
  });

  it('handles AgentMessage[] with existing timestamps', () => {
    const messages: AgentMessage[] = [
      { role: 'user', content: 'Hello', timestamp: '2026-01-31T00:00:00.000Z' },
    ];

    const result = ensureTimestamps(messages);

    expect(result[0].timestamp).toBe('2026-01-31T00:00:00.000Z');
  });

  it('returns empty array for empty input', () => {
    const result = ensureTimestamps([]);

    expect(result).toEqual([]);
  });

  it('generates ISO 8601 timestamps', () => {
    const messages: AgentMessageInput[] = [
      { role: 'user', content: 'Test' },
    ];

    const result = ensureTimestamps(messages);

    // Check if timestamp matches ISO 8601 format
    expect(result[0].timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
  });

  it('preserves message content and role', () => {
    const messages: AgentMessageInput[] = [
      { role: 'user', content: 'Hello, world!' },
      { role: 'assistant', content: 'Greetings!' },
    ];

    const result = ensureTimestamps(messages);

    expect(result[0].role).toBe('user');
    expect(result[0].content).toBe('Hello, world!');
    expect(result[1].role).toBe('assistant');
    expect(result[1].content).toBe('Greetings!');
  });
});
