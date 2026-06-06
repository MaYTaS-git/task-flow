import { Elysia, t } from "elysia";
import { eq, and, sql } from "drizzle-orm";
import { db, projects, projectMembers, organizationMembers, users, tasks } from "@/lib/db";
import { getAuthenticatedUser, checkOrgAccess, checkProjectAccess } from "../auth-helper";

export const projectRoutes = new Elysia({ prefix: "/projects" })
	// Get all projects for an organization
	.get("/", async ({ query, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(query.orgId || "");

		if (isNaN(orgId)) {
			set.status = 400;
			return { success: false, error: "Invalid organization ID" };
		}

		try {
			const orgAccess = await checkOrgAccess(user.id, orgId);
			const status = query.status;

			const totalTasksSubquery = sql<number>`(SELECT count(*) FROM ${tasks} WHERE ${tasks.projectId} = ${projects.id})`.mapWith(Number);
			const doneTasksSubquery = sql<number>`(SELECT count(*) FROM ${tasks} WHERE ${tasks.projectId} = ${projects.id} AND ${tasks.status} = 'done')`.mapWith(Number);

			if (orgAccess.role === "ADMIN" || orgAccess.role === "SUPER_ADMIN") {
				// Admins/Super Admins see all projects in the organization
				const conditions = [eq(projects.organizationId, orgId)];
				if (status) {
					conditions.push(eq(projects.status, status));
				}
				const allProjects = await db
					.select({
						id: projects.id,
						name: projects.name,
						description: projects.description,
						organizationId: projects.organizationId,
						status: projects.status,
						createdAt: projects.createdAt,
						totalTasks: totalTasksSubquery,
						doneTasks: doneTasksSubquery,
					})
					.from(projects)
					.where(and(...conditions));
				return allProjects;
			} else {
				// Members only see projects they are assigned to
				const conditions = [
					eq(projects.organizationId, orgId),
					eq(projectMembers.userId, user.id)
				];
				if (status) {
					conditions.push(eq(projects.status, status));
				}
				const assignedProjects = await db
					.select({
						id: projects.id,
						name: projects.name,
						description: projects.description,
						organizationId: projects.organizationId,
						status: projects.status,
						createdAt: projects.createdAt,
						totalTasks: totalTasksSubquery,
						doneTasks: doneTasksSubquery,
					})
					.from(projectMembers)
					.innerJoin(projects, eq(projectMembers.projectId, projects.id))
					.where(and(...conditions));
				return assignedProjects;
			}
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	}, {
		query: t.Object({
			orgId: t.String(),
			status: t.Optional(t.String()),
		}),
	})

	// Get all projects for a specific user in an organization
	.get("/user/:userId", async ({ params, query, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(query.orgId || "");
		const targetUserId = parseInt(params.userId);

		if (isNaN(orgId) || isNaN(targetUserId)) {
			set.status = 400;
			return { success: false, error: "Invalid ID(s)" };
		}

		try {
			await checkOrgAccess(user.id, orgId);

			const userProjects = await db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					status: projects.status,
					createdAt: projects.createdAt,
				})
				.from(projectMembers)
				.innerJoin(projects, eq(projectMembers.projectId, projects.id))
				.where(
					and(
						eq(projects.organizationId, orgId),
						eq(projectMembers.userId, targetUserId)
					)
				);

			return { success: true, data: userProjects };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	}, {
		query: t.Object({
			orgId: t.String(),
		}),
	})

	// Create a new project
	.post(
		"/",
		async ({ body, set }) => {
			const user = await getAuthenticatedUser();
			const orgId = body.organizationId;

			try {
				const orgAccess = await checkOrgAccess(user.id, orgId);

				// Only ADMIN or MEMBER with projects.create permission can create projects
				if (orgAccess.role !== "ADMIN" && orgAccess.role !== "SUPER_ADMIN") {
					const allowed = orgAccess.permissions?.projects?.create ?? false;
					if (!allowed) {
						set.status = 403;
						return { success: false, error: "Forbidden: Missing project creation permission" };
					}
				}

				// Insert project
				const [project] = await db
					.insert(projects)
					.values({
						name: body.name,
						description: body.description,
						organizationId: orgId,
						status: body.status || "planning",
					})
					.returning();

				// Automatically add creator to project members
				await db.insert(projectMembers).values({
					projectId: project.id,
					userId: user.id,
				});

				return { success: true, data: project };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				name: t.String(),
				description: t.Optional(t.String()),
				organizationId: t.Number(),
				status: t.Optional(t.String()),
			}),
		}
	)

	// Fetch a project details (restricted to members)
	.get("/:id", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const projectId = parseInt(params.id);

		try {
			await checkProjectAccess(user.id, projectId);

			const [project] = await db
				.select()
				.from(projects)
				.where(eq(projects.id, projectId))
				.limit(1);

			// Fetch project members
			const members = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image,
					role: organizationMembers.role,
				})
				.from(projectMembers)
				.innerJoin(users, eq(projectMembers.userId, users.id))
				.innerJoin(
					organizationMembers,
					and(
						eq(organizationMembers.userId, users.id),
						eq(organizationMembers.organizationId, project.organizationId)
					)
				)
				.where(eq(projectMembers.projectId, projectId));

			return { success: true, data: { project, members } };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Update project configuration (requires projects.edit permission or org admin)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const projectId = parseInt(params.id);

			try {
				await checkProjectAccess(user.id, projectId, "edit");

				const [updated] = await db
					.update(projects)
					.set({
						name: body.name,
						description: body.description,
						status: body.status,
					})
					.where(eq(projects.id, projectId))
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
				description: t.Optional(t.String()),
				status: t.String(),
			}),
		}
	)

	// Delete project (requires projects.delete permission or org admin)
	.delete("/:id", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const projectId = parseInt(params.id);

		try {
			await checkProjectAccess(user.id, projectId, "delete");

			await db.delete(projects).where(eq(projects.id, projectId));

			return { success: true, message: "Project deleted successfully" };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Assign a member to the project (restricted to organization ADMINs)
	.post(
		"/:id/members",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const projectId = parseInt(params.id);
			const targetUserId = body.userId;

			try {
				const projectInfo = await checkProjectAccess(user.id, projectId);

				// Must be organization Admin to assign members to projects
				if (projectInfo.role !== "ADMIN" && projectInfo.role !== "SUPER_ADMIN") {
					set.status = 403;
					return { success: false, error: "Forbidden: Admin role required to manage project team" };
				}

				// Verify target user is in the organization
				const [orgMember] = await db
					.select()
					.from(organizationMembers)
					.where(
						and(
							eq(organizationMembers.organizationId, projectInfo.orgId),
							eq(organizationMembers.userId, targetUserId)
						)
					)
					.limit(1);

				if (!orgMember) {
					set.status = 400;
					return { success: false, error: "Target user is not a member of the organization" };
				}

				// Check if already assigned
				const [existingProjectMember] = await db
					.select()
					.from(projectMembers)
					.where(
						and(
							eq(projectMembers.projectId, projectId),
							eq(projectMembers.userId, targetUserId)
						)
					)
					.limit(1);

				if (existingProjectMember) {
					set.status = 400;
					return { success: false, error: "User is already assigned to this project" };
				}

				await db.insert(projectMembers).values({
					projectId,
					userId: targetUserId,
				});

				return { success: true, message: "Member assigned to project successfully" };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				userId: t.Number(),
			}),
		}
	)

	// Remove a member from the project (restricted to organization ADMINs)
	.delete("/:id/members/:userId", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const projectId = parseInt(params.id);
		const targetUserId = parseInt(params.userId);

		try {
			const projectInfo = await checkProjectAccess(user.id, projectId);

			// Must be organization Admin to remove members
			if (projectInfo.role !== "ADMIN" && projectInfo.role !== "SUPER_ADMIN") {
				set.status = 403;
				return { success: false, error: "Forbidden: Admin role required to manage project team" };
			}

			// 1. Remove from all task assignments in this project
			const projectTasks = await db
				.select({ id: tasks.id })
				.from(tasks)
				.where(eq(tasks.projectId, projectId));
			
			if (projectTasks.length > 0) {
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

			// 2. Remove from project members
			await db
				.delete(projectMembers)
				.where(
					and(
						eq(projectMembers.projectId, projectId),
						eq(projectMembers.userId, targetUserId)
					)
				);

			return { success: true, message: "Member removed from project successfully" };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	});
