import {getServerSession} from 'next-auth/next';
import {authOptions} from './api/auth/[...nextauth]/route';
import Link from 'next/link';
import LoginButton from './components/LoginButton';

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
                    Welcome to My Next.js App
                </h1>

                <div className="mb-8 text-center">
                    {session ? (
                        <div className="space-y-2">
                            <p className="text-xl font-medium">
                                Hello, <span className="text-blue-600">{session.user?.name}</span>!
                            </p>
                            <p className="text-gray-600">You&apos;re signed in with {session.user?.email}</p>
                        </div>
                    ) : (
                        <p className="text-gray-600">
                            Please sign in to access all features of the application
                        </p>
                    )}
                </div>

                <div className="mb-8 flex justify-center">
                    <LoginButton/>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Link
                        href="/profile"
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        View Profile
                    </Link>
                    <Link
                        href="/measurement-test"
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Test measurement
                    </Link>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                    <p>Secured with NextAuth.js, Prisma, and Google Authentication</p>
                </div>
            </div>
        </div>
    );
}
