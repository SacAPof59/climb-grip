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
