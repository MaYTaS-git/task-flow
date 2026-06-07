import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, users } from "@/lib/db";
import { orgRoutes } from "@/lib/api/routes/org";
import { projectRoutes } from "@/lib/api/routes/projects";
import { taskRoutes } from "@/lib/api/routes/tasks";
import { notificationRoutes } from "@/lib/api/routes/notifications";
import { analyticsRoutes } from "@/lib/api/routes/analytics";
import { userRoutes } from "@/lib/api/routes/users";
import { cronRoutes } from "@/lib/api/routes/cron";
import { sql as drizzleSql } from "drizzle-orm";

export const app = new Elysia({ prefix: "/api" })
	.get("/", () => ({ message: "API root" }))

	// Registration endpoint
	.post(
		"/register",
		async ({ body, set }) => {
			const existing = await db
				.select()
				.from(users)
				.where(eq(users.email, body.email))
				.limit(1);

			if (existing.length > 0) {
				set.status = 409;
				return {
					success: false,
					message: "Email is already registered.",
				};
			}

			const hashedPassword = await bcrypt.hash(body.password, 12);

			// First user in system is SUPER_ADMIN, others are ADMIN
			const [userCountRow] = await db
				.select({ count: drizzleSql`count(${users.id})::int` })
				.from(users)
				.catch(() => [{ count: 0 }]);
			const isFirstUser = (userCountRow?.count || 0) === 0;

			const inserted = await db
				.insert(users)
				.values({
					name: body.name,
					email: body.email.toLowerCase(),
					hashedPassword,
					role: isFirstUser ? "SUPER_ADMIN" : "ADMIN",
				})
				.returning({
					id: users.id,
					email: users.email,
					role: users.role,
				});

			set.status = 201;
			return {
				success: true,
				data: {
					id: inserted[0].id,
					email: inserted[0].email,
					role: inserted[0].role,
				},
			};
		},
		{
			body: t.Object({
				name: t.String(),
				email: t.String(),
				password: t.String(),
			}),
		},
	)

	// Mount modular controllers
	.use(orgRoutes)
	.use(projectRoutes)
	.use(taskRoutes)
	.use(notificationRoutes)
	.use(analyticsRoutes)
	.use(userRoutes)
	.use(cronRoutes);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
