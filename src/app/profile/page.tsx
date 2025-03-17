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
    <div className="min-h-screen bg-base-200 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header with back and edit buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="btn btn-circle btn-ghost mr-3" aria-label="Back to main page">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Climber Profile</h1>
          </div>
          <Link
            href="/profile/edit"
            className="btn btn-circle btn-primary"
            aria-label="Edit profile"
          >
            <PenIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Profile picture */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body items-center text-center">
            <div className="avatar mb-3">
              <div className="w-24 h-24 rounded-full">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={`${session.user.name}'s profile`}
                    className="h-full w-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full">
                    <span className="text-3xl">{session.user?.name?.charAt(0) || '?'}</span>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-xl font-medium text-primary">{session.user?.name || 'Climber'}</h2>
            {user?.climber?.alias && (
              <p className="text-base-content/70 mt-1">&ldquo;{user.climber.alias}&rdquo;</p>
            )}
          </div>
        </div>

        {/* Profile information */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h3 className="card-title text-primary">Climber Information</h3>

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

                <div className="pt-4 border-t border-base-300">
                  <h4 className="text-md font-medium mb-3 text-primary">Climbing Grades</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileField
                      label="Route Grade"
                      value={user.climber.routeGrade ?? undefined}
                    />
                    <ProfileField
                      label="Boulder Grade"
                      value={user.climber.boulderGrade ?? undefined}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-base-content/70 mb-3">Your climber profile is not set up yet</p>
                <Link href="/profile/edit" className="btn btn-primary">
                  Complete Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats/recent activity section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-primary">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-200 p-3 rounded-md">
                <p className="text-sm text-base-content/70">Last Workout</p>
                <p className="text-xl font-bold">
                  {workoutStats.latestWorkout
                    ? formatDistanceToNow(new Date(workoutStats.latestWorkout.createdAt), {
                        addSuffix: true,
                      })
                    : 'No workouts yet'}
                </p>
              </div>
              <div className="bg-base-200 p-3 rounded-md">
                <p className="text-sm text-base-content/70">Workouts</p>
                <p className="text-xl font-bold">{workoutStats.totalWorkouts}</p>
              </div>
            </div>
            <Link
              href="/workouts"
              className="mt-4 text-primary hover:underline text-sm flex justify-end"
            >
              View all workouts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable profile field component
function ProfileField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-base-content/70">{label}</span>
      {value ? <span>{value}</span> : <span className="text-base-content/50 italic">Not set</span>}
    </div>
  );
}
