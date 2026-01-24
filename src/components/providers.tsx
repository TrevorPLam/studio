/**
 * ============================================================================
 * PROVIDERS COMPONENT
 * ============================================================================
 * 
 * @file src/components/providers.tsx
 * 
 * PURPOSE:
 * Client-side providers wrapper for React context providers.
 * Currently wraps NextAuth SessionProvider.
 * 
 * NOTE:
 * This is a client component ('use client') because SessionProvider requires
 * client-side React context.
 * 
 * RELATED FILES:
 * - src/app/layout.tsx (Uses Providers)
 * - src/app/api/auth/[...nextauth]/route.ts (NextAuth configuration)
 * 
 * ============================================================================
 */

'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Providers component.
 * 
 * Wraps children with NextAuth SessionProvider for authentication context.
 * 
 * @param children - Child components
 * @returns Providers JSX
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
