/**
 * ============================================================================
 * NEXTAUTH CONFIGURATION
 * ============================================================================
 *
 * @file src/lib/auth/config.ts
 * @module auth-config
 *
 * PURPOSE:
 * NextAuth.js configuration options.
 * Separated from route handler to avoid Next.js type issues.
 *
 * RELATED FILES:
 * - src/app/api/auth/[...nextauth]/route.ts (Uses this config)
 * - src/lib/env.ts (OAuth configuration)
 *
 * ============================================================================
 */

import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { env } from '@/lib/env';

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
