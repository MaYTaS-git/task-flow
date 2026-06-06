import { Elysia, t } from "elysia";
import { and, isNull, sql as drizzleSql, eq } from "drizzle-orm";
import { db, taskWorkSessions, tasks } from "@/lib/db";
import { sendRealtimeNotification } from "@/lib/ws";

export const cronRoutes = new Elysia({ prefix: "/cron" })
	// Maintenance cron task triggered by scheduler
	.post(
		"/run",
		async ({ headers, set }) => {
			const cronToken = headers["x-cron-token"];
			const secret = process.env.CRON_SECRET || "taskflow-cron-secret-key";

			if (cronToken !== secret) {
				set.status = 401;
				return { success: false, error: "Unauthorized: Invalid cron token" };
			}

			const now = new Date();
			const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

			// 1. Find all active work sessions older than 8 hours
			const runawaySessions = await db
				.select({
					id: taskWorkSessions.id,
					userId: taskWorkSessions.userId,
					taskId: taskWorkSessions.taskId,
					startTime: taskWorkSessions.startTime,
					taskTitle: tasks.title,
				})
				.from(taskWorkSessions)
				.innerJoin(tasks, eq(taskWorkSessions.taskId, tasks.id))
				.where(
					and(
						isNull(taskWorkSessions.endTime),
						drizzleSql`${taskWorkSessions.startTime} <= ${eightHoursAgo}`
					)
				);

			let closedCount = 0;

			for (const session of runawaySessions) {
				// Stop the session at 8 hours limit
				const autoDuration = 8 * 60 * 60; // 8 hours in seconds
				const autoEndTime = new Date(session.startTime.getTime() + autoDuration * 1000);

				await db
					.update(taskWorkSessions)
					.set({
						endTime: autoEndTime,
						duration: autoDuration,
					})
					.where(eq(taskWorkSessions.id, session.id));

				closedCount++;

				// Alert the member that their timer was automatically stopped
				await sendRealtimeNotification(
					session.userId,
					"Timer Auto-Stopped",
					`Your work session on "${session.taskTitle}" was automatically stopped after running for 8 hours.`,
					"timer_alert"
				);
			}

			return {
				success: true,
				message: "Maintenance checks completed successfully",
				data: {
					closedRunawaySessionsCount: closedCount,
				},
			};
		},
		{
			headers: t.Object({
				"x-cron-token": t.String(),
			}),
		}
	);
