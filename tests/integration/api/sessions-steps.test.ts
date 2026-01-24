/**
 * Integration tests for session steps API
 * @file tests/integration/api/sessions-steps.test.ts
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/sessions/[id]/steps/route';
import { getServerSession } from 'next-auth';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock agent-sessions
jest.mock('@/lib/db/agent-sessions', () => ({
  getAgentSessionById: jest.fn(),
  updateAgentSession: jest.fn(),
}));

import { getAgentSessionById, updateAgentSession } from '@/lib/db/agent-sessions';

describe('Steps API Tests', () => {
  const mockUserId = 'test-user@example.com';
  const mockSessionId = 'test-session-id';
  const mockSession = {
    user: {
      email: mockUserId,
      name: 'Test User',
    },
  };

  const mockAgentSession = {
    id: mockSessionId,
    userId: mockUserId,
    name: 'Test Session',
    goal: 'Test Goal',
    state: 'created' as const,
    messages: [],
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/sessions/[id]/steps', () => {
    it('returns session steps', async () => {
      const mockSteps = [
        {
          id: 'step-1',
          sessionId: mockSessionId,
          type: 'plan' as const,
          status: 'started' as const,
          timestamp: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        },
      ];

      (getAgentSessionById as jest.Mock).mockResolvedValue({
        ...mockAgentSession,
        steps: mockSteps,
      });

      const response = await GET(new NextRequest('http://localhost'), {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.steps).toEqual(mockSteps);
    });

    it('returns empty array if no steps', async () => {
      (getAgentSessionById as jest.Mock).mockResolvedValue(mockAgentSession);

      const response = await GET(new NextRequest('http://localhost'), {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.steps).toEqual([]);
    });
  });

  describe('POST /api/sessions/[id]/steps', () => {
    it('creates new step', async () => {
      const stepInput = {
        type: 'plan' as const,
        status: 'started' as const,
      };

      const updatedSession = {
        ...mockAgentSession,
        steps: [
          {
            id: expect.any(String),
            sessionId: mockSessionId,
            ...stepInput,
            timestamp: expect.any(String),
            startedAt: expect.any(String),
          },
        ],
      };

      (getAgentSessionById as jest.Mock).mockResolvedValue(mockAgentSession);
      (updateAgentSession as jest.Mock).mockResolvedValue(updatedSession);

      const request = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify(stepInput),
      });

      const response = await POST(request, {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.steps).toBeDefined();
      expect(Array.isArray(data.steps)).toBe(true);
      expect(data.steps[0].type).toBe('plan');
    });

    it('validates step schema', async () => {
      const request = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ type: 'invalid' }),
      });

      const response = await POST(request, {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('generates step ID', async () => {
      (getAgentSessionById as jest.Mock).mockResolvedValue(mockAgentSession);
      (updateAgentSession as jest.Mock).mockImplementation((userId, sessionId, updates) => {
        return Promise.resolve({
          ...mockAgentSession,
          steps: [
            {
              id: 'generated-step-id',
              sessionId,
              type: 'plan',
              status: 'started',
              timestamp: new Date().toISOString(),
              startedAt: new Date().toISOString(),
            },
          ],
        });
      });

      const request = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          type: 'plan',
          status: 'started',
        }),
      });

      const response = await POST(request, {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(data.steps).toBeDefined();
      expect(data.steps[0].id).toBeDefined();
    });

    it('sets sessionId from params', async () => {
      (getAgentSessionById as jest.Mock).mockResolvedValue(mockAgentSession);
      (updateAgentSession as jest.Mock).mockImplementation((userId, sessionId, updates) => {
        return Promise.resolve({
          ...mockAgentSession,
          steps: [
            {
              id: 'step-id',
              sessionId,
              type: 'plan',
              status: 'started',
              timestamp: new Date().toISOString(),
              startedAt: new Date().toISOString(),
            },
          ],
        });
      });

      const request = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          type: 'plan',
          status: 'started',
        }),
      });

      const response = await POST(request, {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(data.steps[0].sessionId).toBe(mockSessionId);
    });

    it('sets startedAt timestamp', async () => {
      (getAgentSessionById as jest.Mock).mockResolvedValue(mockAgentSession);
      (updateAgentSession as jest.Mock).mockImplementation((userId, sessionId, updates) => {
        return Promise.resolve({
          ...mockAgentSession,
          steps: [
            {
              id: 'step-id',
              sessionId,
              type: 'plan',
              status: 'started',
              timestamp: new Date().toISOString(),
              startedAt: new Date().toISOString(),
            },
          ],
        });
      });

      const request = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          type: 'plan',
          status: 'started',
        }),
      });

      const response = await POST(request, {
        params: { id: mockSessionId },
      });
      const data = await response.json();

      expect(data.steps[0].startedAt).toBeDefined();
      expect(new Date(data.steps[0].startedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
