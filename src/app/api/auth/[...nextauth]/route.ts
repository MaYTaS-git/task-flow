import NextAuth from "next-auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

async function getAuthHandler() {
	const cookieStore = await cookies();
	const rememberMe = cookieStore.get("rememberMe")?.value === "true";
	const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

	return NextAuth({
		...authOptions,
		session: {
			...authOptions.session,
			maxAge,
		},
	});
}

export async function GET(req: NextRequest, ctx: { params: Promise<Record<string, string | string[]>> }) {
	const handler = await getAuthHandler();
	return handler(req, ctx as unknown as never);
}

export async function POST(req: NextRequest, ctx: { params: Promise<Record<string, string | string[]>> }) {
	const handler = await getAuthHandler();
	return handler(req, ctx as unknown as never);
}
