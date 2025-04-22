// src/app/workout/page.tsx
'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, DumbbellIcon } from 'lucide-react';
import WorkoutDescriptionCard from '../components/workout/WorkoutDescriptionCard';

export default function WorkoutPage() {
  const { data: session, status } = useSession();
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      // User is not authenticated, we'll show the not authenticated UI
      setLoading(false);
      return;
    }

    // Fetch workout types
    const fetchWorkoutTypes = async () => {
      try {
        const response = await fetch('/api/workout_type');
        if (!response.ok) throw new Error('Failed to fetch workout types');
        const data = await response.json();
        setWorkoutTypes(data);
      } catch (error) {
        console.error('Error fetching workout types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutTypes();
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center">Not Authenticated</h2>
            <p>You need to sign in to view your workout templates.</p>
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
          <h1 className="text-xl font-bold">Workouts</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Workout Types Grid/List */}
        {workoutTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutTypes.map(workoutType => (
              <WorkoutDescriptionCard key={workoutType.name} workoutType={workoutType} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-base-100 p-8 rounded-lg shadow-lg text-center max-w-md">
              <DumbbellIcon className="h-16 w-16 mx-auto text-primary opacity-60" />
              <h3 className="text-xl font-bold mt-4">No Workout Templates Available</h3>
              <p className="mt-2 text-base-content/70">
                There are currently no workout templates in the system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
