// Flows will be imported for their side effects in this file.
// For now, we'll use the direct API approach in the route handlers.
// Flows can be added here later for more complex agent interactions.

import { defineFlow } from 'genkit';
import { z } from 'zod';
import { generate } from '@genkit-ai/ai/model';
import { defaultModel } from './genkit';

// Define a flow for agent chat
export const agentChatFlow = defineFlow(
  {
    name: 'agentChat',
    inputSchema: z.object({
      messages: z.array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      ),
      model: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const lastUserMessage = input.messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0]?.content;

    if (!lastUserMessage) {
      return 'I did not receive a message. Please try again.';
    }

    const model = input.model || defaultModel;

    try {
      const response = await generate({
        model,
        prompt: lastUserMessage,
      });

      return response.text || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Error in agentChatFlow:', error);
      return 'I encountered an error while processing your request. Please try again.';
    }
  }
);

// Define a flow for repository analysis
export const repositoryAnalysisFlow = defineFlow(
  {
    name: 'repositoryAnalysis',
    inputSchema: z.object({
      repository: z.string(),
      query: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const prompt = `You are analyzing the GitHub repository: ${input.repository}

User query: ${input.query}

Please provide helpful insights or assistance related to this repository.`;

    try {
      const response = await generate({
        model: defaultModel,
        prompt,
      });

      return response.text || 'I could not analyze the repository at this time.';
    } catch (error) {
      console.error('Error in repositoryAnalysisFlow:', error);
      return 'I encountered an error while analyzing the repository.';
    }
  }
);