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

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

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
