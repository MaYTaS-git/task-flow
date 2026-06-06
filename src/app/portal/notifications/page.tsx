"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Check } from "lucide-react";

import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSetHeader } from "@/contexts/header-context";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Notification {
	id: number;
	userId: number;
	title: string;
	message: string;
	type: string; // task_assigned, status_changed, timer_alert, digest
	read: string | null;
	createdAt: string;
}

export default function NotificationsPage() {
	const queryClient = useQueryClient();
	const setHeaderData = useSetHeader();

	const { data: notifications = [], isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await api.notifications.get();
			if (res.error) throw new Error("Failed to fetch notifications");
			return res.data as unknown as Notification[];
		},
	});

	const readNotificationMutation = useMutation({
		mutationFn: async (id: number) => {
			const res = await api.notifications({ id }).read.post();
			if (res.error) throw new Error("Failed to mark notification as read");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("Notification marked as read");
		},
	});

	const readAllMutation = useMutation({
		mutationFn: async () => {
			const res = await api.notifications["read-all"].post();
			if (res.error) throw new Error("Failed to mark all as read");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("All notifications marked as read");
		},
	});

	const getNotificationBadge = (type: string) => {
		switch (type) {
			case "task_assigned":
				return <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] uppercase">Task Assigned</Badge>;
			case "status_changed":
				return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase">Status Update</Badge>;
			case "timer_alert":
				return <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] uppercase">Timer Alert</Badge>;
			default:
				return <Badge variant="outline" className="text-muted-foreground border-border text-[9px] uppercase">System</Badge>;
		}
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	// Set layout header
	useEffect(() => {
		setHeaderData({
			title: (
				<div className="flex items-center gap-2">
					<span>Inbox Notifications</span>
					{unreadCount > 0 && (
						<Badge className="bg-primary text-primary-foreground font-bold">{unreadCount}</Badge>
					)}
				</div>
			),
			description: "Review assigned task logs, updates, alerts, and system notifications",
			actions: unreadCount > 0 ? (
				<Button
					onClick={() => readAllMutation.mutate()}
					disabled={readAllMutation.isPending}
					variant="outline"
					size="sm"
				>
					<Check className="size-3.5 mr-1" />
					Mark all as read
				</Button>
			) : null,
		});
		return () => setHeaderData(null);
	}, [setHeaderData, unreadCount, readAllMutation]);

	return (
		<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-12 w-full">
			{isLoading ? (
				<div className="py-20 text-center text-xs text-muted-foreground font-light">Loading inbox...</div>
			) : notifications.length === 0 ? (
				<div className="py-20 text-center border border-dashed border-border bg-muted/30 rounded-3xl p-8 max-w-md mx-auto space-y-4">
					<div className="p-3.5 bg-primary/10 border border-primary/20 rounded-full text-primary w-fit mx-auto">
						<Bell className="size-8" />
					</div>
					<div className="space-y-1">
						<h3 className="text-sm font-bold text-foreground">Your inbox is clear</h3>
						<p className="text-xs text-muted-foreground font-light">
							No notifications or system logs currently generated.
						</p>
					</div>
				</div>
			) : (
				<div className="bg-card border border-border rounded-3xl p-6 space-y-4">
					<div className="border border-border rounded-2xl overflow-hidden">
						<Table>
							<TableHeader className="bg-muted/30">
								<TableRow className="hover:bg-transparent">
									<TableHead className="w-12"></TableHead>
									<TableHead className="w-[180px] text-[10px] uppercase font-bold tracking-wider">Type</TableHead>
									<TableHead className="text-[10px] uppercase font-bold tracking-wider">Message</TableHead>
									<TableHead className="w-[180px] text-[10px] uppercase font-bold tracking-wider">Time</TableHead>
									<TableHead className="w-12 text-right"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{notifications.map((notif) => (
									<TableRow
										key={notif.id}
										className={!notif.read ? "bg-primary/5 hover:bg-primary/10 transition-colors" : ""}
									>
										<TableCell>
											<div className={`size-2 rounded-full mx-auto ${!notif.read ? "bg-primary" : "bg-transparent"}`} />
										</TableCell>
										<TableCell>
											{getNotificationBadge(notif.type)}
										</TableCell>
										<TableCell>
											<div className="space-y-0.5">
												<div className="text-sm font-bold text-foreground leading-snug">{notif.title}</div>
												<p className="text-xs text-muted-foreground font-light break-words line-clamp-2">{notif.message}</p>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-[10px] text-muted-foreground font-mono">
												{new Date(notif.createdAt).toLocaleString()}
											</span>
										</TableCell>
										<TableCell className="text-right">
											{!notif.read && (
												<Button
													variant="ghost"
													size="icon-sm"
													className="h-8 w-8"
													onClick={() => readNotificationMutation.mutate(notif.id)}
													title="Mark as read"
												>
													<Check className="size-4 text-muted-foreground hover:text-primary" />
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</div>
	);
}
