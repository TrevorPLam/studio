import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAgentSessionById, updateAgentSession } from '@/lib/db/agent-sessions';
import type { AgentSessionStep } from '@/lib/agent/session-types';
import { ValidationError } from '@/lib/types';

const addStepSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['started', 'succeeded', 'failed']),
  timestamp: z.string().optional(),
  details: z.string().optional(),
});

type SessionParams = {
  params: {
    id: string;
  };
};

function getUserId(session: Session | null): string | null {
  return session?.user?.email ?? session?.user?.name ?? null;
}

export async function GET(_request: NextRequest, { params }: SessionParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
  }
  const agentSession = await getAgentSessionById(userId, params.id);
  if (!agentSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ steps: agentSession.steps ?? [] });
}

export async function POST(request: NextRequest, { params }: SessionParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User identity unavailable' }, { status: 400 });
    }
    const body = await request.json();
    const step = addStepSchema.parse({ ...body, timestamp: body.timestamp || new Date().toISOString() });
    const updated = await updateAgentSession(userId, params.id, { addStep: step as AgentSessionStep });
    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ steps: updated.steps ?? [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.errors[0]?.message, field: error.errors[0]?.path.join('.') },
        { status: 400 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message, field: error.field },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
