import Link from "next/link";
import {AuthProvider} from "@/components/AuthProvider";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {redirect} from "next/navigation";

async function signOut() {
    "use server";
    //This will use the built-in signout route of next-auth to signout the user
    //No need to use next-auth/react here
    await fetch(`${process.env.NEXTAUTH_URL}/api/auth/signout`, {
        method: "POST",
    });
    redirect("/");
}

export default async function Home() {
    const session = await getServerSession(authOptions);

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <AuthProvider>
                    {session ? (
                        <>
                            <p>Signed in as {session.user.username}</p>
                            <form action={signOut}>
                                <button type="submit">Sign out</button>
                            </form>
                        </>
                    ) : (
                        <>
                            <p>Not signed in</p>
                            <Link href="/signin">Go to sign in</Link>
                            <Link href="/create-account">Create an account</Link>
                        </>
                    )}
                </AuthProvider>
            </main>
        </div>
    );
}