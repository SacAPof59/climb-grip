// src/app/api/workout/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../prisma';
import { authOptions } from '@/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutTypes = await prisma.workoutType.findMany({
      include: {
        workoutTypeSequences: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    return NextResponse.json(workoutTypes);
  } catch (error) {
    console.error('Error fetching workout types:', error);
    return NextResponse.json({ error: 'Failed to fetch workout types' }, { status: 500 });
  }
}
