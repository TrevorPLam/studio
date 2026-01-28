/**
 * ============================================================================
 * NEXTAUTH TYPE EXTENSIONS
 * ============================================================================
 *
 * @file src/types/next-auth.d.ts
 *
 * PURPOSE:
 * TypeScript type declarations extending NextAuth types.
 * Adds accessToken to Session and JWT interfaces.
 *
 * EXTENSIONS:
 * - Session.accessToken - GitHub OAuth access token
 * - JWT.accessToken - Stored in JWT for session persistence
 *
 * RELATED FILES:
 * - src/app/api/auth/[...nextauth]/route.ts (JWT/session callbacks)
 * - All API routes using session.accessToken
 *
 * ============================================================================
 */

import type { DefaultSession } from 'next-auth';

/**
 * Extend NextAuth Session interface.
 *
 * Adds accessToken field for GitHub OAuth token.
 */
declare module 'next-auth' {
  interface Session {
    /** GitHub OAuth access token */
    accessToken?: string;

    /** User information */
    user?: DefaultSession['user'];
  }
}

/**
 * Extend NextAuth JWT interface.
 *
 * Adds accessToken field for storing in JWT.
 */
declare module 'next-auth/jwt' {
  interface JWT {
    /** GitHub OAuth access token */
    accessToken?: string;
  }
}
