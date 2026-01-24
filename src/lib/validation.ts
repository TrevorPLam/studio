/**
 * ============================================================================
 * VALIDATION SCHEMAS MODULE
 * ============================================================================
 * 
 * @file src/lib/validation.ts
 * @module validation
 * @epic AS-CORE-001
 * 
 * PURPOSE:
 * Zod validation schemas for API request validation and type inference.
 * Ensures type safety and runtime validation for all user inputs.
 * 
 * DEPENDENCIES:
 * - zod (schema validation library)
 * - @/lib/types (ValidationError)
 * 
 * RELATED FILES:
 * - src/lib/agent/session-types.ts (Type definitions matching these schemas)
 * - src/app/api/sessions/route.ts (Uses createAgentSessionSchema)
 * - src/app/api/sessions/[id]/route.ts (Uses updateAgentSessionSchema)
 * 
 * VALIDATION STRATEGY:
 * - Fail-closed: reject invalid input with descriptive errors
 * - Type inference: TypeScript types derived from schemas
 * - Backward compatibility: supports deprecated fields
 * 
 * ============================================================================
 */

import { z } from 'zod';
import { ValidationError } from './types';

// ============================================================================
// SECTION: MESSAGE VALIDATION
// ============================================================================

/**
 * Schema for agent message validation.
 * 
 * Used in chat requests and session message arrays.
 */
export const agentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.string().optional(),
});

// ============================================================================
// SECTION: CHAT REQUEST VALIDATION
// ============================================================================

/**
 * Schema for agent chat request validation.
 * 
 * Used by /api/agents/chat and /api/agents/chat-stream endpoints.
 */
export const agentChatRequestSchema = z.object({
  messages: z.array(agentMessageSchema).min(1, 'At least one message is required'),
  model: z.string().optional(),
  sessionId: z.string().optional(),
});

/**
 * TypeScript type inferred from agentChatRequestSchema.
 */
export type AgentChatRequest = z.infer<typeof agentChatRequestSchema>;

/**
 * TypeScript type inferred from agentMessageSchema.
 */
export type AgentMessageInput = z.infer<typeof agentMessageSchema>;

// ============================================================================
// SECTION: REPOSITORY VALIDATION
// ============================================================================

/**
 * Schema for repository URL parameters validation.
 * 
 * Used in GitHub API routes: /api/github/repositories/[owner]/[repo]
 */
export const repositoryParamsSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
});

/**
 * TypeScript type inferred from repositoryParamsSchema.
 */
export type RepositoryParams = z.infer<typeof repositoryParamsSchema>;

// ============================================================================
// SECTION: REPOSITORY BINDING VALIDATION
// ============================================================================
// Per AS-CORE-001: Repository binding schema for session creation

/**
 * Schema for agent repository binding validation.
 * 
 * Primary format for repository association in sessions.
 * 
 * @see AS-CORE-001 AS-01
 */
export const agentRepositoryBindingSchema = z.object({
  owner: z.string().min(1, 'Repository owner is required'),
  name: z.string().min(1, 'Repository name is required'),
  baseBranch: z.string().min(1, 'Base branch is required'),
});

/**
 * TypeScript type inferred from agentRepositoryBindingSchema.
 */
export type AgentRepositoryBinding = z.infer<typeof agentRepositoryBindingSchema>;

// ============================================================================
// SECTION: SESSION VALIDATION
// ============================================================================
// Per AS-CORE-001: Session creation schema with required goal field

/**
 * Schema for agent session creation validation.
 * 
 * Per AS-CORE-001:
 * - goal field is required (or initialPrompt as fallback)
 * - repo binding is primary format
 * - repository string is deprecated but accepted
 * 
 * Validation Rules:
 * - name: required, 1-100 characters
 * - goal OR initialPrompt: at least one must be provided
 * - repo: optional, but preferred over repository
 * - repository: deprecated, kept for backward compatibility
 * 
 * @see AS-CORE-001 AS-01
 */
export const createAgentSessionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Session name is required').max(100, 'Session name too long'),
  model: z.string().optional(),
  goal: z.string().min(1, 'Goal is required').optional(), // Required per AS-CORE-001, but can be derived from initialPrompt
  repo: agentRepositoryBindingSchema.optional(), // Primary format
  repository: z.string().optional(), // Deprecated: kept for backward compatibility
  initialPrompt: z.string().optional(), // Can be used as goal if goal not provided
}).refine((data) => data.goal || data.initialPrompt, {
  message: 'Either goal or initialPrompt must be provided',
  path: ['goal'],
});

/**
 * TypeScript type inferred from createAgentSessionSchema.
 */
export type CreateAgentSession = z.infer<typeof createAgentSessionSchema>;

// ============================================================================
// SECTION: VALIDATION HELPER
// ============================================================================

/**
 * Validate request data against a Zod schema.
 * 
 * Throws ValidationError with field path for invalid input.
 * Returns typed data for valid input.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Typed data matching schema
 * @throws ValidationError if validation fails
 * 
 * @example
 * ```typescript
 * const input = validateRequest(createAgentSessionSchema, requestBody);
 * // input is now typed as CreateAgentSession
 * ```
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError?.message || 'Validation failed',
        firstError?.path.join('.')
      );
    }
    throw new ValidationError('Validation failed');
  }
}
