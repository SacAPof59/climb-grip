import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import LoginButton from './components/LoginButton';
import { authOptions } from '@/authOptions';
import { ClockIcon, LineChartIcon, BarChart3Icon, UserIcon } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Hero Section */}
      <div className="hero from-slate-900 to-slate-700 py-12 px-4">
        <div className="hero-content text-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block text-primary">Climb</span>
              <span className="block">Grip</span>
            </h1>
            <p className="mt-6 text-lg max-w-md mx-auto">
              Track your climbing progress, plan workouts, and reach new heights
            </p>

            {session ? (
              <div className="mt-8">
                <p className="text-xl font-medium">
                  Welcome back, <span className="text-primary">{session.user?.name}</span>!
                </p>
              </div>
            ) : (
              <div className="mt-8">
                <p className="mb-4">Sign in to start tracking your climbing journey</p>
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* App Navigation (Only shown to logged in users) */}
      {session && (
        <div className="flex-grow py-8 px-4">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Get Started</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/workout"
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300 hover:border-primary"
              >
                <div className="card-body items-center text-center">
                  <BarChart3Icon className="w-12 h-12 text-primary" />
                  <h2 className="card-title mt-3">Workouts</h2>
                  <p className="text-base-content/70">Track your climbing workouts</p>
                </div>
              </Link>
              <Link
                href="/timer"
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300 hover:border-primary"
              >
                <div className="card-body items-center text-center">
                  <ClockIcon className="w-12 h-12 text-primary" />
                  <h2 className="card-title mt-3">Timers</h2>
                  <p className="text-base-content/70">Create and use workout timers</p>
                </div>
              </Link>
              <Link
                href="/measurement-test"
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300 hover:border-primary"
              >
                <div className="card-body items-center text-center">
                  <LineChartIcon className="w-12 h-12 text-primary" />
                  <h2 className="card-title mt-3">Measure</h2>
                  <p className="text-base-content/70">Try force measurement</p>
                </div>
              </Link>

              <Link
                href="/profile"
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300 hover:border-primary"
              >
                <div className="card-body items-center text-center">
                  <UserIcon className="w-12 h-12 text-primary" />
                  <h2 className="card-title mt-3">Profile</h2>
                  <p className="text-base-content/70">Manage your climbing profile</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 px-4 py-6 text-center text-sm text-gray-400">
        <p>Climb-grip - Train smart, climb strong</p>
      </footer>
    </div>
  );
}
