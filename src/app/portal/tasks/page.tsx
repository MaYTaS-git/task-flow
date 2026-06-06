"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	CheckSquare,
	Plus,
	Play,
	Square,
	Clock,
	Trash2,
} from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useOrg } from "@/hooks/use-org";
import { useTasks } from "@/hooks/use-tasks";
import { useSetHeader } from "@/contexts/header-context";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TaskCreateForm } from "@/components/forms/task-create-form";
import { TaskDetailSheet } from "@/components/common/task-detail-sheet";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/common/status-badge";
import { MemberAvatar } from "@/components/common/member-chip";

interface Task {
	id: number;
	title: string;
	description: string | null;
	projectId: number;
	status: string;
	priority: string;
	dueDate: string | null;
	createdAt: string;
	projectName?: string;
	assignees?: { id: number; name: string | null; email: string }[];
}

interface Project {
	id: number;
	name: string;
}

interface OrgMember {
	id: number;
	name: string | null;
	email: string;
}

function formatDuration(sec: number): string {
	const h = Math.floor(sec / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const s = sec % 60;
	return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

export default function TasksPage() {
	const setHeaderData = useSetHeader();

	// Filters State
	const [filterProjId, setFilterProjId] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [filterPriority, setFilterPriority] = useState<string>("all");
	const [filterAssigneeId, setFilterAssigneeId] = useState<string>("all");

	// Modals
	const [showNewTaskModal, setShowNewTaskModal] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

	// Custom Hooks
	const { projectsQuery } = useProjects();
	const { orgDetailsQuery } = useOrg();
	const {
		tasksQuery,
		activeTimerQuery,
		deleteTaskMutation,
		startTimerMutation,
		stopTimerMutation,
	} = useTasks({
		filterProjId,
		filterStatus,
		filterPriority,
		filterAssigneeId,
	});

	const projects = (projectsQuery.data || []) as Project[];
	const members = (orgDetailsQuery.data?.members || []) as OrgMember[];
	const userRole = orgDetailsQuery.data?.userRole || "MEMBER";
	const tasks = (tasksQuery.data || []) as Task[];
	const isTasksLoading = tasksQuery.isLoading;
	const activeTimer = activeTimerQuery.data;

	// Determine if user can edit tasks
	const canEdit = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

	// Timer Ticker
	const [timerSeconds, setTimerSeconds] = useState(0);
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (activeTimer) {
			const start = new Date(activeTimer.startTime).getTime();
			const update = () => {
				const diff = Math.max(
					0,
					Math.floor((Date.now() - start) / 1000),
				);
				setTimerSeconds(diff);
			};
			update();
			interval = setInterval(update, 1000);
		} else {
			setTimerSeconds(0);
		}
		return () => clearInterval(interval);
	}, [activeTimer]);

	// Set Top Layout Header Data
	useEffect(() => {
		setHeaderData({
			title: "Workspace Tasks",
			description:
				"Complete lists, view kanban details, filter status and track timers",
			actions: (
				<div className="flex items-center gap-2">
					{activeTimer && (
						<div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-mono text-xs animate-fade-in">
							<Clock className="size-3.5 animate-pulse" />
							<span>{formatDuration(timerSeconds)}</span>
							<span className="text-muted-foreground truncate max-w-[120px] ml-1">({activeTimer.taskTitle})</span>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => stopTimerMutation.mutate(activeTimer.taskId)}
								title="Stop Timer"
								className="text-primary hover:bg-primary/20 ml-1.5"
							>
								<Square className="size-3 fill-current" />
							</Button>
						</div>
					)}
					<Button
						onClick={() => {
							if (projects.length === 0) {
								toast.error(
									"Please create a project first before adding tasks.",
								);
								return;
							}
							setShowNewTaskModal(true);
						}}
						size="sm"
					>
						<Plus className="size-3.5 mr-1" /> New Task
					</Button>
				</div>
			),
		});
		return () => setHeaderData(null);
	}, [setHeaderData, projects, activeTimer?.taskId, activeTimer?.taskTitle, timerSeconds, stopTimerMutation.mutate]);

	return (
		<div className="flex flex-col min-w-0 bg-background">
			{/* Filters Bar */}
			<div className="p-4 bg-card border-b border-border grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground uppercase font-semibold">
						Filter by Project
					</Label>
					<Select
						items={[
							{ label: "All Projects", value: "all" },
							...projects.map((p) => ({
								label: p.name,
								value: p.id.toString(),
							})),
						]}
						value={filterProjId}
						onValueChange={(val) => setFilterProjId(val || "all")}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="All Projects" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Projects</SelectItem>
							{projects.map((p) => (
								<SelectItem key={p.id} value={p.id.toString()}>
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground uppercase font-semibold">
						Filter by Status
					</Label>
					<Select
						items={[
							{ label: "All Statuses", value: "all" },
							{ label: "Backlog", value: "backlog" },
							{ label: "To Do", value: "todo" },
							{ label: "In Progress", value: "in_progress" },
							{ label: "In Review", value: "in_review" },
							{ label: "Done", value: "done" },
						]}
						value={filterStatus}
						onValueChange={(val) => setFilterStatus(val || "all")}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="backlog">Backlog</SelectItem>
							<SelectItem value="todo">To Do</SelectItem>
							<SelectItem value="in_progress">In Progress</SelectItem>
							<SelectItem value="in_review">In Review</SelectItem>
							<SelectItem value="done">Done</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground uppercase font-semibold">
						Filter by Priority
					</Label>
					<Select
						items={[
							{ label: "All Priorities", value: "all" },
							{ label: "Low", value: "low" },
							{ label: "Medium", value: "medium" },
							{ label: "High", value: "high" },
							{ label: "Urgent", value: "urgent" },
						]}
						value={filterPriority}
						onValueChange={(val) => setFilterPriority(val || "all")}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="All Priorities" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Priorities</SelectItem>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="urgent">Urgent</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground uppercase font-semibold">
						Filter by Assignee
					</Label>
					<Select
						items={[
							{ label: "All Assignees", value: "all" },
							...members.map((m) => ({
								label: m.name || m.email,
								value: m.id.toString(),
							})),
						]}
						value={filterAssigneeId}
						onValueChange={(val) => setFilterAssigneeId(val || "all")}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="All Assignees" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Assignees</SelectItem>
							{members.map((m) => (
								<SelectItem key={m.id} value={m.id.toString()}>
									{m.name || m.email}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* List of Tasks */}
			<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-12 w-full">
				{isTasksLoading ? (
					<div className="py-20 text-center text-xs text-muted-foreground font-light">
						Loading tasks list...
					</div>
				) : tasks.length === 0 ? (
					<div className="py-20 text-center border border-dashed border-border bg-muted/10 rounded-3xl p-8 max-w-md mx-auto space-y-4 animate-fade-in">
						<div className="p-3.5 bg-primary/10 border border-primary/20 rounded-full text-primary w-fit mx-auto">
							<CheckSquare className="size-8" />
						</div>
						<div className="space-y-1">
							<h3 className="text-sm font-bold">
								No tasks matched your filters
							</h3>
							<p className="text-xs text-muted-foreground font-light">
								Reset your filters or add a new task.
							</p>
						</div>
					</div>
				) : (
					<div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-fade-in-up">
						<div className="divide-y divide-border">
							{tasks.map((task) => (
								<div
									key={task.id}
									className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-accent/30 -mx-2 px-2 rounded-xl transition-all duration-150 cursor-pointer"
									onClick={() => setSelectedTaskId(task.id)}
								>
									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="text-[10px] text-muted-foreground font-medium">
												{task.projectName}
											</span>
											<TaskStatusBadge status={task.status} />
											<TaskPriorityBadge priority={task.priority} />
										</div>
										<h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
											{task.title}
										</h3>
										<p className="text-xs text-muted-foreground font-light line-clamp-1">
											{task.description || "No description provided."}
										</p>
									</div>

									<div className="flex items-center gap-4 justify-between md:justify-end">
										{/* Assignee avatars */}
										<div className="flex -space-x-1.5 overflow-hidden">
											{task.assignees?.map((member) => (
												<MemberAvatar
													key={member.id}
													name={member.name}
													email={member.email}
													size="sm"
													className="border-2 border-card"
												/>
											))}
										</div>

										{/* Timer & Actions */}
										<div
											className="flex items-center gap-2"
											onClick={(e) => e.stopPropagation()}
										>
											{activeTimer && activeTimer.taskId === task.id ? (
												<Button
													variant="destructive"
													size="sm"
													onClick={() => stopTimerMutation.mutate(task.id)}
													className="font-mono text-[10px] flex items-center gap-1.5"
												>
													<Clock className="size-3 animate-pulse" />
													<span>{formatDuration(timerSeconds)}</span>
													<Square className="size-3 fill-current" />
												</Button>
											) : (
												<Button
													variant="outline"
													size="sm"
													onClick={() => startTimerMutation.mutate({ taskId: task.id })}
													title="Start Timer"
												>
													<Play className="size-3 fill-current" />
												</Button>
											)}

											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => setTaskToDelete(task.id)}
												title="Delete Task"
												className="hover:text-destructive hover:bg-destructive/10"
											>
												<Trash2 className="size-3.5" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Task Detail Sheet */}
			<TaskDetailSheet
				taskId={selectedTaskId}
				open={selectedTaskId !== null}
				onOpenChange={(open) => !open && setSelectedTaskId(null)}
				activeTimer={activeTimer ?? null}
				canEdit={canEdit}
				onTaskUpdated={() => tasksQuery.refetch()}
			/>

			{/* Create Task Modal */}
			<Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">
							Create Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Add a task item with status and multiple assignee options.
						</DialogDescription>
					</DialogHeader>
					<TaskCreateForm
						projects={projects}
						members={members}
						onSuccess={() => setShowNewTaskModal(false)}
						onCancel={() => setShowNewTaskModal(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Task Dialog */}
			<Dialog
				open={taskToDelete !== null}
				onOpenChange={(open) => !open && setTaskToDelete(null)}
			>
				<DialogContent className="max-w-md rounded-3xl p-6">
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
							onClick={() => setTaskToDelete(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (taskToDelete !== null) {
									deleteTaskMutation.mutate(taskToDelete);
									setTaskToDelete(null);
								}
							}}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
