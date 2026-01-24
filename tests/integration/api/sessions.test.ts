/**
 * Integration tests for sessions API
 * @file tests/integration/api/sessions.test.ts
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/sessions/route';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock agent-sessions
jest.mock('@/lib/db/agent-sessions', () => ({
  listAgentSessions: jest.fn(),
  createAgentSession: jest.fn(),
}));

import { listAgentSessions, createAgentSession } from '@/lib/db/agent-sessions';

describe('Sessions API Tests', () => {
  const mockUserId = 'test-user@example.com';
  const mockSession = {
    user: {
      email: mockUserId,
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/sessions', () => {
    it('returns user\'s sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: mockUserId,
          name: 'Session 1',
          goal: 'Goal 1',
          state: 'created',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (listAgentSessions as jest.Mock).mockResolvedValue(mockSessions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions).toEqual(mockSessions);
      expect(listAgentSessions).toHaveBeenCalledWith(mockUserId);
    });

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns empty array for new user', async () => {
      (listAgentSessions as jest.Mock).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions).toEqual([]);
    });
  });

  describe('POST /api/sessions', () => {
    it('creates new session', async () => {
      const requestBody = {
        name: 'New Session',
        goal: 'New Goal',
      };

      const mockCreatedSession = {
        id: 'new-session-id',
        userId: mockUserId,
        ...requestBody,
        state: 'created',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (createAgentSession as jest.Mock).mockResolvedValue(mockCreatedSession);

      const request = new NextRequest('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-session-id');
      expect(createAgentSession).toHaveBeenCalledWith(mockUserId, expect.objectContaining(requestBody));
    });

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', goal: 'Goal' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('validates input schema', async () => {
      const request = new NextRequest('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Invalid: missing goal
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('returns created session', async () => {
      const requestBody = {
        name: 'Test Session',
        goal: 'Test Goal',
      };

      const mockSession = {
        id: 'test-id',
        userId: mockUserId,
        ...requestBody,
        state: 'created',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (createAgentSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockSession);
    });
  });
});
