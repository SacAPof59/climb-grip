// src/app/timer/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, TimerIcon } from 'lucide-react';
import TimerDescriptionCard from '../components/timer/TimerDescriptionCard';

export default function TimerPage() {
  const { data: session, status } = useSession();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      // User is not authenticated, we'll show the not authenticated UI
      setLoading(false);
      return;
    }

    // Fetch timers
    const fetchTimers = async () => {
      try {
        const response = await fetch('/api/timer');
        if (!response.ok) throw new Error('Failed to fetch timers');
        const data = await response.json();
        setTimers(data);
      } catch (error) {
        console.error('Error fetching timers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimers();
  }, [session, status]);

  const handleDeleteTimer = async (timerId: string) => {
    try {
      const response = await fetch(`/api/timer?id=${timerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete timer');

      // Update the UI by removing the deleted timer
      setTimers(prevTimers => prevTimers.filter(timer => timer.id !== timerId));
      router.refresh();
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  };

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
        {timers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timers.map(timer => (
              <TimerDescriptionCard key={timer.id} timer={timer} onDelete={handleDeleteTimer} />
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

        {timers.length > 0 && (
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
