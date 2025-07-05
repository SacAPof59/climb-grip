// app/components/ProfileRequired.tsx
import Link from 'next/link';
import { UserIcon, ArrowRightIcon } from 'lucide-react';

interface ProfileRequiredProps {
  userName?: string;
}

export default function ProfileRequired({ userName }: ProfileRequiredProps) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <UserIcon className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-2xl font-bold mb-4">Welcome to Climb Grip!</h1>

            {userName && (
              <p className="text-lg mb-4">
                Hi <span className="text-primary font-medium">{userName}</span>!
              </p>
            )}

            <p className="text-base-content/70 mb-6">
              To start using workouts and tracking your climbing progress, you'll need to set up your climber profile first.
            </p>

            <div className="space-y-4">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Your profile helps us personalize your workout experience and track your progress accurately.</span>
              </div>

              <Link
                href="/profile/edit"
                className="btn btn-primary btn-block"
              >
                Create Your Profile
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
