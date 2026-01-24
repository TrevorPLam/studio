# Configuration Reference

Complete reference for all configuration options in Firebase Studio.

## Table of Contents

- [Environment Variables](#environment-variables)
  - [Required Variables](#required-variables)
  - [Optional Variables](#optional-variables)
- [Configuration Files](#configuration-files)
- [Application Configuration](#application-configuration)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Validation](#validation)
- [Default Values](#default-values)
- [Configuration Best Practices](#configuration-best-practices)
- [Troubleshooting](#troubleshooting)
- [Configuration Examples](#configuration-examples)
- [Related Documentation](#related-documentation)

---

## Environment Variables

### Required Variables

#### NextAuth Configuration

```env
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your-random-secret-here
```

- **NEXTAUTH_URL:** Base URL of your application
- **NEXTAUTH_SECRET:** Random secret for session encryption (generate with `openssl rand -base64 32`)

#### GitHub OAuth

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_OAUTH_CALLBACK_URL=http://localhost:9002/api/auth/callback/github
```

- **GITHUB_CLIENT_ID:** GitHub OAuth App Client ID
- **GITHUB_CLIENT_SECRET:** GitHub OAuth App Client Secret
- **GITHUB_OAUTH_CALLBACK_URL:** OAuth callback URL (must match GitHub app settings)

### Optional Variables

#### GitHub App (for advanced features)

```env
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GITHUB_APP_INSTALLATION_ID=12345678
```

- **GITHUB_APP_ID:** GitHub App ID
- **GITHUB_APP_PRIVATE_KEY:** GitHub App private key (with `\n` for newlines)
- **GITHUB_APP_INSTALLATION_ID:** Installation ID (optional, can be specified per-request)

#### AI Model API Keys

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key_optional
ANTHROPIC_API_KEY=your_anthropic_api_key_optional
```

- **GOOGLE_AI_API_KEY:** Google AI API key (required for default model)
- **OPENAI_API_KEY:** OpenAI API key (optional)
- **ANTHROPIC_API_KEY:** Anthropic API key (optional)

#### Genkit

```env
GENKIT_ENV=dev
```

- **GENKIT_ENV:** Genkit environment (`dev` or `production`)

#### Node Environment

```env
NODE_ENV=development
```

- **NODE_ENV:** Node environment (`development` or `production`)

## Configuration Files

### next.config.ts

Next.js configuration file.

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration options
};

module.exports = nextConfig;
```

### tsconfig.json

TypeScript configuration.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tailwind.config.ts

Tailwind CSS configuration.

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

## Application Configuration

### Default Model

**Location:** `src/ai/genkit.ts`

```typescript
export const defaultModel = 'googleai/gemini-2.5-flash';
```

### Session Storage

**Location:** `src/lib/db/agent-sessions.ts`

```typescript
const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'agent-sessions.json');
```

### Path Policy

**Location:** `src/lib/security/path-policy.ts`

```typescript
export const ALLOWED_PREFIXES = [
  'docs/',
  '.repo/',
  'README.md',
];

export const FORBIDDEN_PREFIXES = [
  '.github/workflows/',
  'package.json',
  // ... more
];
```

### Token Caching

**Location:** `src/lib/github-app.ts`

```typescript
const EARLY_EXPIRATION_BUFFER_MS = 60 * 1000; // 60 seconds
```

### Request Timeout

**Location:** `src/app/api/agents/chat/route.ts`

```typescript
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
```

## Environment-Specific Configuration

### Development

`.env.local` (gitignored)

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:9002
GENKIT_ENV=dev
```

### Production

`.env.production`

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
GENKIT_ENV=production
```

## Validation

### Environment Variable Validation

Environment variables are validated at runtime:

```typescript
// src/lib/security/secrets.ts
export function getGitHubAppConfig() {
  const appId = process.env.GITHUB_APP_ID;
  if (!appId) {
    throw new Error('GITHUB_APP_ID environment variable is required');
  }
  // ...
}
```

### Configuration Validation

Use validation schemas for configuration:

```typescript
import { z } from 'zod';

const configSchema = z.object({
  appId: z.string().min(1),
  privateKey: z.string().min(1),
});

const config = configSchema.parse(process.env);
```

## Default Values

### Session Defaults

```typescript
const DEFAULT_MODEL = 'googleai/gemini-2.5-flash';
const DEFAULT_STATE: AgentSessionState = 'created';
```

### Cache Defaults

```typescript
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

## Configuration Best Practices

### Security

- ✅ Never commit secrets to version control
- ✅ Use environment variables for secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod

### Organization

- ✅ Group related variables
- ✅ Use descriptive names
- ✅ Document required vs optional
- ✅ Provide default values when safe

## Troubleshooting

### Missing Environment Variables

**Error:** "GITHUB_APP_ID environment variable is required"

**Solution:**
1. Check `.env.local` file exists
2. Verify variable name matches exactly
3. Restart development server

### Invalid Configuration

**Error:** "Validation failed"

**Solution:**
1. Check variable format
2. Verify required fields present
3. Check for typos

### Configuration Not Loading

**Solution:**
1. Verify file is `.env.local` (not `.env`)
2. Restart development server
3. Check file location (project root)

## Configuration Examples

### Minimal Configuration

```env
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=secret
GITHUB_CLIENT_ID=client_id
GITHUB_CLIENT_SECRET=client_secret
GOOGLE_AI_API_KEY=api_key
```

### Full Configuration

```env
# NextAuth
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=secret

# GitHub OAuth
GITHUB_CLIENT_ID=client_id
GITHUB_CLIENT_SECRET=client_secret
GITHUB_OAUTH_CALLBACK_URL=http://localhost:9002/api/auth/callback/github

# GitHub App
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GITHUB_APP_INSTALLATION_ID=12345678

# AI Models
GOOGLE_AI_API_KEY=api_key
OPENAI_API_KEY=api_key_optional
ANTHROPIC_API_KEY=api_key_optional

# Genkit
GENKIT_ENV=dev

# Node
NODE_ENV=development
```

## Related Documentation

- **[SETUP.md](../SETUP.md)** - Setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production configuration
- **[SECURITY.md](./SECURITY.md)** - Security configuration
- **[GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md)** - GitHub App configuration

## Configuration Validation Flow

```
Environment Variable
    │
    ▼
Read from process.env
    │
    ▼
Validation Schema (Zod)
    │
    ├─→ Valid ──→ ✅ Use value
    │
    └─→ Invalid ──→ ❌ Throw error with field path
```

## Configuration Priority

1. **Environment Variables** (highest priority)
2. **Configuration Files** (next.config.ts, etc.)
3. **Default Values** (lowest priority)
