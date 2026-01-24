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
import { authOptions } from '@/lib/auth/config';
import { createAgentSession, listAgentSessions } from '@/lib/db/agent-sessions';
import { createAgentSessionSchema, validateRequest } from '@/lib/validation';
import { ValidationError } from '@/lib/types';

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user ID from NextAuth session.
 *
 * Uses email as primary identifier, falls back to name.
 *
 * @param session - NextAuth session object
 * @returns User ID or null if unavailable
 */
function getUserId(session: Session | null): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

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
 */
export async function GET() {
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
  // FETCH SESSIONS
  // ========================================================================
  const sessions = await listAgentSessions(userId);
  return NextResponse.json({ sessions });
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
 */
export async function POST(request: NextRequest) {
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
    const input = validateRequest(createAgentSessionSchema, body);

    // ========================================================================
    // CREATE SESSION
    // ========================================================================
    const created = await createAgentSession(userId, input);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
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
