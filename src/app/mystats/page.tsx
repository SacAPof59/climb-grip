'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, BarChart3Icon, ActivityIcon } from 'lucide-react';
import WorkoutResultCard from '@/app/components/workout/WorkoutResultCard';

interface WorkoutResult {
  workoutId: string;
  workoutName: string;
  createdAt: string;
  measurementsData: Array<{ sequence: number; data: MeasuredData[] }>;
  workoutSequences: WorkoutTypeSequence[];
  maxWeight: number;
  bodyWeight: number;
  maxIsoForce?: number;
  criticalForce?: number;
  maxForceForCF?: number;
}

export default function MyStatsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [workoutResults, setWorkoutResults] = useState<WorkoutResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 5;

  const loadWorkouts = useCallback(
    async (pageToLoad: number, append: boolean = false) => {
      if (status !== 'authenticated') return;

      try {
        const skip = (pageToLoad - 1) * ITEMS_PER_PAGE;
        const response = await fetch(`/api/workout?skip=${skip}&limit=${ITEMS_PER_PAGE}`);

        if (!response.ok) {
          throw new Error('Failed to fetch workout data');
        }

        const data = await response.json();

        if (data.workoutResults.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }

        if (append) {
          setWorkoutResults(prev => [...prev, ...data.workoutResults]);
        } else {
          setWorkoutResults(data.workoutResults);
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [status]
  );

  // Initial load
  useEffect(() => {
    if (status === 'authenticated') {
      loadWorkouts(1);
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [status, loadWorkouts]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadWorkouts(nextPage, true);
  };

  if (loading) {
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
            <p>You need to sign in to view your stats.</p>
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
          <h1 className="text-xl font-bold">My Stats</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {workoutResults.length > 0 ? (
          <div className="flex flex-col gap-6">
            {workoutResults.map(workout => (
              <div key={workout.workoutId} className="mb-6">
                <div className="text-sm text-base-content/70 mb-1">
                  {new Date(workout.createdAt).toLocaleDateString()} -
                  {new Date(workout.createdAt).toLocaleTimeString()}
                </div>
                <WorkoutResultCard
                  workoutId={workout.workoutId}
                  workoutName={workout.workoutName}
                  measurementsData={workout.measurementsData}
                  workoutSequences={workout.workoutSequences}
                  maxWeight={workout.maxWeight}
                  bodyWeight={workout.bodyWeight}
                  maxIsoForce={workout.maxIsoForce}
                  criticalForce={workout.criticalForce}
                  maxForceForCF={workout.maxForceForCF}
                />
              </div>
            ))}

            {/* Show More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button className="btn btn-primary" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading...
                    </>
                  ) : (
                    'Show More Results'
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-base-100 p-8 rounded-lg shadow-lg text-center max-w-md">
              <div className="flex justify-center">
                <BarChart3Icon className="h-16 w-16 text-primary opacity-60" />
                <ActivityIcon className="h-16 w-16 text-secondary opacity-60 ml-4" />
              </div>
              <h3 className="text-xl font-bold mt-4">No Workout Data Yet</h3>
              <p className="mt-2 text-base-content/70">
                Complete your first workout to see your performance stats here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
