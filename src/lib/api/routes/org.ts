import { Elysia, t } from "elysia";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, organizations, organizationMembers, users, projects, projectMembers, tasks, taskAssignees } from "@/lib/db";
import { getAuthenticatedUser, checkOrgAccess } from "../auth-helper";
import { sendRealtimeNotification } from "@/lib/ws";

export const orgRoutes = new Elysia({ prefix: "/org" })
	// Get all organizations the current user belongs to
	.get("/", async () => {
		const user = await getAuthenticatedUser();

		// If global SUPER_ADMIN, return all organizations
		if (user.role === "SUPER_ADMIN") {
			return await db.select().from(organizations);
		}

		// Otherwise, get organizations where user is a member
		const members = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				role: organizationMembers.role,
				createdAt: organizations.createdAt,
			})
			.from(organizationMembers)
			.innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
			.where(eq(organizationMembers.userId, user.id));

		return members;
	})

	// Get a dropdown list of organizations (id and name only) for switching
	.get("/dropdown", async () => {
		const user = await getAuthenticatedUser();

		if (user.role === "SUPER_ADMIN") {
			const orgs = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);
			return orgs.map(o => ({ 
				...o, 
				role: "SUPER_ADMIN",
				permissions: JSON.stringify({
					projects: { view: true, create: true, edit: true, delete: true },
					tasks: { view: true, create: true, edit: true, delete: true },
				})
			}));
		}

		const members = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				role: organizationMembers.role,
				permissions: organizationMembers.permissions,
			})
			.from(organizationMembers)
			.innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
			.where(eq(organizationMembers.userId, user.id));

		return members;
	})

	// Create a new organization (restricted to ADMIN/SUPER_ADMIN users)
	.post(
		"/",
		async ({ body, set }) => {
			const user = await getAuthenticatedUser();

			if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
				set.status = 403;
				return { success: false, error: "Forbidden: Only admins can create organizations" };
			}

			if (user.role !== "SUPER_ADMIN") {
				const userOrgs = await db
					.select()
					.from(organizations)
					.where(eq(organizations.createdById, user.id));
				if (userOrgs.length >= 3) {
					set.status = 400;
					return {
						success: false,
						error: "Limit reached: You can create a maximum of 3 organizations",
						message: "Limit reached: You can create a maximum of 3 organizations",
					};
				}
			}

			// Create organization
			const [org] = await db
				.insert(organizations)
				.values({
					name: body.name,
					createdById: user.id,
				})
				.returning();

			// Add creator as organization ADMIN member
			await db.insert(organizationMembers).values({
				organizationId: org.id,
				userId: user.id,
				role: "ADMIN",
				permissions: JSON.stringify({
					projects: { view: true, create: true, edit: true, delete: true },
					tasks: { view: true, create: true, edit: true, delete: true },
				}),
			});

			return { success: true, data: org };
		},
		{
			body: t.Object({
				name: t.String(),
			}),
		}
	)

	// Fetch organization info (restricted to members)
	.get("/:id", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(params.id);

		try {
			const memberInfo = await checkOrgAccess(user.id, orgId);
			const [org] = await db
				.select()
				.from(organizations)
				.where(eq(organizations.id, orgId))
				.limit(1);

			// Fetch members list
			const memberRows = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image,
					role: organizationMembers.role,
					permissions: organizationMembers.permissions,
				})
				.from(organizationMembers)
				.innerJoin(users, eq(organizationMembers.userId, users.id))
				.where(eq(organizationMembers.organizationId, orgId));

			return {
				success: true,
				data: {
					org,
					userRole: memberInfo.role,
					userPermissions: memberInfo.permissions,
					members: memberRows.map(m => ({
						...m,
						permissions: m.permissions ? JSON.parse(m.permissions) : null,
					})),
				},
			};
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Update organization info (restricted to organization ADMINs)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const orgId = parseInt(params.id);

			try {
				await checkOrgAccess(user.id, orgId, "ADMIN");

				const [updated] = await db
					.update(organizations)
					.set({ name: body.name })
					.where(eq(organizations.id, orgId))
					.returning();

				return { success: true, data: updated };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				name: t.String(),
			}),
		}
	)

	// Delete organization (restricted to organization ADMINs)
	.delete("/:id", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(params.id);

		try {
			await checkOrgAccess(user.id, orgId, "ADMIN");

			await db.delete(organizations).where(eq(organizations.id, orgId));

			return { success: true, message: "Organization deleted successfully" };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Add a member to organization (restricted to organization ADMINs)
	.post(
		"/:id/members",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const orgId = parseInt(params.id);

			try {
				await checkOrgAccess(user.id, orgId, "ADMIN");

				if (user.role !== "SUPER_ADMIN") {
					const existingMembers = await db
						.select()
						.from(organizationMembers)
						.where(eq(organizationMembers.organizationId, orgId));
					if (existingMembers.length >= 5) {
						set.status = 400;
						return {
							success: false,
							error: "Limit reached: An organization can have up to 5 members",
							message: "Limit reached: An organization can have up to 5 members",
						};
					}
				}

				// Check if user already exists
				let [existingUser] = await db
					.select()
					.from(users)
					.where(eq(users.email, body.email))
					.limit(1);

				if (!existingUser) {
					// Create new credential member account
					const defaultPassword = body.password || "Member@123";
					const hashedPassword = await bcrypt.hash(defaultPassword, 12);
					
					const [newUser] = await db
						.insert(users)
						.values({
							name: body.name,
							email: body.email.toLowerCase(),
							hashedPassword,
							role: "MEMBER",
						})
						.returning();
					existingUser = newUser;
				} else if (existingUser.role === "MEMBER") {
					const userOrgs = await db
						.select()
						.from(organizationMembers)
						.where(eq(organizationMembers.userId, existingUser.id))
						.limit(1);

					if (userOrgs.length > 0) {
						set.status = 400;
						return { success: false, error: "A member can only belong to one organization at a time." };
					}
				}

				// Check if already member of organization
				const [existingMember] = await db
					.select()
					.from(organizationMembers)
					.where(
						and(
							eq(organizationMembers.organizationId, orgId),
							eq(organizationMembers.userId, existingUser.id)
						)
					)
					.limit(1);

				if (existingMember) {
					set.status = 400;
					return { success: false, error: "User is already a member of this organization" };
				}

				// Default member permissions
				const defaultPermissions = body.permissions || {
					projects: { view: true, create: false, edit: false, delete: false },
					tasks: { view: true, create: true, edit: true, delete: false },
				};

				await db.insert(organizationMembers).values({
					organizationId: orgId,
					userId: existingUser.id,
					role: "MEMBER",
					permissions: JSON.stringify(defaultPermissions),
				});

				return { success: true, message: "Member added successfully", userId: existingUser.id };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				email: t.String(),
				name: t.String(),
				password: t.Optional(t.String()),
				permissions: t.Optional(t.Any()),
			}),
		}
	)

	// Update member details and permissions (restricted to organization ADMINs)
	.put(
		"/:id/members/:userId",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const orgId = parseInt(params.id);
			const targetUserId = parseInt(params.userId);

			try {
				await checkOrgAccess(user.id, orgId, "ADMIN");

				if (body.permissions !== undefined) {
					await db
						.update(organizationMembers)
						.set({
							permissions: JSON.stringify(body.permissions),
						})
						.where(
							and(
								eq(organizationMembers.organizationId, orgId),
								eq(organizationMembers.userId, targetUserId)
							)
						);

					// Trigger permissions_updated WS event to the target user
					await sendRealtimeNotification(
						targetUserId,
						"Permissions Updated",
						"Your organization permissions have been updated in real-time.",
						"permissions_updated"
					);
				}

				const userUpdate: { name?: string; hashedPassword?: string } = {};
				if (body.name !== undefined) {
					userUpdate.name = body.name;
				}
				if (body.password) {
					userUpdate.hashedPassword = await bcrypt.hash(body.password, 12);
				}

				if (Object.keys(userUpdate).length > 0) {
					await db
						.update(users)
						.set(userUpdate)
						.where(eq(users.id, targetUserId));
				}

				return { success: true, message: "Member updated successfully" };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				permissions: t.Optional(t.Any()),
				name: t.Optional(t.String()),
				password: t.Optional(t.String()),
			}),
		}
	)

	// Remove member from organization (restricted to organization ADMINs)
	.delete("/:id/members/:userId", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(params.id);
		const targetUserId = parseInt(params.userId);

		try {
			await checkOrgAccess(user.id, orgId, "ADMIN");

			if (user.id === targetUserId) {
				set.status = 400;
				return { success: false, error: "Cannot remove yourself from the organization" };
			}

			// 1. Find all projects in this organization
			const orgProjects = await db
				.select({ id: projects.id })
				.from(projects)
				.where(eq(projects.organizationId, orgId));
			
			// 2. Clean up project-related data for this user
			for (const project of orgProjects) {
				// Remove from project members
				await db
					.delete(projectMembers)
					.where(
						and(
							eq(projectMembers.projectId, project.id),
							eq(projectMembers.userId, targetUserId)
						)
					);
				
				// Remove from task assignments in this project
				const projectTasks = await db
					.select({ id: tasks.id })
					.from(tasks)
					.where(eq(tasks.projectId, project.id));
				
				for (const task of projectTasks) {
					await db
						.delete(taskAssignees)
						.where(
							and(
								eq(taskAssignees.taskId, task.id),
								eq(taskAssignees.userId, targetUserId)
							)
						);
				}
			}

			// 3. Remove from organization members
			await db
				.delete(organizationMembers)
				.where(
					and(
						eq(organizationMembers.organizationId, orgId),
						eq(organizationMembers.userId, targetUserId)
					)
				);

			return { success: true, message: "Member removed successfully" };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	});
