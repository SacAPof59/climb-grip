import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/authOptions';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { prisma } from '../../../../prisma';
import ProfileForm from '@/app/components/ProfileForm';

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  // Fetch user and climber data
  const user = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { climber: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link
            href="/profile"
            className="mr-3 p-2 rounded-full hover:bg-slate-600 transition-colors"
            aria-label="Back to profile"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Profile form */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
