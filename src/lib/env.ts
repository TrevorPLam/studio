export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_OAUTH_CALLBACK_URL || 'http://localhost:9002/api/auth/callback/github',
  },
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:9002',
    secret: process.env.NEXTAUTH_SECRET || '',
  },
  ai: {
    googleApiKey: process.env.GOOGLE_AI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  genkit: {
    env: process.env.GENKIT_ENV || 'dev',
  },
};
