import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import {
	db,
	users,
	organizations,
	organizationMembers,
	projectMembers,
	taskAssignees,
	taskWorkSessions,
	notifications,
	accounts,
	sessions,
} from "@/lib/db";
import { getAuthenticatedUser } from "../auth-helper";

export const userRoutes = new Elysia({ prefix: "/users" })
	// Update user profile details
	.put("/profile", async ({ body }) => {
		const user = await getAuthenticatedUser();

		await db
			.update(users)
			.set({
				name: body.name,
				image: body.image || null,
			})
			.where(eq(users.id, user.id));

		return {
			success: true,
			message: "Profile updated successfully.",
		};
	}, {
		body: t.Object({
			name: t.String({ minLength: 1 }),
			image: t.Optional(t.String()),
		})
	})
	// Permanently delete user account (only allowed if they own zero organizations)
	.delete("/delete-account", async ({ set }) => {
		const user = await getAuthenticatedUser();

		// Check if user is the creator/owner of any organizations
		const ownedOrgs = await db
			.select()
			.from(organizations)
			.where(eq(organizations.createdById, user.id));

		if (ownedOrgs.length > 0) {
			set.status = 400;
			return {
				success: false,
				error: "Please delete all of your organizations first before permanently deleting your account.",
			};
		}

		// Cascade delete all references to this user
		await db.delete(accounts).where(eq(accounts.userId, user.id));
		await db.delete(sessions).where(eq(sessions.userId, user.id));
		await db.delete(projectMembers).where(eq(projectMembers.userId, user.id));
		await db.delete(organizationMembers).where(eq(organizationMembers.userId, user.id));
		await db.delete(taskAssignees).where(eq(taskAssignees.userId, user.id));
		await db.delete(taskWorkSessions).where(eq(taskWorkSessions.userId, user.id));
		await db.delete(notifications).where(eq(notifications.userId, user.id));
		
		// Delete the user record itself
		await db.delete(users).where(eq(users.id, user.id));

		return {
			success: true,
			message: "Your account and all associated records have been permanently deleted.",
		};
	});
