import { db, notifications } from "@/lib/db";

/**
 * Inserts a notification into the database and dispatches it
 * to the standalone WebSocket notification server for real-time delivery.
 */
export async function sendRealtimeNotification(
	userId: number,
	title: string,
	message: string,
	type: string
) {
	// 1. Save notification in PostgreSQL logs
	const [notif] = await db
		.insert(notifications)
		.values({
			userId,
			title,
			message,
			type,
		})
		.returning();

	// 2. Dispatch notify request to WebSocket relay
	try {
		await fetch("http://localhost:3001/notify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, title, message, type }),
		});
	} catch {
		console.warn("WebSocket relay offline, saved notification in DB logs only.");
	}

	return notif;
}
