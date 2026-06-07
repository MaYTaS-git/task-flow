"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Play, Square, Calendar, Timer, User, Edit2, Trash2 } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/common/status-badge";
import { MemberAvatar } from "@/components/common/member-chip";
import { api } from "@/lib/api-client";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useOrg } from "@/hooks/use-org";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TaskCreateForm } from "@/components/forms/task-create-form";

interface TaskAssignee {
	id: number;
	name: string | null;
	email: string;
	image?: string | null;
}

interface WorkSession {
	id: number;
	userId: number;
	userName: string | null;
	startTime: string;
	endTime: string | null;
	duration: number | null;
	description: string | null;
}

interface TaskDetailData {
	id: number;
	title: string;
	description: string | null;
	projectId: number;
	status: string;
	priority: string;
	dueDate: string | null;
	estimatedMinutes: number | null;
	createdAt: string;
	assignees: TaskAssignee[];
	sessions: WorkSession[];
}

interface ActiveTimer {
	taskId: number;
	startTime: Date | string;
	taskTitle: string;
	projectId: number;
}

interface TaskDetailSheetProps {
	taskId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	activeTimer: ActiveTimer | null | undefined;
	canEdit?: boolean;
	canDelete?: boolean;
	onTaskUpdated?: () => void;
}

function formatDuration(sec: number): string {
	const h = Math.floor(sec / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const s = sec % 60;
	return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

function formatSessionDuration(seconds: number | null): string {
	if (seconds === null) return "—";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) return `${h}h ${m}m`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
}

export function TaskDetailSheet({
	taskId,
	open,
	onOpenChange,
	activeTimer,
	canEdit = false,
	canDelete = false,
	onTaskUpdated,
}: TaskDetailSheetProps) {
	const { updateTaskMutation, deleteTaskMutation, startTimerMutation, stopTimerMutation } = useTasks();
	const { projectsQuery } = useProjects();
	const { orgDetailsQuery } = useOrg();

	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const isActiveOnThisTask = activeTimer?.taskId === taskId;

	const [now, setNow] = useState<number>(0);

	useEffect(() => {
		const timeout = setTimeout(() => setNow(Date.now()), 0);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (!isActiveOnThisTask || !activeTimer) return;

		const interval = setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => clearInterval(interval);
	}, [isActiveOnThisTask, activeTimer]);

	const timerSeconds = (isActiveOnThisTask && activeTimer)
		? Math.max(0, Math.floor((now - new Date(activeTimer.startTime).getTime()) / 1000))
		: 0;

	const { data: taskDetails, isLoading, refetch } = useQuery({
		queryKey: ["task-detail", taskId],
		queryFn: async () => {
			if (!taskId) return null;
			const res = await api.tasks({ id: taskId }).get();
			if (res.error || !res.data) return null;
			const responseData = res.data as unknown as { success: boolean; data: TaskDetailData };
			return responseData.success ? responseData.data : null;
		},
		enabled: !!taskId && open,
	});

	const projects = (projectsQuery.data || []) as { id: number; name: string }[];
	const members = (orgDetailsQuery.data?.members || []) as { id: number; name: string | null; email: string; image?: string | null }[];

	const handleStatusChange = (newStatus: string) => {
		if (!taskDetails || !canEdit) return;
		updateTaskMutation.mutate({
			id: taskDetails.id,
			title: taskDetails.title,
			status: newStatus,
			description: taskDetails.description,
			priority: taskDetails.priority,
			dueDate: taskDetails.dueDate,
			estimatedMinutes: taskDetails.estimatedMinutes ?? undefined,
		}, {
			onSuccess: () => {
				refetch();
				onTaskUpdated?.();
			},
		});
	};

	const handlePriorityChange = (newPriority: string) => {
		if (!taskDetails || !canEdit) return;
		updateTaskMutation.mutate({
			id: taskDetails.id,
			title: taskDetails.title,
			status: taskDetails.status,
			description: taskDetails.description,
			priority: newPriority,
			dueDate: taskDetails.dueDate,
			estimatedMinutes: taskDetails.estimatedMinutes ?? undefined,
		}, {
			onSuccess: () => {
				refetch();
				onTaskUpdated?.();
			},
		});
	};

	const handleDeleteTask = () => {
		if (!taskId) return;
		deleteTaskMutation.mutate(taskId, {
			onSuccess: () => {
				setShowDeleteConfirm(false);
				onOpenChange(false);
				onTaskUpdated?.();
			},
		});
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
				{isLoading || !taskDetails ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-sm text-muted-foreground">Loading task details...</div>
					</div>
				) : (
					<>
						{/* Header */}
						<SheetHeader className="px-6 pt-10 pb-4 border-b border-border shrink-0 relative">
							{(canEdit || canDelete) && (
								<div className="absolute top-4 right-14 flex items-center gap-1">
									{canEdit && (
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setShowEditModal(true)}
											title="Edit Task"
											className="shrink-0"
										>
											<Edit2 className="size-4" />
										</Button>
									)}
									{canDelete && (
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setShowDeleteConfirm(true)}
											title="Delete Task"
											className="shrink-0 hover:text-destructive hover:bg-destructive/10"
										>
											<Trash2 className="size-4" />
										</Button>
									)}
								</div>
							)}
							<div className="flex items-center gap-2 flex-wrap mb-1">
								<TaskStatusBadge status={taskDetails.status} />
								<TaskPriorityBadge priority={taskDetails.priority} />
							</div>
							<SheetTitle className="text-base font-bold leading-snug text-left">
								{taskDetails.title}
							</SheetTitle>
						</SheetHeader>

						<div className="flex-1 overflow-hidden">
							<ScrollArea className="h-full">
								<div className="p-6 space-y-6">
									{taskDetails.description && (
										<div className="space-y-1.5">
											<div className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Description</div>
											<p className="text-xs leading-relaxed text-left text-muted-foreground whitespace-pre-wrap">
												{taskDetails.description}
											</p>
										</div>
									)}

									{/* Edit Status + Priority (role gated) */}
									{canEdit && (
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<div className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Status</div>
												<Select
													items={[
														{ label: "Backlog", value: "backlog" },
														{ label: "To Do", value: "todo" },
														{ label: "In Progress", value: "in_progress" },
														{ label: "In Review", value: "in_review" },
														{ label: "Done", value: "done" },
													]}
													value={taskDetails.status}
													onValueChange={(v) => handleStatusChange(v || "todo")}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="backlog">Backlog</SelectItem>
														<SelectItem value="todo">To Do</SelectItem>
														<SelectItem value="in_progress">In Progress</SelectItem>
														<SelectItem value="in_review">In Review</SelectItem>
														<SelectItem value="done">Done</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-1.5">
												<div className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Priority</div>
												<Select
													items={[
														{ label: "Low", value: "low" },
														{ label: "Medium", value: "medium" },
														{ label: "High", value: "high" },
														{ label: "Urgent", value: "urgent" },
													]}
													value={taskDetails.priority}
													onValueChange={(v) => handlePriorityChange(v || "medium")}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Priority" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="low">Low</SelectItem>
														<SelectItem value="medium">Medium</SelectItem>
														<SelectItem value="high">High</SelectItem>
														<SelectItem value="urgent">Urgent</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									)}

									{/* Meta info */}
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">
												<Calendar className="size-3" />
												Due Date
											</div>
											<div className="text-xs font-medium">
												{taskDetails.dueDate
													? new Date(taskDetails.dueDate).toLocaleDateString()
													: "No due date"}
											</div>
										</div>
										<div className="space-y-1.5">
											<div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">
												<Timer className="size-3" />
												Estimated Time
											</div>
											<div className="text-xs font-medium">
												{taskDetails.estimatedMinutes
													? taskDetails.estimatedMinutes >= 60
														? `${Math.floor(taskDetails.estimatedMinutes / 60)}h ${taskDetails.estimatedMinutes % 60}m`
														: `${taskDetails.estimatedMinutes}m`
													: "Not set"}
											</div>
										</div>
									</div>

									{/* Assignees */}
									{taskDetails.assignees.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">
												<User className="size-3" />
												Assignees
											</div>
											<div className="flex flex-wrap gap-2">
												{taskDetails.assignees.map((a) => (
													<div key={a.id} className="flex items-center gap-1.5 text-xs bg-muted rounded-full px-2 py-1">
														<MemberAvatar name={a.name} email={a.email} image={a.image} size="xs" />
														<span className="font-medium">{a.name || a.email}</span>
													</div>
												))}
											</div>
										</div>
									)}

									<Separator />

									{/* Timer Control */}
									<div className="p-4 bg-muted rounded-lg flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className={`p-2 rounded-md ${isActiveOnThisTask ? "bg-primary/20" : "bg-background"}`}>
												<Clock className={`size-4 ${isActiveOnThisTask ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
											</div>
											<div>
												<div className="text-xs font-semibold">
													{isActiveOnThisTask ? (
														<span className="text-primary font-mono">{formatDuration(timerSeconds)}</span>
													) : (
														"Time Tracker"
													)}
												</div>
												<div className="text-[10px] text-muted-foreground">
													{isActiveOnThisTask ? "Timer running..." : "Track your progress on this task"}
												</div>
											</div>
										</div>
										{isActiveOnThisTask ? (
											<Button
												variant="destructive"
												size="sm"
												onClick={() => {
													stopTimerMutation.mutate(taskDetails.id, {
														onSuccess: () => refetch(),
													});
												}}
											>
												<Square className="size-3.5 fill-current mr-1.5" />
												Stop Timer
											</Button>
										) : (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													startTimerMutation.mutate({ taskId: taskDetails.id }, {
														onSuccess: () => refetch(),
													});
												}}
											>
												<Play className="size-3.5 mr-1.5 fill-current" />
												Start Timer
											</Button>
										)}
									</div>

									{/* Work Sessions History */}
									{taskDetails.sessions.length > 0 && (
										<div className="space-y-3 pb-8">
											<div className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">
												Work Sessions ({taskDetails.sessions.length})
											</div>
											<div className="space-y-2">
												{taskDetails.sessions.map((session) => (
													<div
														key={session.id}
														className="flex items-start justify-between gap-3 p-3 bg-muted rounded-xl text-xs"
													>
														<div className="space-y-0.5">
															<div className="font-medium text-foreground">
																{session.userName || "Unknown"}
															</div>
															<div className="text-muted-foreground">
																{new Date(session.startTime).toLocaleString()}
																{session.endTime ? ` → ${new Date(session.endTime).toLocaleTimeString()}` : " (ongoing)"}
															</div>
														</div>
														<div className="font-mono font-bold text-primary shrink-0">
															{formatSessionDuration(session.duration)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</ScrollArea>
						</div>

						{/* Edit Task Modal */}
						{canEdit && (
							<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
								<TaskCreateForm
									projects={projects}
									members={members}
									initialData={{
										...taskDetails,
										assignees: taskDetails.assignees.map(a => a.id),
										dueDate: taskDetails.dueDate ? new Date(taskDetails.dueDate).toISOString().split('T')[0] : ""
									}}
									onSuccess={() => {
										setShowEditModal(false);
										refetch();
										onTaskUpdated?.();
									}}
									onCancel={() => setShowEditModal(false)}
								/>
							</Dialog>
						)}

						{/* Delete Confirm Modal */}
						{canDelete && (
							<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
								<DialogContent className="max-w-md rounded-lg p-6">
									<DialogHeader>
										<DialogTitle className="text-lg font-bold">
											Delete Task
										</DialogTitle>
										<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
											Are you sure you want to delete this task? This action cannot be undone.
										</DialogDescription>
									</DialogHeader>
									<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
										<Button
											variant="ghost"
											onClick={() => setShowDeleteConfirm(false)}
										>
											Cancel
										</Button>
										<Button
											variant="destructive"
											disabled={deleteTaskMutation.isPending}
											onClick={handleDeleteTask}
										>
											{deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
