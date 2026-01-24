/**
 * ============================================================================
 * AI MODELS CONFIGURATION MODULE
 * ============================================================================
 * 
 * @file src/lib/ai-models.ts
 * @module ai-models
 * 
 * PURPOSE:
 * Configuration and registry for available AI models.
 * Supports multiple providers (Google, OpenAI, Anthropic).
 * 
 * RELATED FILES:
 * - src/ai/genkit.ts (Genkit model configuration)
 * - src/app/api/agents/chat/route.ts (Uses model configuration)
 * 
 * MODEL PROVIDERS:
 * - google: Google AI (Gemini) models
 * - openai: OpenAI models (GPT-4, etc.)
 * - anthropic: Anthropic models (Claude)
 * 
 * ============================================================================
 */

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * AI model configuration.
 */
export interface AIModel {
  /** Unique model identifier */
  id: string;
  
  /** Human-readable model name */
  name: string;
  
  /** Model provider */
  provider: 'google' | 'openai' | 'anthropic';
  
  /** Provider-specific model identifier */
  model: string;
  
  /** Model description */
  description: string;
  
  /** Maximum tokens (optional) */
  maxTokens?: number;
}

// ============================================================================
// SECTION: AVAILABLE MODELS
// ============================================================================

/**
 * Registry of available AI models.
 * 
 * Add new models here as they become available.
 */
export const availableModels: AIModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    model: 'googleai/gemini-2.5-flash',
    description: 'Fast and efficient model for real-time interactions',
    maxTokens: 8192,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    model: 'googleai/gemini-2.5-pro',
    description: 'Most capable model for complex reasoning',
    maxTokens: 8192,
  },
  // ========================================================================
  // ADDITIONAL MODELS (COMMENTED OUT)
  // ========================================================================
  // Uncomment and configure as needed:
  // {
  //   id: 'gpt-4o',
  //   name: 'GPT-4o',
  //   provider: 'openai',
  //   model: 'openai/gpt-4o',
  //   description: 'OpenAI\'s latest model',
  // },
];

// ============================================================================
// SECTION: MODEL LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get model configuration by ID.
 * 
 * @param id - Model identifier
 * @returns Model configuration or undefined if not found
 * 
 * @example
 * ```typescript
 * const model = getModelById('gemini-2.5-flash');
 * if (model) {
 *   // Use model
 * }
 * ```
 */
export function getModelById(id: string): AIModel | undefined {
  return availableModels.find((m) => m.id === id);
}

/**
 * Get default model (first in registry).
 * 
 * @returns Default model configuration
 * 
 * @example
 * ```typescript
 * const defaultModel = getDefaultModel();
 * // Returns gemini-2.5-flash
 * ```
 */
export function getDefaultModel(): AIModel {
  return availableModels[0]; // gemini-2.5-flash
}
