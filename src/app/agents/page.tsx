'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Plus, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface AgentSession {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  lastMessage?: string;
}

export default function AgentsPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionPrompt, setNewSessionPrompt] = useState('');

  useEffect(() => {
    // Load sessions from localStorage
    const loadSessions = () => {
      const allSessions: AgentSession[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('agentSession_')) {
          const session = localStorage.getItem(key);
          if (session) {
            try {
              allSessions.push(JSON.parse(session));
            } catch (e) {
              console.error('Error parsing session:', e);
            }
          }
        }
      }
      // Also check the old format
      const oldStored = localStorage.getItem('agentSessions');
      if (oldStored) {
        try {
          const oldSessions = JSON.parse(oldStored);
          allSessions.push(...oldSessions);
        } catch (e) {
          console.error('Error parsing old sessions:', e);
        }
      }
      setSessions(allSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    loadSessions();
  }, []);

  const createSession = () => {
    if (!newSessionName.trim()) return;

    const newSession: AgentSession = {
      id: Date.now().toString(),
      name: newSessionName,
      model: 'googleai/gemini-2.5-flash',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage with new format
    localStorage.setItem(`agentSession_${newSession.id}`, JSON.stringify(newSession));
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setNewSessionName('');
    setNewSessionPrompt('');
    setIsDialogOpen(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in with GitHub to access agents
            </CardDescription>
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Agent Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI agent sessions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent Session</DialogTitle>
                <DialogDescription>
                  Start a new conversation with an AI agent
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name</Label>
                  <Input
                    id="name"
                    placeholder="My Agent Session"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Initial Prompt (Optional)</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you want the agent to help with..."
                    value={newSessionPrompt}
                    onChange={(e) => setNewSessionPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={createSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No agent sessions yet. Create your first session to get started.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Link key={session.id} href={`/agents/${session.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <CardTitle className="text-lg">{session.name}</CardTitle>
                          <CardDescription>
                            {session.model} • {new Date(session.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      {session.lastMessage && (
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  {session.lastMessage && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.lastMessage}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
