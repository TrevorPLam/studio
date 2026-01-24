import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generate } from '@genkit-ai/ai/model';
import { defaultModel } from '@/ai/genkit';
import { validateRequest, agentChatRequestSchema } from '@/lib/validation';
import { AIAPIError, ValidationError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messages, model } = validateRequest(agentChatRequestSchema, body);

    // Get the last user message
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    // Use Genkit to generate response with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await generate({
        model: model || defaultModel,
        prompt: lastUserMessage,
      });

      clearTimeout(timeoutId);
      return NextResponse.json({
        response: response.text || 'I apologize, but I could not generate a response.',
      });
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
      return NextResponse.json(
        { error: 'AI API error', message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
