import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FolderGit2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Firebase Studio</h1>
          <p className="text-muted-foreground">GitHub with AI Agents</p>
        </div>
        
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
