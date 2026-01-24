/**
 * ============================================================================
 * GENKIT DEVELOPMENT FLOWS
 * ============================================================================
 *
 * @file src/ai/dev.ts
 *
 * PURPOSE:
 * Development-only Genkit flows for testing and development.
 * These flows can be used with Genkit CLI for local development.
 *
 * NOTE:
 * This file is for development/testing purposes.
 * Production code should use API routes instead.
 *
 * RELATED FILES:
 * - src/ai/genkit.ts (Genkit configuration)
 * - src/app/api/agents/chat/route.ts (Production chat endpoint)
 *
 * USAGE:
 * Run with: npm run genkit:dev
 *
 * ============================================================================
 */

// Development-only helpers. Flows can be introduced later if needed.

import { z } from 'zod';
import { ai, defaultModel } from './genkit';

// ============================================================================
// SECTION: AGENT CHAT FLOW
// ============================================================================

/**
 * Schema for agent chat flow input.
 */
const agentChatInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.string().optional(),
});

type AgentChatInput = z.infer<typeof agentChatInputSchema>;

/**
 * Agent chat flow for Genkit development.
 *
 * Processes chat messages and returns AI response.
 *
 * @param input - Chat input with messages and optional model
 * @returns AI-generated response text
 */
export async function agentChatFlow(input: AgentChatInput): Promise<string> {
  const parsed = agentChatInputSchema.parse(input);
  const lastUserMessage = parsed.messages
    .filter((message) => message.role === 'user')
    .slice(-1)[0]?.content;

  if (!lastUserMessage) {
    return 'I did not receive a message. Please try again.';
  }

  const model = parsed.model || defaultModel;

  try {
    const response = await ai.generate({ model, prompt: lastUserMessage });
    return response.text || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Error in agentChatFlow:', error);
    return 'I encountered an error while processing your request. Please try again.';
  }
}

// ============================================================================
// SECTION: REPOSITORY ANALYSIS FLOW
// ============================================================================

/**
 * Schema for repository analysis flow input.
 */
const repositoryAnalysisInputSchema = z.object({
  repository: z.string(),
  query: z.string(),
});

type RepositoryAnalysisInput = z.infer<typeof repositoryAnalysisInputSchema>;

/**
 * Repository analysis flow for Genkit development.
 *
 * Analyzes a GitHub repository based on user query.
 *
 * @param input - Repository and query input
 * @returns AI-generated analysis text
 */
export async function repositoryAnalysisFlow(input: RepositoryAnalysisInput): Promise<string> {
  const parsed = repositoryAnalysisInputSchema.parse(input);
  const prompt = `You are analyzing the GitHub repository: ${parsed.repository}

User query: ${parsed.query}

Please provide helpful insights or assistance related to this repository.`;

  try {
    const response = await ai.generate({ model: defaultModel, prompt });
    return response.text || 'I could not analyze the repository at this time.';
  } catch (error) {
    console.error('Error in repositoryAnalysisFlow:', error);
    return 'I encountered an error while analyzing the repository.';
  }
}
