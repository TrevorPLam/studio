import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { ai, defaultModel } from '@/ai/genkit';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateAgentSession } from '@/lib/db/agent-sessions';
import type { AgentMessage } from '@/lib/agent/session-types';
import { agentChatRequestSchema, validateRequest, type AgentMessageInput } from '@/lib/validation';
import { ValidationError } from '@/lib/types';
import { logger } from '@/lib/logger';

function getUserId(session: Session | null): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

function ensureTimestamps(messages: AgentMessageInput[]): AgentMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

// Streaming chat endpoint (2026 enhancement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = getUserId(session);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User identity unavailable' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { messages, model, sessionId } = validateRequest(agentChatRequestSchema, body);

    const lastUserMessage = messages.filter((message) => message.role === 'user').slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedModel = model || defaultModel;
    logger.info('Starting streaming chat', { model: selectedModel, sessionId });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let accumulatedText = '';

        try {
          const { stream: responseStream } = ai.generateStream({
            model: selectedModel,
            prompt: lastUserMessage,
          });

          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            if (!text) {
              continue;
            }

            accumulatedText += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          if (sessionId) {
            const persistedMessages = ensureTimestamps([
              ...messages,
              {
                role: 'assistant',
                content: accumulatedText,
                timestamp: new Date().toISOString(),
              },
            ]);
            const updated = await updateAgentSession(userId, sessionId, { messages: persistedMessages });
            if (!updated) {
              logger.warn('Session not found while persisting streaming response', { sessionId });
            }
          }
        } catch (error) {
          logger.error('Streaming error', error instanceof Error ? error : new Error(String(error)));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logger.error('Chat stream API error', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: 'Validation error', message: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
