/**
 * ============================================================================
 * SHARED TYPE DEFINITIONS
 * ============================================================================
 * 
 * @file src/lib/types.ts
 * @module types
 * 
 * PURPOSE:
 * Shared TypeScript type definitions and error classes used across the application.
 * Includes GitHub API types, agent types, and custom error classes.
 * 
 * NOTE:
 * Some types here are legacy/deprecated. New code should use:
 * - @/lib/agent/session-types.ts for AgentSession, AgentMessage
 * - @/lib/validation.ts for validation-related types
 * 
 * RELATED FILES:
 * - src/lib/agent/session-types.ts (Current session types)
 * - src/lib/validation.ts (Validation types)
 * - src/lib/github-client.ts (Uses GitHub types)
 * 
 * ============================================================================
 */

// ============================================================================
// SECTION: GITHUB API TYPES
// ============================================================================

/**
 * GitHub repository information from API.
 * 
 * @see GitHub REST API: GET /repos/{owner}/{repo}
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
    id: number;
  };
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

/**
 * GitHub commit information from API.
 * 
 * @see GitHub REST API: GET /repos/{owner}/{repo}/commits
 */
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
    id: number;
  } | null;
  committer: {
    login: string;
    avatar_url: string;
    id: number;
  } | null;
  html_url: string;
}

/**
 * GitHub user information from API.
 * 
 * @see GitHub REST API: GET /user
 */
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

// ============================================================================
// SECTION: AGENT TYPES (LEGACY)
// ============================================================================
// NOTE: These types are legacy. Use @/lib/agent/session-types.ts instead.

/**
 * Agent message (LEGACY - use AgentMessage from @/lib/agent/session-types.ts).
 * 
 * @deprecated Use AgentMessage from @/lib/agent/session-types.ts
 */
export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

/**
 * Agent session (LEGACY - use AgentSession from @/lib/agent/session-types.ts).
 * 
 * @deprecated Use AgentSession from @/lib/agent/session-types.ts
 */
export interface AgentSession {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  messages?: AgentMessage[];
  repository?: string;
  lastMessage?: string;
}

// ============================================================================
// SECTION: ERROR CLASSES
// ============================================================================

/**
 * GitHub API error with rate limit information.
 * 
 * Thrown when GitHub API requests fail.
 * Includes status code and rate limit details.
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rateLimitRemaining?: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

/**
 * AI API error with model information.
 * 
 * Thrown when AI model API requests fail.
 * Includes status code and model identifier.
 */
export class AIAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public model?: string
  ) {
    super(message);
    this.name = 'AIAPIError';
  }
}

/**
 * Validation error with field path.
 * 
 * Thrown when request validation fails.
 * Includes field path for error reporting.
 * 
 * @see src/lib/validation.ts validateRequest()
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// SECTION: NEXTAUTH TYPES
// ============================================================================

/**
 * Extended NextAuth session with access token.
 * 
 * Used in API routes to access GitHub OAuth token.
 */
export interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}
