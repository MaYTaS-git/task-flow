import { Elysia, t } from "elysia";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db, notifications } from "@/lib/db";
import { getAuthenticatedUser } from "../auth-helper";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
	// Get all notifications for the authenticated user
	.get("/", async ({ query }) => {
		const user = await getAuthenticatedUser();

		const dbQuery = db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, user.id))
			.orderBy(desc(notifications.createdAt));

		if (query.limit) {
			const limit = parseInt(query.limit);
			const offset = query.offset ? parseInt(query.offset) : 0;
			return await dbQuery.limit(limit).offset(offset);
		}

		const list = await dbQuery;
		return list;
	}, {
		query: t.Object({
			limit: t.Optional(t.String()),
			offset: t.Optional(t.String()),
		})
	})

	// Mark a notification as read
	.post("/:id/read", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const notifId = parseInt(params.id);

		// Verify notification owner
		const [notif] = await db
			.select()
			.from(notifications)
			.where(
				and(
					eq(notifications.id, notifId),
					eq(notifications.userId, user.id)
				)
			)
			.limit(1);

		if (!notif) {
			set.status = 404;
			return { success: false, error: "Notification not found" };
		}

		await db
			.update(notifications)
			.set({ read: new Date() })
			.where(eq(notifications.id, notifId));

		return { success: true };
	})

	// Mark all notifications as read
	.post("/read-all", async () => {
		const user = await getAuthenticatedUser();

		await db
			.update(notifications)
			.set({ read: new Date() })
			.where(
				and(
					eq(notifications.userId, user.id),
					isNull(notifications.read)
				)
			);

		return { success: true };
	});
