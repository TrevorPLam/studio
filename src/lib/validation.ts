import { z } from 'zod';
import { ValidationError } from './types';

export const agentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.string().optional(),
});

// Agent Chat Validation
export const agentChatRequestSchema = z.object({
  messages: z.array(agentMessageSchema).min(1, 'At least one message is required'),
  model: z.string().optional(),
  sessionId: z.string().optional(),
});

export type AgentChatRequest = z.infer<typeof agentChatRequestSchema>;
export type AgentMessageInput = z.infer<typeof agentMessageSchema>;

// Repository Validation
export const repositoryParamsSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
});

export type RepositoryParams = z.infer<typeof repositoryParamsSchema>;

// Repository Binding Schema (per AS-CORE-001)
export const agentRepositoryBindingSchema = z.object({
  owner: z.string().min(1, 'Repository owner is required'),
  name: z.string().min(1, 'Repository name is required'),
  baseBranch: z.string().min(1, 'Base branch is required'),
});

export type AgentRepositoryBinding = z.infer<typeof agentRepositoryBindingSchema>;

// Agent Session Validation
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

export type CreateAgentSession = z.infer<typeof createAgentSessionSchema>;

// Validation helper
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
