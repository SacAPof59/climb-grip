// src/app/timer/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import RunningTimerComponent from '@/app/components/timer/RunningTimerComponent';

export default function TimerRunPage() {
  const params = useParams();
  const [timer, setTimer] = useState<Timer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Fetch timer data
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const res = await fetch(`/api/timer/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to load timer');
        }
        const data = await res.json();
        setTimer(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimer();
  }, [params.id]);

  const handleTimerComplete = () => {
    setCompleted(true);
  };

  const handleRestart = () => {
    setCompleted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading timer...</p>
        </div>
      </div>
    );
  }

  if (error || !timer) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-error">Error</h2>
            <p>{error || 'Timer not found'}</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/timer" className="btn btn-primary">
                Back to Timers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Header */}
      <div className="bg-base-100 shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Link href="/timer" className="btn btn-circle btn-ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">{timer.name}</h1>
        </div>
      </div>

      {/* Timer content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col items-center justify-center">
        {completed ? (
          <div className="card bg-base-100 shadow-xl w-full max-w-md">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-success text-2xl mb-4">
                Workout Complete!
              </h2>
              <div className="text-6xl font-bold mb-6">🎉</div>
              <p className="mb-6">Great job completing your {timer.name} workout!</p>
              <div className="card-actions justify-center">
                <Link href="/timer" className="btn btn-primary">
                  Back to Timers
                </Link>
                <button onClick={handleRestart} className="btn btn-outline">
                  Start Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <RunningTimerComponent timer={timer} onComplete={handleTimerComplete} />
        )}
      </div>
    </div>
  );
}
