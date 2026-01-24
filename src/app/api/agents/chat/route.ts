import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { ai, defaultModel } from '@/ai/genkit';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateAgentSession } from '@/lib/db/agent-sessions';
import type { AgentMessage } from '@/lib/agent/session-types';
import { agentChatRequestSchema, validateRequest, type AgentMessageInput } from '@/lib/validation';
import { AIAPIError, ValidationError } from '@/lib/types';
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

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
    }

    body = await request.json();
    const { messages, model, sessionId } = validateRequest(agentChatRequestSchema, body);

    const lastUserMessage = messages.filter((message) => message.role === 'user').slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await ai.generate({
        model: model || defaultModel,
        prompt: lastUserMessage,
      });

      clearTimeout(timeoutId);

      const responseText = response.text || 'I apologize, but I could not generate a response.';

      if (sessionId) {
        const persistedMessages = ensureTimestamps([
          ...messages,
          { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
        ]);
        const updated = await updateAgentSession(userId, sessionId, { messages: persistedMessages });
        if (!updated) {
          logger.warn('Session not found while persisting chat response', { sessionId });
        }
      }

      return NextResponse.json({ response: responseText });
    } catch (genkitError) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted) {
        throw new AIAPIError('Request timeout', 408, model);
      }
      throw genkitError;
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message, field: error.field },
        { status: 400 }
      );
    }

    if (error instanceof AIAPIError) {
      return NextResponse.json({ error: 'AI API error', message: error.message }, { status: error.statusCode });
    }

    logger.error('Error in chat API', error instanceof Error ? error : new Error(String(error)), {
      body,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
