"use client";
import { useEffect, useRef, useState } from "react";
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
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!user?.id) return;

		let isMounted = true;
		let reconnectTimeout: NodeJS.Timeout | null = null;
		let pollInterval: NodeJS.Timeout | null = null;

		const startPolling = () => {
			if (pollInterval) return;
			console.log("[Notifications] WS disconnected. Starting 30s polling fallback...");
			pollInterval = setInterval(() => {
				if (!isMounted) return;
				console.log("[Notifications] Polling notifications and attempting to reconnect WS...");
				
				// Poll notifications
				queryClient.invalidateQueries({ queryKey: ["notifications"] });
				
				// Attempt WS reconnect
				connect();
			}, 30000);
		};

		const stopPolling = () => {
			if (pollInterval) {
				clearInterval(pollInterval);
				pollInterval = null;
			}
		};

		const connect = () => {
			if (!isMounted) return;

			// Close existing connection if any
			if (socketRef.current) {
				if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
					return;
				}
				socketRef.current.close();
			}

			try {
				const socket = new WebSocket("ws://localhost:3001/ws");
				socketRef.current = socket;

				socket.onopen = () => {
					if (!isMounted) return;
					console.log("[Notifications] WS connected");
					setIsConnected(true);
					// Authenticate with the WS server
					socket.send(JSON.stringify({ type: "auth", userId: user.id.toString() }));
					retryCountRef.current = 0; // Reset retry count on successful connection
					stopPolling(); // Connected, stop fallback polling
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
					// Silent failure
				};

				socket.onclose = () => {
					if (!isMounted) return;
					socketRef.current = null;
					setIsConnected(false);
					startPolling(); // Start fallback polling
					
					// Exponential backoff for reconnection
					if (retryCountRef.current < maxRetries) {
						const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
						retryCountRef.current++;
						if (reconnectTimeout) clearTimeout(reconnectTimeout);
						reconnectTimeout = setTimeout(connect, delay);
					}
				};
			} catch {
				socketRef.current = null;
				setIsConnected(false);
				startPolling(); // Start fallback polling
				
				if (retryCountRef.current < maxRetries) {
					const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
					retryCountRef.current++;
					if (reconnectTimeout) clearTimeout(reconnectTimeout);
					reconnectTimeout = setTimeout(connect, delay);
				}
			}
		};

		connect();

		return () => {
			isMounted = false;
			stopPolling();
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
		};
	}, [user?.id, queryClient, refreshOrganizations, updateSession]);

	return isConnected;
}
