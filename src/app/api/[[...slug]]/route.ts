import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, users } from "@/lib/db";

export const app = new Elysia({ prefix: "/api" })
	.get("/", () => ({ message: "API root" }))

	// registration endpoint
	.post(
		"/register",
		async ({ body }) => {
			const existing = await db
				.select()
				.from(users)
				.where(eq(users.email, body.email))
				.limit(1);

			if (existing.length > 0) {
				return new Response(
					JSON.stringify({ success: false, message: "Email is already registered." }),
					{
						status: 409,
						headers: { "content-type": "application/json" },
					},
				);
			}

			const hashedPassword = await bcrypt.hash(body.password, 10);
			const inserted = await db
				.insert(users)
				.values({
					name: body.name,
					email: body.email,
					hashedPassword,
				})
				.returning({ id: users.id, email: users.email });

			return new Response(
				JSON.stringify({
					success: true,
					data: {
						id: inserted[0].id,
						email: inserted[0].email,
					},
				}),
				{
					status: 201,
					headers: { "content-type": "application/json" },
				},
			);
		},
		{
			body: t.Object({
				name: t.String(),
				email: t.String(),
				password: t.String(),
			}),
		},
	);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
