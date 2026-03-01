import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.passwordHash) {
                    throw new Error("User not found");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    stripeCustomerId: user.stripeCustomerId,
                    subscriptionStatus: user.subscriptionStatus
                };
            }
        })
    ],
    pages: {
        signIn: "/sign-in",
        newUser: "/sign-up"
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.subscriptionStatus = (user as any).subscriptionStatus;
                token.stripeCustomerId = (user as any).stripeCustomerId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).subscriptionStatus = token.subscriptionStatus;
                (session.user as any).stripeCustomerId = token.stripeCustomerId;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
