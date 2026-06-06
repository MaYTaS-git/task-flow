import { Elysia, t } from "elysia";
import { eq, and, sql as drizzleSql } from "drizzle-orm";
import {
	db,
	projects,
	tasks,
	taskWorkSessions,
	organizationMembers,
	users,
} from "@/lib/db";
import { getAuthenticatedUser, checkOrgAccess } from "../auth-helper";

export const analyticsRoutes = new Elysia({ prefix: "/analytics" })
	// Dashboard stats overview (low level)
	.get("/dashboard", async ({ query, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(query.orgId || "");

		if (isNaN(orgId)) {
			set.status = 400;
			return { success: false, error: "Invalid organization ID" };
		}

		try {
			await checkOrgAccess(user.id, orgId);

			// 1. Projects Count
			const [projectsCountRow] = await db
				.select({ count: drizzleSql<number>`count(${projects.id})::int` })
				.from(projects)
				.where(eq(projects.organizationId, orgId));

			// 2. Tasks Count by status in this organization's projects
			const orgProjects = await db
				.select({ id: projects.id })
				.from(projects)
				.where(eq(projects.organizationId, orgId));
			
			const projectIds = orgProjects.map((p) => p.id);

			let todo = 0, in_progress = 0, in_review = 0, done = 0;

			if (projectIds.length > 0) {
				const taskStatusCounts = await db
					.select({
						status: tasks.status,
						count: drizzleSql<number>`count(${tasks.id})::int`,
					})
					.from(tasks)
					.where(drizzleSql`${tasks.projectId} IN ${projectIds}`)
					.groupBy(tasks.status);

				for (const row of taskStatusCounts) {
					if (row.status === "todo") todo = row.count;
					if (row.status === "in_progress") in_progress = row.count;
					if (row.status === "in_review") in_review = row.count;
					if (row.status === "done") done = row.count;
				}
			}

			// 3. Active Members Count
			const [membersCountRow] = await db
				.select({ count: drizzleSql<number>`count(${organizationMembers.id})::int` })
				.from(organizationMembers)
				.where(eq(organizationMembers.organizationId, orgId));

			// 4. Time tracked today (in seconds)
			const startOfToday = new Date();
			startOfToday.setHours(0, 0, 0, 0);

			let timeTrackedToday = 0;
			if (projectIds.length > 0) {
				const [timeRow] = await db
					.select({
						sum: drizzleSql<number>`sum(${taskWorkSessions.duration})::int`,
					})
					.from(taskWorkSessions)
					.innerJoin(tasks, eq(taskWorkSessions.taskId, tasks.id))
					.where(
						and(
							drizzleSql`${tasks.projectId} IN ${projectIds}`,
							drizzleSql`${taskWorkSessions.startTime} >= ${startOfToday}`
						)
					);
				timeTrackedToday = timeRow?.sum || 0;
			}

			return {
				success: true,
				data: {
					projectsCount: projectsCountRow?.count || 0,
					tasksCount: {
						todo,
						inProgress: in_progress,
						inReview: in_review,
						done,
						total: todo + in_progress + in_review + done,
					},
					membersCount: membersCountRow?.count || 0,
					timeTrackedToday,
				},
			};
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	}, {
		query: t.Object({
			orgId: t.String(),
		}),
	})

	// Detailed analytics charts data (high level)
	.get("/reports", async ({ query, set }) => {
		const user = await getAuthenticatedUser();
		const orgId = parseInt(query.orgId || "");

		if (isNaN(orgId)) {
			set.status = 400;
			return { success: false, error: "Invalid organization ID" };
		}

		try {
			await checkOrgAccess(user.id, orgId);

			const orgProjects = await db
				.select({ id: projects.id, name: projects.name })
				.from(projects)
				.where(eq(projects.organizationId, orgId));
			
			const projectIds = orgProjects.map((p) => p.id);

			if (projectIds.length === 0) {
				return {
					success: true,
					data: {
						timePerProject: [],
						timePerMember: [],
						tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
						weeklyTrackingHistory: [],
					},
				};
			}

			// 1. Time tracked per project (seconds)
			const timePerProject = await Promise.all(
				orgProjects.map(async (proj) => {
					const [sumRow] = await db
						.select({ sum: drizzleSql<number>`sum(${taskWorkSessions.duration})::int` })
						.from(taskWorkSessions)
						.innerJoin(tasks, eq(taskWorkSessions.taskId, tasks.id))
						.where(eq(tasks.projectId, proj.id));
					return {
						projectName: proj.name,
						duration: sumRow?.sum || 0,
					};
				})
			);

			// 2. Time tracked per member (seconds)
			const timePerMember = await db
				.select({
					memberId: taskWorkSessions.userId,
					memberName: users.name,
					duration: drizzleSql<number>`sum(${taskWorkSessions.duration})::int`,
				})
				.from(taskWorkSessions)
				.innerJoin(users, eq(taskWorkSessions.userId, users.id))
				.innerJoin(tasks, eq(taskWorkSessions.taskId, tasks.id))
				.where(drizzleSql`${tasks.projectId} IN ${projectIds}`)
				.groupBy(taskWorkSessions.userId, users.name);

			// 3. Task breakdown by priority
			let low = 0, medium = 0, high = 0, urgent = 0;
			const priorityBreakdown = await db
				.select({
					priority: tasks.priority,
					count: drizzleSql<number>`count(${tasks.id})::int`,
				})
				.from(tasks)
				.where(drizzleSql`${tasks.projectId} IN ${projectIds}`)
				.groupBy(tasks.priority);

			for (const row of priorityBreakdown) {
				if (row.priority === "low") low = row.count;
				if (row.priority === "medium") medium = row.count;
				if (row.priority === "high") high = row.count;
				if (row.priority === "urgent") urgent = row.count;
			}

			// 4. Weekly time tracking history (last 7 days breakdown)
			const weeklyTrackingHistory = [];
			for (let i = 6; i >= 0; i--) {
				const day = new Date();
				day.setDate(day.getDate() - i);
				day.setHours(0, 0, 0, 0);

				const dayEnd = new Date(day);
				dayEnd.setHours(23, 59, 59, 999);

				const [daySumRow] = await db
					.select({ sum: drizzleSql<number>`sum(${taskWorkSessions.duration})::int` })
					.from(taskWorkSessions)
					.innerJoin(tasks, eq(taskWorkSessions.taskId, tasks.id))
					.where(
						and(
							drizzleSql`${tasks.projectId} IN ${projectIds}`,
							drizzleSql`${taskWorkSessions.startTime} >= ${day}`,
							drizzleSql`${taskWorkSessions.startTime} <= ${dayEnd}`
						)
					);

				weeklyTrackingHistory.push({
					date: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
					duration: daySumRow?.sum || 0,
				});
			}

			return {
				success: true,
				data: {
					timePerProject,
					timePerMember,
					tasksByPriority: { low, medium, high, urgent },
					weeklyTrackingHistory,
				},
			};
		} catch (err) {
			set.status = (err as Error).message.includes("Forbidden") ? 403 : 400;
			return { success: false, error: (err as Error).message };
		}
	}, {
		query: t.Object({
			orgId: t.String(),
		}),
	});
