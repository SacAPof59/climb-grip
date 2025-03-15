// src/app/timer/page.tsx
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../prisma';
import { authOptions } from '@/authOptions';
import { ArrowLeftIcon, PlusIcon, TimerIcon, Trash2Icon, PlayIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';

async function getTimers(userId: string) {
  return await prisma.timer.findMany({
    where: {
      userId,
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
}

export default async function TimerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center">Not Authenticated</h2>
            <p>You need to sign in to view your timers.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/" className="btn btn-primary">
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timers = await getTimers(session.user?.id || '');

  // Calculate total exercise time for each timer
  const timersWithDuration = timers.map(timer => {
    let totalSeconds = 0;

    timer.steps.forEach(step => {
      // For each repetition of the step
      for (let i = 0; i < step.repetition; i++) {
        // Add exercise durations and rest times
        step.exercises.forEach(exercise => {
          // For each repetition of the exercise
          for (let j = 0; j < exercise.repetition; j++) {
            totalSeconds += exercise.duration;
            // Add rest time if not the last repetition
            if (j < exercise.repetition - 1) {
              totalSeconds += exercise.restDuration;
            }
          }
        });

        // Add step rest time if not the last repetition
        if (i < step.repetition - 1) {
          totalSeconds += step.restDuration;
        }
      }
    });

    // Format duration as mm:ss
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
      ...timer,
      duration,
      totalSeconds,
    };
  });

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-10">
        <div className="navbar-start">
          <Link href="/" className="btn btn-circle btn-ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">My Timers</h1>
        </div>
        <div className="navbar-end">
          <Link href="/timer/create" className="btn btn-primary btn-sm">
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline ml-1">New</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Timers Grid/List */}
        {timersWithDuration.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timersWithDuration.map(timer => (
              <div
                key={timer.id}
                className="card bg-base-100 shadow-lg hover:shadow-xl border border-base-300"
              >
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <h2 className="card-title">{timer.name}</h2>
                    <div className="badge badge-primary">{timer.duration}</div>
                  </div>

                  <div className="mt-2 text-sm">
                    <p>
                      {timer.steps.length} steps •{' '}
                      {timer.steps.reduce((acc, step) => acc + step.exercises.length, 0)} exercises
                    </p>
                    <p className="text-xs text-base-content/70">
                      Created {new Date(timer.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="card-actions justify-between items-center mt-2">
                    <form
                      action={async formData => {
                        'use server';
                        const id = formData.get('id');
                        await prisma.timer.delete({ where: { id: id as string } });
                        revalidatePath('/timer');
                      }}
                    >
                      <input type="hidden" name="id" value={timer.id} />
                      <button type="submit" className="btn btn-sm btn-circle btn-error btn-outline">
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </form>

                    <Link
                      href={`/timer/${timer.id}`}
                      className="btn btn-sm btn-primary flex-1 ml-2"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Start Timer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-base-100 p-8 rounded-lg shadow-lg text-center max-w-md">
              <TimerIcon className="h-16 w-16 mx-auto text-primary opacity-60" />
              <h3 className="text-xl font-bold mt-4">No Timers Yet</h3>
              <p className="mt-2 text-base-content/70">
                Create your first timer to get started with your workout routines.
              </p>
              <Link href="/timer/create" className="btn btn-primary mt-6">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Timer
              </Link>
            </div>
          </div>
        )}

        {timersWithDuration.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <Link
              href="/timer/create"
              className="btn btn-primary shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-6 w-6" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
