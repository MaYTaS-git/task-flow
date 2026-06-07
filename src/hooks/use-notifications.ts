"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSession } from "@/contexts/session-context";
import { toast } from "sonner";
import { useOrganization } from "@/contexts/organization-context";
import { useSession } from "next-auth/react";

export function useNotifications() {
	const { user } = useUserSession();
	const { update: updateSession } = useSession();
	const { refreshOrganizations } = useOrganization();
	const queryClient = useQueryClient();
	const socketRef = useRef<WebSocket | null>(null);
	const retryCountRef = useRef(0);
	const maxRetries = 5;

	useEffect(() => {
		if (!user?.id) return;

		let isMounted = true;
		let reconnectTimeout: NodeJS.Timeout;

		const connect = () => {
			if (!isMounted) return;

			// Close existing connection if any
			if (socketRef.current) {
				socketRef.current.close();
			}

			try {
				const socket = new WebSocket("ws://localhost:3001/ws");
				socketRef.current = socket;

				socket.onopen = () => {
					if (!isMounted) return;
					// Authenticate with the WS server
					socket.send(JSON.stringify({ type: "auth", userId: user.id.toString() }));
					retryCountRef.current = 0; // Reset retry count on successful connection
				};

				socket.onmessage = (event) => {
					if (!isMounted) return;
					try {
						const data = JSON.parse(event.data);
						
						// Special handling for permissions update
						if (data.type === "permissions_updated") {
							toast.info("Permissions Updated", {
								description: "Your access levels have been updated in real-time.",
							});
							refreshOrganizations();
							updateSession();
						} else {
							// Show a toast for the new notification
							toast(data.title, {
								description: data.message,
							});
						}

						// Refresh data based on notification type
						if (data.type && typeof data.type === "string") {
							if (data.type.startsWith("task_")) {
								queryClient.invalidateQueries({ queryKey: ["tasks"] });
								queryClient.invalidateQueries({ queryKey: ["analytics"] });
							}
							if (data.type.includes("team") || data.type.includes("project")) {
								queryClient.invalidateQueries({ queryKey: ["projects"] });
								queryClient.invalidateQueries({ queryKey: ["org-members"] });
							}
						}

						// Always invalidate notifications query to update unread count and list
						queryClient.invalidateQueries({ queryKey: ["notifications"] });
					} catch (err) {
						console.error("Failed to parse WebSocket message:", err);
					}
				};

				socket.onerror = () => {
					// Silent failure on console to avoid {} logs, 
					// error is usually followed by onclose
				};

				socket.onclose = () => {
					if (!isMounted) return;
					socketRef.current = null;
					
					// Exponential backoff for reconnection
					if (retryCountRef.current < maxRetries) {
						const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
						retryCountRef.current++;
						reconnectTimeout = setTimeout(connect, delay);
					}
				};
			} catch {
				// Failed to instantiate WebSocket
				if (retryCountRef.current < maxRetries) {
					const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
					retryCountRef.current++;
					reconnectTimeout = setTimeout(connect, delay);
				}
			}
		};

		connect();

		return () => {
			isMounted = false;
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
		};
	}, [user?.id, queryClient, refreshOrganizations, updateSession]);

	return null;
}
