/**
 * ============================================================================
 * REPOSITORY DETAIL PAGE COMPONENT
 * ============================================================================
 * 
 * @file src/app/repositories/[owner]/[repo]/page.tsx
 * @route /repositories/[owner]/[repo]
 * 
 * PURPOSE:
 * Display repository details, commits, and agent session options.
 * 
 * FEATURES:
 * - Repository information display
 * - Commit history
 * - Tabbed interface (Code, Commits, Agent)
 * - Start agent session for repository
 * 
 * RELATED FILES:
 * - src/app/api/github/repositories/[owner]/[repo]/route.ts (Repository API)
 * - src/app/api/github/repositories/[owner]/[repo]/commits/route.ts (Commits API)
 * - src/app/agents/[id]/page.tsx (Agent session page)
 * 
 * ============================================================================
 */

'use client';

// ============================================================================
// SECTION: IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Code, GitCommit } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Repository data structure from GitHub API.
 */
interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
}

/**
 * Commit data structure from GitHub API.
 */
interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

// ============================================================================
// SECTION: REPOSITORY PAGE COMPONENT
// ============================================================================

/**
 * Repository detail page component.
 * 
 * Displays repository information, commits, and agent session options.
 * 
 * @returns Repository detail page JSX
 */
export default function RepositoryPage() {
  // ========================================================================
  // ROUTE & SESSION
  // ========================================================================
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const owner = params?.owner as string;
  const repo = params?.repo as string;

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [repository, setRepository] = useState<Repository | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('code');

  // ========================================================================
  // FUNCTION: LOAD REPOSITORY
  // ========================================================================

  /**
   * Load repository details from GitHub API.
   */
  const loadRepository = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`/api/github/repositories/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load repository');
      }

      const data = await response.json();
      setRepository(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, owner, repo]);

  // ========================================================================
  // FUNCTION: LOAD COMMITS
  // ========================================================================

  /**
   * Load commit history from GitHub API.
   */
  const loadCommits = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`/api/github/repositories/${owner}/${repo}/commits`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommits(data);
      }
    } catch (err) {
      console.error('Error loading commits:', err);
    }
  }, [session?.accessToken, owner, repo]);

  // ========================================================================
  // EFFECT: LOAD DATA ON MOUNT
  // ========================================================================
  useEffect(() => {
    if (session?.accessToken && owner && repo) {
      loadRepository();
      loadCommits();
    }
  }, [session?.accessToken, owner, repo, loadRepository, loadCommits]);

  // ========================================================================
  // RENDER: LOADING STATE
  // ========================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ========================================================================
  // RENDER: ERROR STATE
  // ========================================================================
  if (error || !repository) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Repository not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/repositories')} variant="outline">
              Back to Repositories
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
    <div className="min-h-screen bg-background">
      {/* ====================================================================
          HEADER
          ==================================================================== */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/repositories')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{repository.name}</h1>
              <p className="text-sm text-muted-foreground">{repository.full_name}</p>
            </div>
          </div>
          {repository.description && (
            <p className="text-muted-foreground ml-12">{repository.description}</p>
          )}
        </div>
      </div>

      {/* ====================================================================
          TABS CONTENT
          ==================================================================== */}
      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="commits">
              <GitCommit className="h-4 w-4 mr-2" />
              Commits
            </TabsTrigger>
            <TabsTrigger value="agent">
              <Bot className="h-4 w-4 mr-2" />
              Agent
            </TabsTrigger>
          </TabsList>

          {/* ================================================================
              CODE TAB
              ================================================================ */}
          <TabsContent value="code" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Repository Files</CardTitle>
                <CardDescription>
                  Browse and edit your code files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Code editor coming soon. This will allow you to browse and edit files.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================
              COMMITS TAB
              ================================================================ */}
          <TabsContent value="commits" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Commits</CardTitle>
                <CardDescription>
                  View commit history for {repository.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commits.length === 0 ? (
                  <div className="text-center py-12">
                    <GitCommit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No commits found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commits.map((commit) => (
                      <div key={commit.sha} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-medium">{commit.commit.message.split('\n')[0]}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {commit.author?.login || commit.commit.author.name} •{' '}
                              {new Date(commit.commit.author.date).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                              {commit.sha.substring(0, 7)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================
              AGENT TAB
              ================================================================ */}
          <TabsContent value="agent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Session</CardTitle>
                <CardDescription>
                  Start an AI agent session for this repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Start an AI agent session to help with this repository
                  </p>
                  <Button
                    onClick={() => {
                      // Create a session linked to this repo
                      const sessionId = `repo-${owner}-${repo}-${Date.now()}`;
                      router.push(`/agents/${sessionId}?repo=${encodeURIComponent(repository.full_name)}`);
                    }}
                  >
                    Start Agent Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
