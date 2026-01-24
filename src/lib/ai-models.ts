// AI Model configuration for 2026 - supports multiple providers
export interface AIModel {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  description: string;
  maxTokens?: number;
}

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
  // Add more models as needed
  // {
  //   id: 'gpt-4o',
  //   name: 'GPT-4o',
  //   provider: 'openai',
  //   model: 'openai/gpt-4o',
  //   description: 'OpenAI\'s latest model',
  // },
];

export function getModelById(id: string): AIModel | undefined {
  return availableModels.find((m) => m.id === id);
}

export function getDefaultModel(): AIModel {
  return availableModels[0]; // gemini-2.5-flash
}
