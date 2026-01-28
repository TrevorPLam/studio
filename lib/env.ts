/**
 * ============================================================================
 * ENVIRONMENT VARIABLES MODULE
 * ============================================================================
 *
 * @file src/lib/env.ts
 * @module env
 *
 * PURPOSE:
 * Centralized access to environment variables with type safety and defaults.
 * Provides a single source of truth for configuration values.
 *
 * RELATED FILES:
 * - .env.local (local development environment variables)
 * - SETUP.md (documentation for required environment variables)
 * - src/lib/security/secrets.ts (GitHub App secrets management)
 *
 * ENVIRONMENT VARIABLES:
 * - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET: OAuth credentials
 * - GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY: GitHub App credentials (GH-AUTH-001)
 * - NEXTAUTH_URL, NEXTAUTH_SECRET: NextAuth configuration
 * - GOOGLE_AI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY: AI model keys
 * - GENKIT_ENV: Genkit environment (dev/prod)
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: ENVIRONMENT VARIABLE HELPER
// ============================================================================

/**
 * Get environment variable with optional default value.
 *
 * Throws error if variable is missing and no default provided.
 *
 * @param key - Environment variable name
 * @param defaultValue - Optional default value
 * @returns Environment variable value or default
 * @throws Error if variable is missing and no default provided
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ============================================================================
// SECTION: ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Centralized environment configuration object.
 *
 * Provides typed access to all environment variables with defaults where appropriate.
 */
export const env = {
  /**
   * GitHub OAuth and App configuration.
   *
   * @see GH-AUTH-001 for GitHub App configuration
   */
  github: {
    /** GitHub OAuth Client ID */
    clientId: process.env.GITHUB_CLIENT_ID || '',

    /** GitHub OAuth Client Secret */
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',

    /** OAuth callback URL */
    callbackUrl:
      process.env.GITHUB_OAUTH_CALLBACK_URL || 'http://localhost:9002/api/auth/callback/github',

    // ========================================================================
    // GitHub App configuration (GH-AUTH-001)
    // ========================================================================
    /** GitHub App ID */
    appId: process.env.GITHUB_APP_ID || '',

    /** GitHub App Private Key (PEM format) */
    appPrivateKey: process.env.GITHUB_APP_PRIVATE_KEY || '',

    /** GitHub App Installation ID (optional, can be provided per-request) */
    appInstallationId: process.env.GITHUB_APP_INSTALLATION_ID || '',
  },

  /**
   * NextAuth.js configuration.
   */
  nextAuth: {
    /** Base URL for NextAuth callbacks */
    url: process.env.NEXTAUTH_URL || 'http://localhost:9002',

    /** Secret for JWT signing (required in production) */
    secret: process.env.NEXTAUTH_SECRET || '',
  },

  /**
   * AI Model API keys.
   *
   * Supports multiple providers for flexibility.
   */
  ai: {
    /** Google AI (Gemini) API key */
    googleApiKey: process.env.GOOGLE_AI_API_KEY || '',

    /** OpenAI API key (optional) */
    openaiApiKey: process.env.OPENAI_API_KEY || '',

    /** Anthropic (Claude) API key (optional) */
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  /**
   * Genkit configuration.
   */
  genkit: {
    /** Genkit environment (dev/prod) */
    env: process.env.GENKIT_ENV || 'dev',
  },

  /**
   * Admin configuration.
   *
   * Comma-separated list of admin email addresses.
   * Used for authorization of administrative operations.
   *
   * Example: ADMIN_EMAILS=admin@example.com,superuser@example.com
   */
  admin: {
    /** Comma-separated list of admin email addresses */
    emails: process.env.ADMIN_EMAILS || '',
  },
};
