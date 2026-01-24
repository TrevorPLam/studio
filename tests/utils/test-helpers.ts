/**
 * Test helper utilities
 * @file tests/utils/test-helpers.ts
 */

import { randomUUID } from 'crypto';
import type { CreateAgentSession } from '@/lib/validation';
import type { AgentSession, AgentSessionStep } from '@/lib/agent/session-types';

/**
 * Create a test session input
 */
export function createTestSession(overrides?: Partial<CreateAgentSession>): CreateAgentSession {
  return {
    name: 'Test Session',
    goal: 'Test goal',
    ...overrides,
  };
}

/**
 * Create a test user ID
 */
export function createTestUser(prefix = 'test-user'): string {
  return `${prefix}-${randomUUID()}`;
}

/**
 * Create a test session step
 */
export function createTestStep(
  sessionId: string,
  overrides?: Partial<AgentSessionStep>
): AgentSessionStep {
  return {
    id: randomUUID(),
    sessionId,
    type: 'plan',
    status: 'started',
    timestamp: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock GitHub API responses
 */
export function mockGitHubAPI() {
  // This would set up MSW handlers or nock interceptors
  // Implementation depends on the mocking strategy
  return {
    restore: () => {
      // Cleanup
    },
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  // Implementation depends on test data storage
  // For file-based storage, this would clean up test files
}

/**
 * Wait for async state changes
 */
export async function waitForState<T>(
  checkFn: () => Promise<T | null>,
  expectedValue: T,
  timeout = 5000
): Promise<T> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const value = await checkFn();
    if (value === expectedValue) {
      return value;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`Timeout waiting for state: ${expectedValue}`);
}
