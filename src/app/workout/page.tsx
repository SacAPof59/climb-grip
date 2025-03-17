import { WrenchIcon, ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutPage() {
  return (
    <div className="container mx-auto py-8 px-4 relative">
      <Link href="/" className="btn btn-circle btn-sm absolute left-4 top-4">
        <ArrowLeftIcon className="h-5 w-5" />
      </Link>

      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">Workouts</h1>

        <div className="card bg-base-100 shadow-lg p-6 w-full">
          <div className="flex flex-col items-center gap-4">
            <WrenchIcon className="w-16 h-16 text-primary" />
            <h2 className="text-xl font-semibold">Work in Progress</h2>
            <p className="text-base-content/70">
              We&apos;re currently building this feature to help you track and manage your climbing
              workouts. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
