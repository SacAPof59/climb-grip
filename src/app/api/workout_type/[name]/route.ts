// src/app/api/workout/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../prisma';
import { authOptions } from '@/authOptions';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutName = name;

    if (!workoutName) {
      return NextResponse.json({ error: 'Workout name is required' }, { status: 400 });
    }

    const decodedWorkoutName = decodeURIComponent(workoutName);

    const workout = await prisma.workoutType.findUnique({
      where: {
        name: decodedWorkoutName,
      },
      include: {
        workoutTypeSequences: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json({ error: 'Failed to fetch workout details' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutName = decodeURIComponent(name);

    // Get the workout with sequences
    const workout = await prisma.workoutType.findUnique({
      where: { name: workoutName },
      include: {
        workoutTypeSequences: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Create a unique workout instance for this user
    const climber = await prisma.climber.findUnique({
      where: { userId: session.user.id },
    });

    if (!climber) {
      return NextResponse.json({ error: 'Climber profile not found' }, { status: 404 });
    }

    // Create or find workout instance
    const workoutInstance = await prisma.workout.create({
      data: {
        workoutName: workout.name,
        climberId: climber.id,
      },
    });

    return NextResponse.json({
      workout: workoutInstance,
    });
  } catch (error) {
    console.error('Error creating workout timer:', error);
    return NextResponse.json({ error: 'Failed to create workout timer' }, { status: 500 });
  }
}
