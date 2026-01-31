/**
 * Shared Authentication and Session Helpers
 *
 * Centralized utilities for user identification and message timestamp handling.
 * Used across API routes and pages to avoid duplication.
 *
 * Related: TASK-005 - Extract shared auth/session helpers
 */

import type { Session } from 'next-auth';
import type { AgentMessage, AgentMessageInput } from '@studio/contracts';

/**
 * Extract user ID from NextAuth session.
 *
 * Uses email as primary identifier, falling back to name if email unavailable.
 *
 * @param session - NextAuth session object
 * @returns User identifier string, or null if not authenticated
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

/**
 * Ensure all messages have timestamps.
 *
 * Adds current timestamp to messages that don't have one.
 * Useful for normalizing message inputs before persistence.
 * Supports both AgentMessageInput[] and AgentMessage[] types.
 *
 * @param messages - Array of message inputs (may lack timestamps)
 * @returns Array of messages with guaranteed timestamps
 */
export function ensureTimestamps(messages: AgentMessageInput[]): AgentMessage[];
export function ensureTimestamps(messages: AgentMessage[]): AgentMessage[];
export function ensureTimestamps(
  messages: AgentMessageInput[] | AgentMessage[]
): AgentMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}
