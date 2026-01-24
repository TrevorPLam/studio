/**
 * ============================================================================
 * KILL-SWITCH ADMIN API ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/admin/killswitch/route.ts
 * @route /api/admin/killswitch
 * @epic P0 Kill-switch
 *
 * PURPOSE:
 * Admin API endpoint for controlling the kill-switch feature flag.
 * Allows emergency shutdown of all mutative operations.
 *
 * ENDPOINTS:
 * - GET /api/admin/killswitch - Get current kill-switch status
 * - POST /api/admin/killswitch - Enable/disable kill-switch
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 * - TODO: Add admin role check (currently allows any authenticated user)
 *
 * SECURITY:
 * - Should be restricted to admin users only
 * - All operations are logged for audit
 *
 * RELATED FILES:
 * - src/lib/ops/killswitch.ts (Kill-switch implementation)
 * - src/lib/db/agent-sessions.ts (Uses kill-switch)
 *
 * @see TODO.md P0 Kill-switch
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { getKillSwitchStatus, setKillSwitch, KillSwitchActiveError } from '@/lib/ops/killswitch';
import { setUserId } from '@/lib/observability/correlation';

// ============================================================================
// SECTION: VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for kill-switch toggle requests.
 */
const toggleKillSwitchSchema = z.object({
  enabled: z.boolean(),
});

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user ID from NextAuth session.
 *
 * @param session - NextAuth session object
 * @returns User ID or null if unavailable
 */
function getUserId(
  session: { user?: { email?: string | null; name?: string | null } } | null
): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

// ============================================================================
// SECTION: GET ENDPOINT - GET STATUS
// ============================================================================

/**
 * GET /api/admin/killswitch
 *
 * Get current kill-switch status.
 *
 * Response: { enabled: boolean, lastToggledAt: string | null, lastToggledBy: string | null }
 *
 * @param _request - Next.js request object (unused)
 * @returns JSON response with kill-switch status
 * @returns 401 if not authenticated
 *
 * @see P0 Kill-switch
 */
export async function GET(_request: NextRequest) {
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
    if (userId) {
      setUserId(userId);
    }

    // TODO: Add admin role check
    // if (!isAdmin(userId)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // ========================================================================
    // GET STATUS
    // ========================================================================
    const status = getKillSwitchStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// SECTION: POST ENDPOINT - TOGGLE KILL-SWITCH
// ============================================================================

/**
 * POST /api/admin/killswitch
 *
 * Enable or disable the kill-switch.
 *
 * Request Body: { enabled: boolean }
 * Response: { enabled: boolean, lastToggledAt: string, lastToggledBy: string | null }
 *
 * Per P0 Kill-switch:
 * - Feature-flag disables all mutative actions globally ≤ 5s
 * - All mutative operations check kill-switch before execution
 * - Status is returned immediately after toggle
 *
 * @param request - Next.js request object
 * @returns JSON response with updated kill-switch status
 * @returns 401 if not authenticated
 * @returns 400 if validation fails
 * @returns 500 if server error
 *
 * @see P0 Kill-switch
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
    setUserId(userId);

    // TODO: Add admin role check
    // if (!isAdmin(userId)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // ========================================================================
    // REQUEST VALIDATION
    // ========================================================================
    const body = await request.json();
    const parsed = toggleKillSwitchSchema.parse(body);

    // ========================================================================
    // TOGGLE KILL-SWITCH
    // ========================================================================
    const status = setKillSwitch(parsed.enabled, userId);

    // ========================================================================
    // LOG FOR AUDIT
    // ========================================================================
    // TODO: Add proper audit logging
    console.log(
      `[KILL-SWITCH] ${parsed.enabled ? 'ENABLED' : 'DISABLED'} by ${userId} at ${status.lastToggledAt}`
    );

    return NextResponse.json(status);
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
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

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
