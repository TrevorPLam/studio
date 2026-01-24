/**
 * ============================================================================
 * SESSION STEPS API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/sessions/[id]/steps/route.ts
 * @route /api/sessions/[id]/steps
 * @epic AS-CORE-002
 *
 * PURPOSE:
 * API endpoint for managing session step timeline.
 *
 * ENDPOINTS:
 * - GET /api/sessions/[id]/steps - Get session steps
 * - POST /api/sessions/[id]/steps - Add step to timeline
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 * - User isolation enforced (userId filtering)
 *
 * RELATED FILES:
 * - src/lib/db/agent-sessions.ts (Step persistence)
 * - src/lib/agent/session-types.ts (Step type definitions)
 * - src/app/api/sessions/[id]/route.ts (Session detail endpoint)
 *
 * @see AS-CORE-002 AS-06, AS-07
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authOptions } from '@/lib/auth/config';
import { getAgentSessionById, updateAgentSession } from '@/lib/db/agent-sessions';
import type { AgentSessionStep } from '@/lib/agent/session-types';
import { ValidationError } from '@/lib/types';
import { KillSwitchActiveError } from '@/lib/ops/killswitch';

// ============================================================================
// SECTION: VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for adding a step to session timeline.
 *
 * Per AS-CORE-002:
 * - type field is required (plan/context/model/diff/apply)
 * - name field is deprecated but accepted
 * - startedAt/endedAt are preferred over timestamp
 */
const addStepSchema = z.object({
  type: z.enum(['plan', 'context', 'model', 'diff', 'apply']), // Per AS-CORE-002
  name: z.string().optional(), // Deprecated: kept for backward compatibility
  status: z.enum(['started', 'succeeded', 'failed']),
  timestamp: z.string().optional(), // Deprecated: use startedAt/endedAt
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  details: z.string().optional(),
  meta: z.record(z.unknown()).optional(), // Per AS-CORE-002
});

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Next.js route parameters for session steps routes.
 */
type SessionParams = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user ID from NextAuth session.
 *
 * @param session - NextAuth session object
 * @returns User ID or null if unavailable
 */
function getUserId(session: Session | null): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

// ============================================================================
// SECTION: GET ENDPOINT - GET STEPS
// ============================================================================

/**
 * GET /api/sessions/[id]/steps
 *
 * Get step timeline for a session.
 *
 * Response: { steps: AgentSessionStep[] }
 *
 * @param _request - Next.js request object (unused)
 * @param params - Route parameters containing session ID
 * @returns JSON response with session steps
 * @returns 401 if not authenticated
 * @returns 404 if session not found
 *
 * @see AS-CORE-002 AS-07
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

  // ========================================================================
  // FETCH SESSION & STEPS
  // ========================================================================
  const { id } = await params;
  const agentSession = await getAgentSessionById(userId, id);
  if (!agentSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ steps: agentSession.steps ?? [] });
}

// ============================================================================
// SECTION: POST ENDPOINT - ADD STEP
// ============================================================================

/**
 * POST /api/sessions/[id]/steps
 *
 * Add a step to the session timeline.
 *
 * Request Body: Step data (validated)
 * Response: { steps: AgentSessionStep[] } (updated timeline)
 *
 * Per AS-CORE-002:
 * - Generates unique step ID
 * - Sets sessionId from route params
 * - Uses type field (primary), name field (deprecated)
 * - Sets timestamps (startedAt/endedAt preferred)
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing session ID
 * @returns JSON response with updated steps
 * @returns 401 if not authenticated
 * @returns 404 if session not found
 * @returns 400 if validation fails
 * @returns 500 if server error
 *
 * @see AS-CORE-002 AS-06, AS-07
 */
export async function POST(request: NextRequest, { params }: SessionParams) {
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

    // ========================================================================
    // REQUEST VALIDATION
    // ========================================================================
    const body = await request.json();
    const parsed = addStepSchema.parse(body);
    const now = new Date().toISOString();

    // ========================================================================
    // CREATE STEP OBJECT
    // ========================================================================
    // Per AS-CORE-002: proper step structure with id, sessionId, type, etc.
    const { id } = await params;
    const step: AgentSessionStep = {
      id: randomUUID(),
      sessionId: id,
      type: parsed.type,
      name: parsed.name, // Optional backward compatibility
      status: parsed.status,
      timestamp: parsed.timestamp || parsed.startedAt || now, // Backward compatibility
      startedAt: parsed.startedAt || parsed.timestamp || now,
      endedAt: parsed.endedAt,
      details: parsed.details,
      meta: parsed.meta,
    };

    // ========================================================================
    // UPDATE SESSION WITH STEP
    // ========================================================================
    const updated = await updateAgentSession(userId, id, { addStep: step });
    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ steps: updated.steps ?? [] });
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: error.errors[0]?.message,
          field: error.errors[0]?.path.join('.'),
        },
        { status: 400 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message, field: error.field },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
