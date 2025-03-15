import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import LoginButton from './components/LoginButton';
import { authOptions } from '@/authOptions';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 text-white">
      {/* Hero Section */}
      <div className="px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block text-blue-400">Climb</span>
            <span className="block">Grip</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl">
            Track your climbing progress, plan workouts, and reach new heights
          </p>

          {session ? (
            <div className="mt-8 flex flex-col items-center">
              <p className="text-xl font-medium">
                Welcome back, <span className="text-blue-400">{session.user?.name}</span>!
              </p>
              <Link
                href="/measurement-test"
                className="mt-4 rounded-lg bg-blue-500 px-6 py-3 font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try to measure with your device
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <p className="mb-4">Sign in to start tracking your climbing journey</p>
              <LoginButton />
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Train Smarter, Climb Harder</h2>
            <p className="mt-3 text-gray-300">
              Everything you need to reach your climbing potential
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-slate-700 p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-400">Workout Tracking</h3>
                <p className="text-gray-300">
                  Log your hangboarding, campus board, and climbing sessions
                </p>
              </div>

              <div className="rounded-lg bg-slate-700 p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-400">Progress Analytics</h3>
                <p className="text-gray-300">
                  Visualize your strength gains and climbing improvements
                </p>
              </div>

              <div className="rounded-lg bg-slate-700 p-6">
                <h3 className="mb-3 text-xl font-bold text-blue-400">Training Plans</h3>
                <p className="text-gray-300">Follow customized training programs for your goals</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center space-x-4">
            <Link
              href="/profile"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              My Profile
            </Link>
            <Link
              href="/workouts"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Workouts
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 px-4 py-6 text-center text-sm text-gray-400">
        <p>Climb-grip - Train smart, climb strong</p>
      </footer>
    </div>
  );
}
