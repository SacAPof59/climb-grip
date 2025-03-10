import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "username",
                },
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials.password) {
                    return null;
                }
                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials.username,
                    },
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    username: user.username,
                    // You can add more properties from the user here if needed
                };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt", // Use JWT strategy for sessions
        maxAge: 60 * 60 * 24, // 24 hours
    },
    events: {
        signOut: async ({token}) => {
            // Delete the session from the database
            await prisma.session.deleteMany({
                where: {
                    userId: token.sub,
                },
            });
        },
    },
    callbacks: {
        jwt: async ({token, user}) => {
            if (user) {
                token.user = {
                    id: user.id,
                    username: user.username,
                };
            }

            return token;
        },
        session: async ({session, token}) => {
            session.user = token.user as any;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};