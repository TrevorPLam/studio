import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generate } from '@genkit-ai/ai/model';
import { defaultModel } from '@/ai/genkit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, model } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Get the last user message
    const lastUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .slice(-1)[0]?.content || '';

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    // Use Genkit to generate response
    const response = await generate({
      model: model || defaultModel,
      prompt: lastUserMessage,
    });

    return NextResponse.json({
      response: response.text || 'I apologize, but I could not generate a response.',
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
