/**
 * ============================================================================
 * SESSION DETAIL API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/sessions/[id]/route.ts
 * @route /api/sessions/[id]
 * @epic AS-CORE-001
 *
 * PURPOSE:
 * API endpoint for getting and updating individual agent sessions.
 *
 * ENDPOINTS:
 * - GET /api/sessions/[id] - Get session by ID
 * - PATCH /api/sessions/[id] - Update session
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 * - User isolation enforced (userId filtering)
 *
 * RELATED FILES:
 * - src/lib/db/agent-sessions.ts (Database operations)
 * - src/lib/validation.ts (Request validation)
 * - src/app/api/sessions/route.ts (List/create endpoint)
 *
 * @see AS-CORE-001 AS-04
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/features/auth';
import { getAgentSessionById, updateAgentSession } from '@/features/sessions';
import { agentMessageSchema, validateRequest } from '@/lib/validation';
import { ValidationError } from '@/lib/types';
import { setUserId, setSessionId } from '@/lib/observability/correlation';
import { KillSwitchActiveError } from '@/lib/ops/killswitch';
import { getUserId } from '@/lib/auth-helpers';

// ============================================================================
// SECTION: VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for session update requests.
 *
 * Per AS-CORE-001:
 * - Supports goal and repo binding updates
 * - repository string is deprecated but accepted
 */
const updateAgentSessionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  model: z.string().min(1).optional(),
  goal: z.string().min(1).optional(), // Per AS-CORE-001
  repo: z
    .object({
      owner: z.string().min(1),
      name: z.string().min(1),
      baseBranch: z.string().min(1),
    })
    .optional(), // Per AS-CORE-001
  repository: z.string().optional(), // Deprecated
  messages: z.array(agentMessageSchema).optional(),
});

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Next.js route parameters for session detail routes.
 */
type SessionParams = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================================
// SECTION: GET ENDPOINT - GET SESSION
// ============================================================================

/**
 * GET /api/sessions/[id]
 *
 * Get a specific session by ID.
 *
 * Response: AgentSession
 *
 * @param _request - Next.js request object (unused)
 * @param params - Route parameters containing session ID
 * @returns JSON response with session data
 * @returns 401 if not authenticated
 * @returns 404 if session not found
 *
 * @see AS-CORE-001 AS-04
 */
export async function GET(_request: NextRequest, { params }: SessionParams) {
  // ========================================================================
  // AUTHENTICATION CHECK
  // ========================================================================
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ========================================================================
  // USER IDENTIFICATION
  // ========================================================================
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
  }

  // Set user ID and session ID in correlation context
  setUserId(userId);
  const { id } = await params;
  setSessionId(id);

  // ========================================================================
  // FETCH SESSION
  // ========================================================================
  const agentSession = await getAgentSessionById(userId, id);
  if (!agentSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(agentSession);
}

// ============================================================================
// SECTION: PATCH ENDPOINT - UPDATE SESSION
// ============================================================================

/**
 * PATCH /api/sessions/[id]
 *
 * Update a session's fields.
 *
 * Request Body: Partial<AgentSession> (validated)
 * Response: AgentSession (updated)
 *
 * Per AS-CORE-002:
 * - State transitions are enforced
 * - Invalid transitions return error
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing session ID
 * @returns JSON response with updated session
 * @returns 401 if not authenticated
 * @returns 404 if session not found
 * @returns 400 if validation fails
 * @returns 500 if server error
 *
 * @see AS-CORE-001 AS-04
 * @see AS-CORE-002 AS-08 (state transitions)
 */
export async function PATCH(request: NextRequest, { params }: SessionParams) {
  try {
    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ========================================================================
    // USER IDENTIFICATION
    // ========================================================================
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
    }

    // Set user ID and session ID in correlation context
    setUserId(userId);
    const { id } = await params;
    setSessionId(id);

    // ========================================================================
    // REQUEST VALIDATION
    // ========================================================================
    const body = await request.json();
    const updates = validateRequest(updateAgentSessionSchema, body);

    // ========================================================================
    // UPDATE SESSION
    // ========================================================================
    // updateAgentSession enforces state machine transitions
    const updated = await updateAgentSession(userId, id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof KillSwitchActiveError) {
      return NextResponse.json(
        { error: 'Service unavailable', message: error.message },
        { status: 503 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message, field: error.field },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
