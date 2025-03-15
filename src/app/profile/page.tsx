import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/authOptions';
import Link from 'next/link';
import { PenIcon, ArrowLeftIcon } from 'lucide-react';
import { getUserProfile, getWorkoutStats } from '@/lib/services/profileService';
import { formatDistanceToNow } from 'date-fns';
import { Workout } from '@prisma/client';
import Image from 'next/image';

// Define the type for workout stats
type WorkoutStats = {
  totalWorkouts: number;
  latestWorkout: Workout | null;
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/api/auth/signin');
  }

  // Fetch user profile
  const user = await getUserProfile(session.user.email);

  // Initialize with proper typing
  let workoutStats: WorkoutStats = {
    totalWorkouts: 0,
    latestWorkout: null,
  };

  if (user?.climber?.id) {
    workoutStats = await getWorkoutStats(user.climber.id);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header with back and edit buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/"
              className="mr-3 p-2 rounded-full hover:bg-slate-600 transition-colors"
              aria-label="Back to main page"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Climber Profile</h1>
          </div>
          <Link
            href="/profile/edit"
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
            aria-label="Edit profile"
          >
            <PenIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Profile picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-24 w-24 rounded-full bg-slate-600 flex items-center justify-center mb-3 overflow-hidden">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={`${session.user.name}'s profile`}
                className="h-full w-full object-cover"
                width={96}
                height={96}
              />
            ) : (
              <span className="text-3xl">{session.user?.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <h2 className="text-xl font-medium text-blue-400">{session.user?.name || 'Climber'}</h2>
          {user?.climber?.alias && (
            <p className="text-gray-300 mt-1">&ldquo;{user.climber.alias}&rdquo;</p>
          )}
        </div>

        {/* Profile information */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium text-blue-400 mb-4">Climber Information</h3>

          {user?.climber ? (
            <div className="space-y-4">
              <ProfileField label="Age" value={user.climber.age?.toString()} />
              <ProfileField label="Gender" value={user.climber.gender ?? undefined} />
              <ProfileField
                label="Height"
                value={user.climber.height ? `${user.climber.height} cm` : undefined}
              />
              <ProfileField
                label="Arm Span"
                value={user.climber.span ? `${user.climber.span} cm` : undefined}
              />

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-md font-medium mb-3 text-blue-400">Climbing Grades</h4>
                <div className="grid grid-cols-2 gap-4">
                  <ProfileField label="Route Grade" value={user.climber.routeGrade ?? undefined} />
                  <ProfileField
                    label="Boulder Grade"
                    value={user.climber.boulderGrade ?? undefined}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 mb-3">Your climber profile is not set up yet</p>
              <Link
                href="/profile/edit"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          )}
        </div>

        {/* Quick stats/recent activity section */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium text-blue-400 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 p-3 rounded-md">
              <p className="text-sm text-gray-300">Last Workout</p>
              <p className="text-xl font-bold">
                {workoutStats.latestWorkout
                  ? formatDistanceToNow(new Date(workoutStats.latestWorkout.createdAt), {
                      addSuffix: true,
                    })
                  : 'No workouts yet'}
              </p>
            </div>
            <div className="bg-slate-700 p-3 rounded-md">
              <p className="text-sm text-gray-300">Workouts</p>
              <p className="text-xl font-bold">{workoutStats.totalWorkouts}</p>
            </div>
          </div>
          <Link
            href="/workouts"
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex justify-end"
          >
            View all workouts →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Reusable profile field component
function ProfileField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-400">{label}</span>
      {value ? (
        <span className="text-white">{value}</span>
      ) : (
        <span className="text-gray-500 italic">Not set</span>
      )}
    </div>
  );
}
