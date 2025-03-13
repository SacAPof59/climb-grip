import {getServerSession} from "next-auth/next";
import {redirect} from "next/navigation";
import {authOptions} from "../api/auth/[...nextauth]/route";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin");
    }

    return (
        <div>
            <h1>Protected Profile Page</h1>
            <p>Welcome {session.user?.name}!</p>
        </div>
    );
}