'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { getAgentSession, saveAgentMessage } from '@/lib/agents';

export default function AgentSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    const sessionId = params.id as string;
    const stored = getAgentSession(sessionId);
    if (stored) {
      setSessionName(stored.name);
      setMessages(stored.messages || []);
    }
  }, [params.id]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.id,
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const assistantMessage = { role: 'assistant' as const, content: data.response };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveAgentMessage(params.id as string, updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.' };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="border-b">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/agents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{sessionName || 'Agent Session'}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Start a conversation with your AI agent
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message, index) => (
              <Card key={index} className={message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {isLoading && (
            <Card className="mr-auto max-w-[80%]">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Thinking...</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
