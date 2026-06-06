import { Elysia, t } from "elysia";
import { eq, and, isNull } from "drizzle-orm";
import {
	db,
	tasks,
	taskAssignees,
	taskWorkSessions,
	users,
} from "@/lib/db";
import { getAuthenticatedUser, checkProjectAccess, checkTaskAccess } from "../auth-helper";
import { sendRealtimeNotification } from "@/lib/ws";

export const taskRoutes = new Elysia({ prefix: "/tasks" })
	// Fetch all tasks for a project
	.get("/", async ({ query, set }) => {
		const user = await getAuthenticatedUser();
		const projectId = parseInt(query.projectId || "");

		if (isNaN(projectId)) {
			set.status = 400;
			return { success: false, error: "Invalid project ID" };
		}

		try {
			await checkProjectAccess(user.id, projectId);

			// Build query conditions
			const conditions = [eq(tasks.projectId, projectId)];
			if (query.status) {
				conditions.push(eq(tasks.status, query.status));
			}
			if (query.priority) {
				conditions.push(eq(tasks.priority, query.priority));
			}

			let taskRows;
			if (query.assigneeId) {
				const assigneeId = parseInt(query.assigneeId);
				taskRows = await db
					.select({
						id: tasks.id,
						title: tasks.title,
						description: tasks.description,
						projectId: tasks.projectId,
						status: tasks.status,
						priority: tasks.priority,
						dueDate: tasks.dueDate,
						createdAt: tasks.createdAt,
					})
					.from(tasks)
					.innerJoin(taskAssignees, eq(tasks.id, taskAssignees.taskId))
					.where(and(...conditions, eq(taskAssignees.userId, assigneeId)));
			} else {
				taskRows = await db
					.select()
					.from(tasks)
					.where(and(...conditions));
			}

			// Fetch assignees for each task
			const tasksWithAssignees = await Promise.all(
				taskRows.map(async (task) => {
					const assignees = await db
						.select({
							id: users.id,
							name: users.name,
							email: users.email,
							image: users.image,
						})
						.from(taskAssignees)
						.innerJoin(users, eq(taskAssignees.userId, users.id))
						.innerJoin(
							projectMembers,
							and(
								eq(projectMembers.userId, users.id),
								eq(projectMembers.projectId, task.projectId)
							)
						)
						.where(eq(taskAssignees.taskId, task.id));

					return {
						...task,
						assignees,
					};
				})
			);

			return tasksWithAssignees;
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	}, {
		query: t.Object({
			projectId: t.String(),
			status: t.Optional(t.String()),
			priority: t.Optional(t.String()),
			assigneeId: t.Optional(t.String()),
		}),
	})

	// Get current active timer across any task for the authenticated user
	.get("/timer/current", async () => {
		const user = await getAuthenticatedUser();

		const [activeSession] = await db
			.select({
				id: taskWorkSessions.id,
				taskId: taskWorkSessions.taskId,
				startTime: taskWorkSessions.startTime,
				description: taskWorkSessions.description,
				taskTitle: tasks.title,
				projectId: tasks.projectId,
			})
			.from(taskWorkSessions)
			.innerJoin(tasks, eq(taskWorkSessions.taskId, tasks.id))
			.where(
				and(
					eq(taskWorkSessions.userId, user.id),
					isNull(taskWorkSessions.endTime)
				)
			)
			.limit(1);

		return { success: true, data: activeSession || null };
	})

	// Fetch task details
	.get("/:id", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const taskId = parseInt(params.id);

		try {
			const { task } = await checkTaskAccess(user.id, taskId);

			const assignees = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image,
				})
				.from(taskAssignees)
				.innerJoin(users, eq(taskAssignees.userId, users.id))
				.innerJoin(
					projectMembers,
					and(
						eq(projectMembers.userId, users.id),
						eq(projectMembers.projectId, task.projectId)
					)
				)
				.where(eq(taskAssignees.taskId, taskId));

			// Fetch work sessions logs for this task
			const sessions = await db
				.select({
					id: taskWorkSessions.id,
					userId: taskWorkSessions.userId,
					userName: users.name,
					startTime: taskWorkSessions.startTime,
					endTime: taskWorkSessions.endTime,
					duration: taskWorkSessions.duration,
					description: taskWorkSessions.description,
				})
				.from(taskWorkSessions)
				.innerJoin(users, eq(taskWorkSessions.userId, users.id))
				.where(eq(taskWorkSessions.taskId, taskId));

			return { success: true, data: { ...task, assignees, sessions } };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Create a new task
	.post(
		"/",
		async ({ body, set }) => {
			const user = await getAuthenticatedUser();
			const projectId = body.projectId;

			try {
				await checkProjectAccess(user.id, projectId, "create");

				// Create task record
				const [task] = await db
					.insert(tasks)
					.values({
						title: body.title,
						description: body.description,
						projectId,
						status: body.status,
						priority: body.priority,
						dueDate: body.dueDate ? new Date(body.dueDate) : null,
						estimatedMinutes: body.estimatedMinutes,
					})
					.returning();

				// Add assignees
				if (body.assignees && body.assignees.length > 0) {
					const assigneeValues = body.assignees.map((uid) => ({
						taskId: task.id,
						userId: uid,
					}));
					await db.insert(taskAssignees).values(assigneeValues);

					// Send notifications to assignees
					for (const uid of body.assignees) {
						if (uid !== user.id) {
							await sendRealtimeNotification(
								uid,
								"New Task Assigned",
								`You have been assigned to: "${task.title}"`,
								"task_assigned"
							);
						}
					}
				}

				return { success: true, data: task };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				title: t.String(),
				description: t.Optional(t.String()),
				projectId: t.Number(),
				status: t.Optional(t.String()),
				priority: t.Optional(t.String()),
				dueDate: t.Optional(t.String()),
				assignees: t.Optional(t.Array(t.Number())),
				estimatedMinutes: t.Optional(t.Number()),
			}),
		}
	)

	// Update task attributes (restricted to project editors)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const taskId = parseInt(params.id);

			try {
				const { task } = await checkTaskAccess(user.id, taskId, "edit");

				const statusChanged = body.status && body.status !== task.status;

				// Update task parameters
				const [updatedTask] = await db
					.update(tasks)
					.set({
						title: body.title,
						description: body.description,
						status: body.status,
						priority: body.priority,
						dueDate: body.dueDate ? new Date(body.dueDate) : null,
						estimatedMinutes: body.estimatedMinutes,
					})
					.where(eq(tasks.id, taskId))
					.returning();

				// Sync assignees if provided
				if (body.assignees) {
					await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
					if (body.assignees.length > 0) {
						const assigneeValues = body.assignees.map((uid) => ({
							taskId,
							userId: uid,
						}));
						await db.insert(taskAssignees).values(assigneeValues);
					}
				}

				// If status changed, fetch current assignees and notify them
				if (statusChanged) {
					const activeAssignees = await db
						.select({ userId: taskAssignees.userId })
						.from(taskAssignees)
						.where(eq(taskAssignees.taskId, taskId));

					for (const assignee of activeAssignees) {
						if (assignee.userId !== user.id) {
							await sendRealtimeNotification(
								assignee.userId,
								"Task Status Updated",
								`"${task.title}" status changed to ${body.status} by ${user.name}`,
								"status_changed"
							);
						}
					}
				}

				return { success: true, data: updatedTask };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				title: t.String(),
				description: t.Optional(t.String()),
				status: t.String(),
				priority: t.Optional(t.String()),
				dueDate: t.Optional(t.String()),
				assignees: t.Optional(t.Array(t.Number())),
				estimatedMinutes: t.Optional(t.Number()),
			}),
		}
	)

	// Delete task (restricted to project editors)
	.delete("/:id", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const taskId = parseInt(params.id);

		try {
			await checkTaskAccess(user.id, taskId, "delete");

			await db.delete(tasks).where(eq(tasks.id, taskId));

			return { success: true, message: "Task deleted successfully" };
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Start work timer for a task
	.post(
		"/:id/timer/start",
		async ({ params, body, set }) => {
			const user = await getAuthenticatedUser();
			const taskId = parseInt(params.id);

			try {
				const projectAccess = await checkProjectAccess(user.id, (await db.select({ projectId: tasks.projectId }).from(tasks).where(eq(tasks.id, taskId)).limit(1))[0].projectId);

				// Only allowed if user is Admin or has session.start_stop permission
				if (projectAccess.role !== "ADMIN" && projectAccess.role !== "SUPER_ADMIN") {
					const allowed = projectAccess.permissions?.sessions?.start_stop ?? true; // defaults to true
					if (!allowed) {
						set.status = 403;
						return { success: false, error: "Forbidden: Missing time tracking permissions" };
					}
				}

				// Auto-close any active timers for this user
				const activeSessions = await db
					.select()
					.from(taskWorkSessions)
					.where(
						and(
							eq(taskWorkSessions.userId, user.id),
							isNull(taskWorkSessions.endTime)
						)
					);

				const now = new Date();

				for (const session of activeSessions) {
					const duration = Math.max(0, Math.floor((now.getTime() - session.startTime.getTime()) / 1000));
					await db
						.update(taskWorkSessions)
						.set({
							endTime: now,
							duration,
						})
						.where(eq(taskWorkSessions.id, session.id));
				}

				// Start new timer session
				const [newSession] = await db
					.insert(taskWorkSessions)
					.values({
						taskId,
						userId: user.id,
						startTime: now,
						description: body.description,
					})
					.returning();

				return { success: true, data: newSession };
			} catch (err) {
				set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
				return { success: false, error: (err as Error).message };
			}
		},
		{
			body: t.Object({
				description: t.Optional(t.String()),
			}),
		}
	)

	// Stop active work timer for a task
	.post("/:id/timer/stop", async ({ params, set }) => {
		const user = await getAuthenticatedUser();
		const taskId = parseInt(params.id);

		try {
			// Find active timer session
			const [active] = await db
				.select()
				.from(taskWorkSessions)
				.where(
					and(
						eq(taskWorkSessions.taskId, taskId),
						eq(taskWorkSessions.userId, user.id),
						isNull(taskWorkSessions.endTime)
					)
				)
				.limit(1);

			if (!active) {
				set.status = 400;
				return { success: false, error: "No active timer session running for this task" };
			}

			const now = new Date();
			const duration = Math.max(0, Math.floor((now.getTime() - active.startTime.getTime()) / 1000));

			const [stopped] = await db
				.update(taskWorkSessions)
				.set({
					endTime: now,
					duration,
				})
				.where(eq(taskWorkSessions.id, active.id))
				.returning();

			return { success: true, data: stopped };
		} catch (err) {
			set.status = 400;
			return { success: false, error: (err as Error).message };
		}
	})

	// Fetch active timer for this task
	.get("/:id/timer/active", async ({ params }) => {
		const user = await getAuthenticatedUser();
		const taskId = parseInt(params.id);

		const [active] = await db
			.select()
			.from(taskWorkSessions)
			.where(
				and(
					eq(taskWorkSessions.taskId, taskId),
					eq(taskWorkSessions.userId, user.id),
					isNull(taskWorkSessions.endTime)
				)
			)
			.limit(1);

		return { success: true, data: active || null };
	});
