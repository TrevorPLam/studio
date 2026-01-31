/**
 * ============================================================================
 * SESSIONS API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/sessions/route.ts
 * @route /api/sessions
 * @epic AS-CORE-001
 *
 * PURPOSE:
 * API endpoint for listing and creating agent sessions.
 *
 * ENDPOINTS:
 * - GET /api/sessions - List user's sessions
 * - POST /api/sessions - Create new session
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 * - User isolation enforced (userId filtering)
 *
 * RELATED FILES:
 * - src/lib/db/agent-sessions.ts (Database operations)
 * - src/lib/validation.ts (Request validation)
 * - src/app/api/sessions/[id]/route.ts (Session detail endpoint)
 *
 * @see AS-CORE-001 AS-04
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/features/auth';
import { createAgentSession, listAgentSessions } from '@/features/sessions';
import { createAgentSessionSchema, validateRequest } from '@/lib/validation';
import { ValidationError } from '@/lib/types';
import { setUserId, setSessionId } from '@/lib/observability/correlation';
import { KillSwitchActiveError } from '@/lib/ops/killswitch';
import { recordHttpRequest, recordBusinessMetric } from '@/lib/observability/metrics';
import { withSpan } from '@/lib/observability/tracing';
import { getUserId } from '@/lib/auth-helpers';

// ============================================================================
// SECTION: GET ENDPOINT - LIST SESSIONS
// ============================================================================

/**
 * GET /api/sessions
 *
 * List all sessions for the authenticated user.
 *
 * Response: { sessions: AgentSession[] }
 *
 * @returns JSON response with user's sessions
 * @returns 401 if not authenticated
 * @returns 400 if user identity unavailable
 *
 * @see AS-CORE-001 AS-04
 * 
 * @openapi
 * /api/sessions:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: List agent sessions
 *     description: Returns all agent sessions for the authenticated user
 *     security:
 *       - nextAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AgentSession'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - user identity unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  const startTime = Date.now();
  let statusCode = 200;

  try {
    return await withSpan('GET /api/sessions', async (span) => {
      // ========================================================================
      // AUTHENTICATION CHECK
      // ========================================================================
      const session = await getServerSession(authOptions);
      if (!session) {
        statusCode = 401;
        span.setAttribute('auth.status', 'unauthorized');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // ========================================================================
      // USER IDENTIFICATION
      // ========================================================================
      const userId = getUserId(session);
      if (!userId) {
        statusCode = 400;
        span.setAttribute('auth.status', 'no_user_id');
        return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
      }

      // Set user ID in correlation context
      setUserId(userId);
      span.setAttribute('user.id', userId);

      // ========================================================================
      // FETCH SESSIONS
      // ========================================================================
      const sessions = await listAgentSessions(userId);
      span.setAttribute('sessions.count', sessions.length);
      return NextResponse.json({ sessions });
    });
  } catch (error) {
    statusCode = 500;
    throw error;
  } finally {
    // Record metrics
    recordHttpRequest('GET', '/api/sessions', statusCode, Date.now() - startTime);
  }
}

// ============================================================================
// SECTION: POST ENDPOINT - CREATE SESSION
// ============================================================================

/**
 * POST /api/sessions
 *
 * Create a new agent session.
 *
 * Request Body: CreateAgentSession (validated)
 * Response: AgentSession (created)
 *
 * @param request - Next.js request object
 * @returns JSON response with created session
 * @returns 401 if not authenticated
 * @returns 400 if validation fails or user identity unavailable
 * @returns 500 if server error
 *
 * @see AS-CORE-001 AS-04
 * 
 * @openapi
 * /api/sessions:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Create agent session
 *     description: Creates a new agent session with the provided configuration
 *     security:
 *       - nextAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAgentSession'
 *     responses:
 *       201:
 *         description: Session successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AgentSession'
 *       400:
 *         description: Bad request - validation failed or user identity unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: Service unavailable - kill-switch is active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let statusCode = 201;

  try {
    return await withSpan('POST /api/sessions', async (span) => {
      // ========================================================================
      // AUTHENTICATION CHECK
      // ========================================================================
      const session = await getServerSession(authOptions);
      if (!session) {
        statusCode = 401;
        span.setAttribute('auth.status', 'unauthorized');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // ========================================================================
      // USER IDENTIFICATION
      // ========================================================================
      const userId = getUserId(session);
      if (!userId) {
        statusCode = 400;
        span.setAttribute('auth.status', 'no_user_id');
        return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
      }

      // Set user ID in correlation context
      setUserId(userId);
      span.setAttribute('user.id', userId);

      // ========================================================================
      // REQUEST VALIDATION
      // ========================================================================
      const body = await request.json();
      const input = validateRequest(createAgentSessionSchema, body);
      span.setAttribute('session.model', input.model);
      span.setAttribute('session.name', input.name);

      // ========================================================================
      // CREATE SESSION
      // ========================================================================
      const created = await createAgentSession(userId, input);

      // Set session ID in correlation context
      setSessionId(created.id);
      span.setAttribute('session.id', created.id);
      span.setAttribute('session.state', created.state);

      // Record business metric
      recordBusinessMetric('session_created', {
        userId,
        sessionId: created.id,
      });

      return NextResponse.json(created, { status: 201 });
    });
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof KillSwitchActiveError) {
      statusCode = 503;
      return NextResponse.json(
        { error: 'Service unavailable', message: error.message },
        { status: 503 }
      );
    }
    if (error instanceof ValidationError) {
      statusCode = 400;
      return NextResponse.json(
        { error: 'Validation error', message: error.message, field: error.field },
        { status: 400 }
      );
    }

    // Generic server error
    statusCode = 500;
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Record metrics
    recordHttpRequest('POST', '/api/sessions', statusCode, Date.now() - startTime);
  }
}
