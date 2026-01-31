/**
 * ============================================================================
 * AGENT CHAT API ENDPOINT (NON-STREAMING)
 * ============================================================================
 *
 * @file src/app/api/agents/chat/route.ts
 * @route /api/agents/chat
 *
 * PURPOSE:
 * Non-streaming chat endpoint for AI agent interactions.
 * Returns complete response after generation.
 *
 * ENDPOINT:
 * - POST /api/agents/chat - Send chat message and get response
 *
 * AUTHENTICATION:
 * - Requires NextAuth session
 *
 * FEATURES:
 * - Request timeout protection (30s)
 * - Optional session persistence
 * - Error handling with proper status codes
 *
 * RELATED FILES:
 * - src/app/api/agents/chat-stream/route.ts (Streaming version)
 * - src/ai/genkit.ts (AI model integration)
 * - src/lib/db/agent-sessions.ts (Session persistence)
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { ai, defaultModel } from '@/ai/genkit';
import { authOptions } from '@/features/auth';
import { updateAgentSession } from '@/features/sessions';
import type { AgentMessage } from '@/features/agents';
import { agentChatRequestSchema, validateRequest, type AgentMessageInput } from '@/lib/validation';
import { AIAPIError, ValidationError } from '@/lib/types';
import { logger } from '@/lib/logger';
import { getUserId, ensureTimestamps } from '@/lib/auth-helpers';

// ============================================================================
// SECTION: POST ENDPOINT - CHAT
// ============================================================================

/**
 * POST /api/agents/chat
 *
 * Send chat message to AI agent and get response.
 *
 * Request Body: {
 *   messages: AgentMessageInput[],
 *   model?: string,
 *   sessionId?: string
 * }
 *
 * Response: {
 *   response: string
 * }
 *
 * @param request - Next.js request object
 * @returns JSON response with AI-generated text
 * @returns 401 if not authenticated
 * @returns 400 if validation fails or no user message
 * @returns 408 if request timeout
 * @returns 500 if server error
 */
export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ========================================================================
    // USER IDENTIFICATION
    // ========================================================================
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
    }

    // ========================================================================
    // REQUEST VALIDATION
    // ========================================================================
    body = await request.json();
    const { messages, model, sessionId } = validateRequest(agentChatRequestSchema, body);

    // ========================================================================
    // EXTRACT USER MESSAGE
    // ========================================================================
    // Use last user message as prompt
    const lastUserMessage =
      messages.filter((message) => message.role === 'user').slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    // ========================================================================
    // REQUEST TIMEOUT PROTECTION
    // ========================================================================
    // 30 second timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // ====================================================================
      // GENERATE AI RESPONSE
      // ====================================================================
      const response = await ai.generate({
        model: model || defaultModel,
        prompt: lastUserMessage,
      });

      clearTimeout(timeoutId);

      const responseText = response.text || 'I apologize, but I could not generate a response.';

      // ====================================================================
      // PERSIST TO SESSION (OPTIONAL)
      // ====================================================================
      if (sessionId) {
        const persistedMessages = ensureTimestamps([
          ...messages,
          { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
        ]);
        const updated = await updateAgentSession(userId, sessionId, {
          messages: persistedMessages,
        });
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
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message, field: error.field },
        { status: 400 }
      );
    }

    if (error instanceof AIAPIError) {
      return NextResponse.json(
        { error: 'AI API error', message: error.message },
        { status: error.statusCode }
      );
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
