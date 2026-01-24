/**
 * ============================================================================
 * GENKIT AI CONFIGURATION MODULE
 * ============================================================================
 *
 * @file src/ai/genkit.ts
 * @module genkit
 *
 * PURPOSE:
 * Genkit AI framework configuration and initialization.
 * Provides AI model access for agent interactions.
 *
 * DEPENDENCIES:
 * - genkit (AI framework)
 * - @genkit-ai/google-genai (Google AI provider)
 * - @/lib/env (API key configuration)
 *
 * RELATED FILES:
 * - src/app/api/agents/chat/route.ts (Uses ai.generate)
 * - src/app/api/agents/chat-stream/route.ts (Uses ai.generateStream)
 * - src/lib/ai-models.ts (Model configuration)
 *
 * CONFIGURATION:
 * - Uses Google AI (Gemini) models
 * - API key from environment variable
 * - Default model: gemini-2.5-flash
 *
 * ============================================================================
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { env } from '@/lib/env';

// ============================================================================
// SECTION: GENKIT CONFIGURATION
// ============================================================================

/**
 * Genkit AI instance configured with Google AI provider.
 *
 * Provides:
 * - ai.generate() - Non-streaming generation
 * - ai.generateStream() - Streaming generation
 *
 * @see Genkit documentation for API details
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: env.ai.googleApiKey || process.env.GOOGLE_AI_API_KEY || '',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});

// ============================================================================
// SECTION: DEFAULT MODEL
// ============================================================================

/**
 * Default AI model identifier.
 *
 * Used when no model is specified in requests.
 */
export const defaultModel = 'googleai/gemini-2.5-flash';
