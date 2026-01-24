/**
 * ============================================================================
 * REPOSITORIES LIST PAGE COMPONENT
 * ============================================================================
 *
 * @file src/app/repositories/page.tsx
 * @route /repositories
 *
 * PURPOSE:
 * Display list of user's GitHub repositories.
 *
 * FEATURES:
 * - Load repositories from GitHub API
 * - Navigate to repository detail pages
 * - Authentication-gated access
 * - Error handling and retry
 *
 * RELATED FILES:
 * - src/app/api/github/repositories/route.ts (Repositories API)
 * - src/app/repositories/[owner]/[repo]/page.tsx (Repository detail page)
 *
 * ============================================================================
 */

'use client';

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderGit2, Loader2 } from 'lucide-react';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Repository data structure from GitHub API.
 */
interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

// ============================================================================
// SECTION: REPOSITORIES PAGE COMPONENT
// ============================================================================

/**
 * Repositories list page component.
 *
 * Displays user's GitHub repositories with navigation to detail pages.
 *
 * @returns Repositories page JSX
 */
export default function RepositoriesPage() {
  // ========================================================================
  // HOOKS
  // ========================================================================
  const { data: session, status } = useSession();
  const router = useRouter();

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // FUNCTION: LOAD REPOSITORIES
  // ========================================================================

  /**
   * Load repositories from GitHub API.
   *
   * Uses authenticated session token to fetch user's repositories.
   */
  const loadRepositories = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/github/repositories', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load repositories');
      }

      const data = await response.json();
      setRepositories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  // ========================================================================
  // EFFECT: LOAD ON MOUNT
  // ========================================================================
  useEffect(() => {
    if (session?.accessToken) {
      loadRepositories();
    }
  }, [session?.accessToken, loadRepositories]);

  // ========================================================================
  // RENDER: LOADING STATE
  // ========================================================================
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ========================================================================
  // RENDER: AUTHENTICATION REQUIRED
  // ========================================================================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in with GitHub to view your repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn('github')} className="w-full">
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // RENDER: MAIN CONTENT
  // ========================================================================
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground mt-1">Your GitHub repositories</p>
        </div>

        {/* ================================================================
            ERROR MESSAGE
            ================================================================ */}
        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadRepositories} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ================================================================
            REPOSITORIES LIST
            ================================================================ */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : repositories.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">No repositories found.</p>
              <Button onClick={loadRepositories} variant="outline">
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Repositories grid
          <div className="grid gap-4">
            {repositories.map((repo) => (
              <Card
                key={repo.id}
                className="hover:bg-accent transition-colors cursor-pointer"
                onClick={() => router.push(`/repositories/${repo.owner.login}/${repo.name}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FolderGit2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <CardTitle className="text-lg">{repo.name}</CardTitle>
                        <CardDescription>
                          {repo.full_name}
                          {repo.private && ' • Private'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {repo.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{repo.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
