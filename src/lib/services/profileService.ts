// lib/services/profileService.ts
import { Climber, User, Workout } from '@prisma/client';
import { prisma } from '../../../prisma';

export type UserWithClimber = User & {
  climber: Climber | null;
};

export type WorkoutStats = {
  totalWorkouts: number;
  latestWorkout: Workout | null;
};

export async function getUserProfile(email: string): Promise<UserWithClimber | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { climber: true },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getRecentWorkouts(climberId: string, limit: number = 5) {
  try {
    const workouts = await prisma.workout.findMany({
      where: { climberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        workoutType: true,
      },
    });

    return workouts;
  } catch (error) {
    console.error('Error fetching recent workouts:', error);
    return [];
  }
}

export async function getWorkoutStats(climberId: string): Promise<WorkoutStats> {
  try {
    const totalWorkouts = await prisma.workout.count({
      where: { climberId },
    });

    const latestWorkout = await prisma.workout.findFirst({
      where: { climberId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalWorkouts,
      latestWorkout,
    };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return {
      totalWorkouts: 0,
      latestWorkout: null,
    };
  }
}
