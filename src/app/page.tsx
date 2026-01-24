/**
 * ============================================================================
 * HOME PAGE COMPONENT
 * ============================================================================
 * 
 * @file src/app/page.tsx
 * @route /
 * 
 * PURPOSE:
 * Landing page providing navigation to main application features.
 * 
 * FEATURES:
 * - Navigation to Agents page
 * - Navigation to Repositories page
 * - Simple, clean UI
 * 
 * RELATED FILES:
 * - src/app/agents/page.tsx (Agents page)
 * - src/app/repositories/page.tsx (Repositories page)
 * 
 * ============================================================================
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FolderGit2 } from 'lucide-react';

/**
 * Home page component.
 * 
 * Displays navigation cards for Agents and Repositories.
 * 
 * @returns Home page JSX
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {/* ====================================================================
            HEADER
            ==================================================================== */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Firebase Studio</h1>
          <p className="text-muted-foreground">GitHub with AI Agents</p>
        </div>
        
        {/* ====================================================================
            AGENTS NAVIGATION CARD
            ==================================================================== */}
        <Link href="/agents" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Agents</CardTitle>
                  <CardDescription>
                    Create and interact with AI agent sessions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* ====================================================================
            REPOSITORIES NAVIGATION CARD
            ==================================================================== */}
        <Link href="/repositories" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FolderGit2 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Repositories</CardTitle>
                  <CardDescription>
                    View and manage your GitHub repositories
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
