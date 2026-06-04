import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { db, users } from "./db";

async function verifyPassword(password: string, hashedPassword: string) {
	return bcrypt.compare(password, hashedPassword);
}

export const authOptions: NextAuthOptions = {
	adapter: DrizzleAdapter(db),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_ID ?? "",
			clientSecret: process.env.GITHUB_SECRET ?? "",
		}),
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID ?? "",
			clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
		}),
		CredentialsProvider({
			id: "credentials",
			name: "Email and Password",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "name@example.com",
				},
				password: { label: "Password", type: "password" },
				rememberMe: { label: "Remember Me", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					return null;
				}

				const [user] = await db
					.select()
					.from(users)
					.where(eq(users.email, credentials.email));

				if (!user?.hashedPassword) {
					return null;
				}

				const isValid = await verifyPassword(
					credentials.password,
					user.hashedPassword,
				);
				if (!isValid) {
					return null;
				}

				const cookieStore = await cookies();
				cookieStore.set(
					"rememberMe",
					credentials.rememberMe === "true" ? "true" : "false",
					{
						maxAge: 30 * 24 * 60 * 60, // 30 days
						path: "/",
					},
				);

				return {
					id: String(user.id),
					email: user.email,
					name: user.name ?? undefined,
					image: user.image ?? undefined,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = String(user.id);
			}
			return token;
		},
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					id: token.id as string,
				},
			};
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
		error: "/login",
	},
};
