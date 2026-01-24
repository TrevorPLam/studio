import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateStream } from '@genkit-ai/ai/model';
import { defaultModel } from '@/ai/genkit';
import { validateRequest, agentChatRequestSchema } from '@/lib/validation';
import { AIAPIError, ValidationError } from '@/lib/types';
import { logger } from '@/lib/logger';

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

    const body = await request.json();
    const { messages, model } = validateRequest(agentChatRequestSchema, body);

    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedModel = model || defaultModel;
    logger.info('Starting streaming chat', { model: selectedModel });

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          
          // Use generateStream for real-time responses
          const responseStream = await generateStream({
            model: selectedModel,
            prompt: lastUserMessage,
          });

          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            if (text) {
              // Send chunk as SSE
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`)
              );
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          logger.error('Streaming error', error instanceof Error ? error : new Error(String(error)));
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logger.error('Chat stream API error', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: 'Validation error', message: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
