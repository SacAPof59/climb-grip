'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, BarChart3Icon, LineChartIcon, ActivityIcon } from 'lucide-react';

export default function MyStatsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

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
            <ArrowLeftIcon className="h-5 w-5"/>
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">My Stats</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-base-100 p-8 rounded-lg shadow-lg text-center max-w-md">
            <div className="flex justify-center">
              <BarChart3Icon className="h-16 w-16 text-primary opacity-60"/>
              <ActivityIcon className="h-16 w-16 text-secondary opacity-60 ml-4"/>
            </div>
            <h3 className="text-xl font-bold mt-4">Stats Coming Soon</h3>
            <p className="mt-2 text-base-content/70">
              We're currently working on bringing you detailed climbing performance statistics and insights.
            </p>

            <div className="divider"></div>

            <h4 className="font-medium">Coming Features:</h4>
            <ul className="mt-3 text-left space-y-2">
              <li className="flex items-center">
                <div className="badge badge-primary mr-2">1</div>
                Force measurement statistics
              </li>
              <li className="flex items-center">
                <div className="badge badge-primary mr-2">2</div>
                Workout completion tracking
              </li>
              <li className="flex items-center">
                <div className="badge badge-primary mr-2">3</div>
                Progress visualization
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}