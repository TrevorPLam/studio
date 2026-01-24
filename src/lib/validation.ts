import { z } from 'zod';
import { ValidationError } from './types';

// Agent Chat Validation
export const agentChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1, 'Message content cannot be empty'),
    })
  ).min(1, 'At least one message is required'),
  model: z.string().optional(),
  sessionId: z.string().optional(),
});

export type AgentChatRequest = z.infer<typeof agentChatRequestSchema>;

// Repository Validation
export const repositoryParamsSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
});

export type RepositoryParams = z.infer<typeof repositoryParamsSchema>;

// Agent Session Validation
export const createAgentSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100, 'Session name too long'),
  model: z.string().optional(),
  repository: z.string().optional(),
  initialPrompt: z.string().optional(),
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
