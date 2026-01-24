/**
 * ============================================================================
 * KILL-SWITCH / READ-ONLY MODE MODULE
 * ============================================================================
 *
 * @file src/lib/ops/killswitch.ts
 * @module killswitch
 * @epic P0 Kill-switch
 *
 * PURPOSE:
 * Centralized kill-switch mechanism to disable all mutative actions globally.
 * Provides emergency shutdown capability for production incidents.
 *
 * REQUIREMENTS:
 * - Feature-flag disables all mutative actions globally ≤ 5s
 * - Admin API endpoint for control
 * - Protection for all mutative actions (create, update, delete, apply)
 * - Fail-closed: when enabled, all writes are blocked
 *
 * FUTURE ENHANCEMENTS:
 * - Redis-based feature flag for distributed systems
 * - Degraded mode (read-only vs full shutdown)
 * - Audit logging of kill-switch activations
 *
 * RELATED FILES:
 * - src/app/api/admin/killswitch/route.ts (Admin API endpoint)
 * - src/lib/db/agent-sessions.ts (Uses kill-switch)
 * - All mutative API endpoints (should use assertNotKilled)
 *
 * @see TODO.md P0 Kill-switch
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: STATE MANAGEMENT
// ============================================================================

/**
 * Global kill-switch state.
 * When true, all mutative operations are blocked.
 *
 * TODO: Replace with Redis-based feature flag for distributed systems
 */
let KILL_SWITCH_ENABLED = false;

/**
 * Timestamp when kill-switch was last toggled.
 * Used for audit and monitoring.
 */
let LAST_TOGGLE_AT: string | null = null;

/**
 * User ID who last toggled the kill-switch.
 * Used for audit logging.
 */
let LAST_TOGGLE_BY: string | null = null;

// ============================================================================
// SECTION: PUBLIC API
// ============================================================================

/**
 * Error thrown when kill-switch is active and a mutative operation is attempted.
 */
export class KillSwitchActiveError extends Error {
  constructor() {
    super('Kill-switch is active. All mutative operations are disabled.');
    this.name = 'KillSwitchActiveError';
  }
}

/**
 * Get current kill-switch status.
 *
 * @returns Object with enabled status and metadata
 */
export function getKillSwitchStatus(): {
  enabled: boolean;
  lastToggledAt: string | null;
  lastToggledBy: string | null;
} {
  return {
    enabled: KILL_SWITCH_ENABLED,
    lastToggledAt: LAST_TOGGLE_AT,
    lastToggledBy: LAST_TOGGLE_BY,
  };
}

/**
 * Enable or disable the kill-switch.
 *
 * @param enabled - true to enable (block all writes), false to disable
 * @param userId - User ID who is toggling (for audit)
 * @returns Updated status
 */
export function setKillSwitch(
  enabled: boolean,
  userId?: string
): {
  enabled: boolean;
  lastToggledAt: string;
  lastToggledBy: string | null;
} {
  KILL_SWITCH_ENABLED = enabled;
  LAST_TOGGLE_AT = new Date().toISOString();
  LAST_TOGGLE_BY = userId ?? null;

  return {
    enabled: KILL_SWITCH_ENABLED,
    lastToggledAt: LAST_TOGGLE_AT,
    lastToggledBy: LAST_TOGGLE_BY,
  };
}

/**
 * Assert that kill-switch is not active.
 * Throws KillSwitchActiveError if kill-switch is enabled.
 *
 * This should be called at the start of all mutative operations:
 * - createAgentSession
 * - updateAgentSession
 * - deleteAgentSession
 * - applyPreview (when implemented)
 * - createPreview (when implemented)
 *
 * @throws KillSwitchActiveError if kill-switch is enabled
 *
 * @example
 * ```typescript
 * export async function createAgentSession(...) {
 *   assertNotKilled(); // Blocks if kill-switch is active
 *   // ... rest of implementation
 * }
 * ```
 */
export function assertNotKilled(): void {
  if (KILL_SWITCH_ENABLED) {
    throw new KillSwitchActiveError();
  }
}

/**
 * Check if kill-switch is enabled (non-throwing).
 *
 * @returns true if kill-switch is active
 */
export function isKillSwitchEnabled(): boolean {
  return KILL_SWITCH_ENABLED;
}
