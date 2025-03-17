// src/app/api/timer/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '../../../../prisma';
import { authOptions } from '@/authOptions';

// Define validation schema for exercise
const timerExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  duration: z.number().int().positive('Duration must be positive'),
  restDuration: z.number().int().nonnegative('Rest duration must be non-negative'),
  repetition: z.number().int().positive('Repetition must be positive'),
});

// Define validation schema for step
const timerStepSchema = z.object({
  name: z.string().min(1, 'Step name is required'),
  restDuration: z.number().int().nonnegative('Rest duration must be non-negative'),
  repetition: z.number().int().positive('Repetition must be positive'),
  exercises: z.array(timerExerciseSchema).min(1, 'At least one exercise is required'),
});

// Define validation schema for timer
const timerSchema = z.object({
  name: z.string().min(1, 'Timer name is required'),
  steps: z.array(timerStepSchema).min(1, 'At least one step is required'),
});

interface PrismaExercise {
  name: string;
  duration: number;
  restDuration: number;
  repetition: number;
  timerStepTimerId: string;
  timerStepName: string;
}

interface PrismaStep {
  name: string;
  restDuration: number;
  repetition: number;
  timerId: string;
  exercises: PrismaExercise[];
}

interface PrismaTimer extends Omit<Timer, 'steps' | 'createdAt' | 'updatedAt' | 'userId'> {
  steps: PrismaStep[];
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
}

function mapToTimer(prismaTimer: PrismaTimer): Timer {
  return {
    ...prismaTimer,
    createdAt: prismaTimer.createdAt.toISOString(),
    updatedAt: prismaTimer.updatedAt.toISOString(),
    userId: prismaTimer.userId || undefined,
    steps: prismaTimer.steps.map(step => ({
      id: step.timerId,
      name: step.name,
      restDuration: step.restDuration,
      repetition: step.repetition,
      exercises: step.exercises.map(exercise => ({
        id: `${exercise.timerStepTimerId}-${exercise.timerStepName}`,
        name: exercise.name,
        duration: exercise.duration,
        restDuration: exercise.restDuration,
        repetition: exercise.repetition,
      })),
    })),
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const timers = await prisma.timer.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        steps: {
          include: {
            exercises: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const timersWithDuration = timers.map(timer => {
      const mappedTimer = mapToTimer(timer);
      const totalSeconds = calculateTimerDurationInSeconds(mappedTimer);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      return {
        ...mappedTimer,
        duration,
        totalSeconds,
        createdAt: timer.createdAt.toISOString(),
        updatedAt: timer.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(timersWithDuration);
  } catch (error) {
    console.error('Error fetching timers:', error);
    return NextResponse.json({ message: 'Failed to fetch timers' }, { status: 500 });
  }
}

// Helper function to calculate timer duration in seconds
function calculateTimerDurationInSeconds(timer: Timer): number {
  let totalSeconds = 0;

  timer.steps.forEach((step: TimerStep) => {
    for (let i = 0; i < step.repetition; i++) {
      step.exercises.forEach((exercise: TimerExercise) => {
        for (let j = 0; j < exercise.repetition; j++) {
          totalSeconds += exercise.duration;
          totalSeconds += exercise.restDuration;
        }
      });

      if (i < step.repetition - 1) {
        totalSeconds += step.restDuration;
      }
    }
  });
  return totalSeconds;
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const timerId = url.searchParams.get('id');

    if (!timerId) {
      return NextResponse.json({ message: 'Timer ID is required' }, { status: 400 });
    }

    // Verify user owns the timer
    const timer = await prisma.timer.findUnique({
      where: { id: timerId },
      select: { userId: true },
    });

    if (!timer) {
      return NextResponse.json({ message: 'Timer not found' }, { status: 404 });
    }

    if (timer.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not authorized to delete this timer' }, { status: 403 });
    }

    await prisma.timer.delete({ where: { id: timerId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timer:', error);
    return NextResponse.json({ message: 'Failed to delete timer' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse request data
    const data = await req.json();

    // Validate request data
    const validatedData = timerSchema.parse(data);

    // Create timer and related records
    const timer = await prisma.timer.create({
      data: {
        name: validatedData.name,
        userId: session.user.id,
        steps: {
          create: validatedData.steps.map(step => ({
            name: step.name,
            restDuration: step.restDuration,
            repetition: step.repetition,
            exercises: {
              create: step.exercises.map(exercise => ({
                name: exercise.name,
                duration: exercise.duration,
                restDuration: exercise.restDuration,
                repetition: exercise.repetition,
              })),
            },
          })),
        },
      },
      include: {
        steps: {
          include: {
            exercises: true,
          },
        },
      },
    });

    return NextResponse.json(timer, { status: 201 });
  } catch (error) {
    console.error('Timer creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Failed to create timer' }, { status: 500 });
  }
}
