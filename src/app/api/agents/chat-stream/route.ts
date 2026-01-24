/**
 * ============================================================================
 * AGENT CHAT API ENDPOINT (STREAMING)
 * ============================================================================
 *
 * @file src/app/api/agents/chat-stream/route.ts
 * @route /api/agents/chat-stream
 *
 * PURPOSE:
 * Streaming chat endpoint for AI agent interactions.
 * Returns Server-Sent Events (SSE) stream for real-time response.
 *
 * ENDPOINT:
 * - POST /api/agents/chat-stream - Send chat message and stream response
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 *
 * FEATURES:
 * - Server-Sent Events (SSE) streaming
 * - Real-time token streaming
 * - Optional session persistence after completion
 *
 * RELATED FILES:
 * - src/app/api/agents/chat/route.ts (Non-streaming version)
 * - src/ai/genkit.ts (AI model integration)
 * - src/lib/db/agent-sessions.ts (Session persistence)
 *
 * ============================================================================
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { ai, defaultModel } from '@/ai/genkit';
import { authOptions } from '@/lib/auth/config';
import { updateAgentSession } from '@/lib/db/agent-sessions';
import type { AgentMessage } from '@/lib/agent/session-types';
import { agentChatRequestSchema, validateRequest, type AgentMessageInput } from '@/lib/validation';
import { ValidationError } from '@/lib/types';
import { logger } from '@/lib/logger';

// ============================================================================
// SECTION: HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user ID from NextAuth session.
 *
 * @param session - NextAuth session object
 * @returns User ID or null if unavailable
 */
function getUserId(session: Session | null): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

/**
 * Ensure all messages have timestamps.
 *
 * @param messages - Array of message inputs
 * @returns Array of messages with timestamps
 */
function ensureTimestamps(messages: AgentMessageInput[]): AgentMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

// ============================================================================
// SECTION: POST ENDPOINT - STREAMING CHAT
// ============================================================================

/**
 * POST /api/agents/chat-stream
 *
 * Send chat message to AI agent and stream response.
 *
 * Request Body: {
 *   messages: AgentMessageInput[],
 *   model?: string,
 *   sessionId?: string
 * }
 *
 * Response: Server-Sent Events (SSE) stream
 * Format: data: {"chunk": "text"}\n\n
 * End: data: [DONE]\n\n
 *
 * @param request - Next.js request object
 * @returns SSE stream with AI-generated text chunks
 * @returns 401 if not authenticated
 * @returns 400 if validation fails or no user message
 * @returns 500 if server error
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // USER IDENTIFICATION
    // ========================================================================
    const userId = getUserId(session);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User identity unavailable' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // REQUEST VALIDATION
    // ========================================================================
    const body = await request.json();
    const { messages, model, sessionId } = validateRequest(agentChatRequestSchema, body);

    // ========================================================================
    // EXTRACT USER MESSAGE
    // ========================================================================
    const lastUserMessage =
      messages.filter((message) => message.role === 'user').slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedModel = model || defaultModel;
    logger.info('Starting streaming chat', { model: selectedModel, sessionId });

    // ========================================================================
    // CREATE SSE STREAM
    // ========================================================================
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let accumulatedText = '';

        try {
          // ================================================================
          // GENERATE STREAMING RESPONSE
          // ================================================================
          const { stream: responseStream } = ai.generateStream({
            model: selectedModel,
            prompt: lastUserMessage,
          });

          // Stream chunks to client
          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            if (!text) {
              continue;
            }

            accumulatedText += text;
            // SSE format: data: {json}\n\n
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
          }

          // Send completion marker
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          // ================================================================
          // PERSIST TO SESSION (OPTIONAL)
          // ================================================================
          if (sessionId) {
            const persistedMessages = ensureTimestamps([
              ...messages,
              {
                role: 'assistant',
                content: accumulatedText,
                timestamp: new Date().toISOString(),
              },
            ]);
            const updated = await updateAgentSession(userId, sessionId, {
              messages: persistedMessages,
            });
            if (!updated) {
              logger.warn('Session not found while persisting streaming response', { sessionId });
            }
          }
        } catch (error) {
          logger.error(
            'Streaming error',
            error instanceof Error ? error : new Error(String(error))
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    // ========================================================================
    // RETURN SSE STREAM
    // ========================================================================
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logger.error(
      'Chat stream API error',
      error instanceof Error ? error : new Error(String(error))
    );

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
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
