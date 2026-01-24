/**
 * ============================================================================
 * NEXTAUTH AUTHENTICATION API ENDPOINT
 * ============================================================================
 * 
 * @file src/app/api/auth/[...nextauth]/route.ts
 * @route /api/auth/*
 * 
 * PURPOSE:
 * NextAuth.js authentication endpoint handling OAuth flows and session management.
 * Supports GitHub OAuth provider.
 * 
 * ENDPOINTS:
 * - GET/POST /api/auth/signin - Sign in page
 * - GET/POST /api/auth/signout - Sign out
 * - GET/POST /api/auth/callback/github - OAuth callback
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * 
 * AUTHENTICATION:
 * - GitHub OAuth provider
 * - Stores access token in JWT for API access
 * 
 * RELATED FILES:
 * - src/lib/env.ts (OAuth configuration)
 * - src/types/next-auth.d.ts (Type extensions)
 * 
 * ============================================================================
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { env } from '@/lib/env';

// ============================================================================
// SECTION: NEXTAUTH CONFIGURATION
// ============================================================================

/**
 * NextAuth configuration options.
 * 
 * Features:
 * - GitHub OAuth provider
 * - JWT callback to store access token
 * - Session callback to expose access token
 * - Custom sign-in page
 */
export const authOptions: NextAuthOptions = {
  /**
   * Authentication providers.
   * Currently supports GitHub OAuth only.
   */
  providers: [
    GithubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
    }),
  ],
  
  /**
   * JWT callback: store access token in JWT.
   * 
   * Called when JWT is created or updated.
   * Stores GitHub OAuth access token for API calls.
   */
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    
    /**
     * Session callback: expose access token in session.
     * 
     * Called when session is accessed.
     * Makes access token available to client/server components.
     */
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  
  /**
   * Custom pages configuration.
   * Uses home page for sign-in.
   */
  pages: {
    signIn: '/',
  },
};

// ============================================================================
// SECTION: REQUEST HANDLERS
// ============================================================================

/**
 * NextAuth request handler.
 * 
 * Handles all NextAuth.js routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/github
 * - /api/auth/session
 * - /api/auth/csrf
 */
const handler = NextAuth(authOptions);

/**
 * GET handler for NextAuth routes.
 */
export { handler as GET };

/**
 * POST handler for NextAuth routes.
 */
export { handler as POST };
