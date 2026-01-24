import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {env} from '@/lib/env';

// Configure Genkit with Google AI using environment variable
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: env.ai.googleApiKey || process.env.GOOGLE_AI_API_KEY || '',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});

export const defaultModel = 'googleai/gemini-2.5-flash';