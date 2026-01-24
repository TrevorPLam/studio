'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { AgentMessage } from '@/lib/agent/session-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

function ensureTimestamps(messages: AgentMessage[]): AgentMessage[] {
  return messages.map((message) => ({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

export default function AgentSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionId = params.id as string;

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionName, setSessionName] = useState('');
  const [sessionError, setSessionError] = useState<string | null>(null);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages]
  );

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const loadSession = async () => {
      setIsLoadingSession(true);
      setSessionError(null);

      try {
        const response = await fetch(`/api/sessions/${sessionId}`, { cache: 'no-store' });
        if (response.status === 404) {
          router.push('/agents');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to load session');
        }

        const data = (await response.json()) as { name: string; messages: AgentMessage[] };
        setSessionName(data.name);
        setMessages(ensureTimestamps(data.messages || []));
      } catch (error) {
        console.error('Error loading session', error);
        setSessionError('Unable to load this session. Please go back and try again.');
      } finally {
        setIsLoadingSession(false);
      }
    };

    void loadSession();
  }, [router, sessionId, status]);

  const persistMessages = async (nextMessages: AgentMessage[]) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: ensureTimestamps(nextMessages) }),
      });
    } catch (error) {
      console.error('Failed to persist messages', error);
    }
  };

  const sendMessage = async (useStreaming = false) => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: AgentMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantPlaceholder: AgentMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const messagesWithPlaceholder = [...newMessages, assistantPlaceholder];
    setMessages(messagesWithPlaceholder);

    try {
      if (useStreaming) {
        const response = await fetch('/api/agents/chat-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messages: newMessages,
          }),
        });

        if (!response.ok) {
          throw new Error('Streaming request failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        if (reader) {
          let done = false;
          while (!done) {
            const { done: streamDone, value } = await reader.read();
            done = streamDone;
            if (!value) {
              continue;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.startsWith('data: ')) {
                continue;
              }

              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(data) as { chunk?: string };
                if (!parsed.chunk) {
                  continue;
                }

                accumulatedText += parsed.chunk;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: accumulatedText,
                    timestamp: new Date().toISOString(),
                  };
                  return updated;
                });
              } catch (error) {
                console.error('Failed to parse streaming chunk', error);
              }
            }
          }
        }

        const finalMessages = messagesWithPlaceholder.map((message, index) =>
          index === messagesWithPlaceholder.length - 1 ? { ...message, content: accumulatedText } : message
        );
        setMessages(finalMessages);
        await persistMessages(finalMessages);
      } else {
        const response = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messages: newMessages,
          }),
        });

        if (!response.ok) {
          throw new Error('Chat request failed');
        }

        const data = (await response.json()) as { response: string };
        const assistantMessage: AgentMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
        await persistMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Error sending message', error);
      const errorMessage: AgentMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      const fallbackMessages = [...newMessages, errorMessage];
      setMessages(fallbackMessages);
      await persistMessages(fallbackMessages);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

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
          {sessionError && (
            <Card className="border-destructive/50">
              <CardContent className="py-4 text-sm text-destructive">{sessionError}</CardContent>
            </Card>
          )}
          {sortedMessages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Start a conversation with your AI agent</p>
              </CardContent>
            </Card>
          ) : (
            sortedMessages.map((message, index) => (
              <Card
                key={index}
                className={message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}
              >
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
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button onClick={() => void sendMessage()} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
