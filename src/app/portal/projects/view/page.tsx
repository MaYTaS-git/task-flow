"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	DndContext,
	DragOverlay,
	closestCenter,
	type DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
	ArrowLeft,
	Trash2,
	Edit2,
	Eye,
	UserPlus,
	Settings,
	Calendar,
	Clock,
	Square,
	Plus,
	Users,
	LayoutGrid,
	SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useOrg } from "@/hooks/use-org";
import { useSetHeader } from "@/contexts/header-context";
import { useOrganization } from "@/contexts/organization-context";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";

import { ProjectSettingsForm } from "@/components/forms/project-settings-form";
import { TaskCreateForm } from "@/components/forms/task-create-form";
import { ProjectMemberAssignForm } from "@/components/forms/project-member-assign-form";

import {
	TaskStatusBadge,
	TaskPriorityBadge,
	ProjectStatusBadge,
} from "@/components/common/status-badge";
import { TaskDetailSheet } from "@/components/common/task-detail-sheet";
import { MemberAvatar } from "@/components/common/member-chip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskAssignee {
	id: number;
	name: string | null;
	email: string;
	image?: string | null;
}

interface Task {
	id: number;
	title: string;
	description: string | null;
	projectId: number;
	status: string;
	priority: string;
	dueDate: string | null;
	createdAt: string;
	assignees?: TaskAssignee[];
}

interface ProjectMember {
	id: number;
	name: string | null;
	email: string;
	image?: string | null;
	role: string;
}

interface ActiveTimer {
	taskId: number;
	startTime: string;
	taskTitle: string;
	projectId: number;
}

// ─── Kanban Column Definitions ────────────────────────────────────────────────

const KANBAN_COLUMNS: {
	id: string;
	label: string;
	colorClass: string;
	dotClass: string;
}[] = [
	{
		id: "backlog",
		label: "Backlog",
		colorClass: "border-t-purple-500",
		dotClass: "bg-purple-500",
	},
	{
		id: "todo",
		label: "To Do",
		colorClass: "border-t-border",
		dotClass: "bg-muted-foreground",
	},
	{
		id: "in_progress",
		label: "In Progress",
		colorClass: "border-t-primary",
		dotClass: "bg-primary",
	},
	{
		id: "in_review",
		label: "In Review",
		colorClass: "border-t-amber-500",
		dotClass: "bg-amber-500",
	},
	{
		id: "done",
		label: "Done",
		colorClass: "border-t-emerald-500",
		dotClass: "bg-emerald-500",
	},
];

// ─── Draggable Task Card ──────────────────────────────────────────────────────

interface DraggableTaskCardProps {
	task: Task;
	onOpen: (taskId: number) => void;
	onEdit: (task: Task) => void;
	onDelete: (taskId: number) => void;
	canEdit?: boolean;
	canDelete?: boolean;
}

function DraggableTaskCard({
	task,
	onOpen,
	onEdit,
	onDelete,
	canEdit,
	canDelete,
}: DraggableTaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: task.id,
			data: { status: task.status },
			disabled: !canEdit,
		});

	const style = transform
		? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`p-3 bg-card border border-border rounded-xl space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 select-none group relative ${
				canEdit ? "cursor-grab active:cursor-grabbing" : ""
			} ${
				isDragging ? "opacity-40 ring-2 ring-primary/40" : ""
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<span
					className="text-xs font-semibold leading-snug flex-1 min-w-0 break-words"
					{...listeners}
					{...attributes}
				>
					{task.title}
				</span>
			</div>
			{task.description && (
				<p
					className="text-[10px] text-muted-foreground line-clamp-2"
					{...listeners}
					{...attributes}
				>
					{task.description}
				</p>
			)}
			<div
				className="flex items-center justify-between"
				{...listeners}
				{...attributes}
			>
				<div className="flex items-center gap-1.5">
					<TaskStatusBadge status={task.status} />
					<TaskPriorityBadge priority={task.priority} />
				</div>
				{task.assignees && task.assignees.length > 0 && (
					<div className="flex -space-x-1 overflow-hidden">
						{task.assignees.map((a) => (
							<MemberAvatar
								key={a.id}
								name={a.name}
								email={a.email}
								image={a.image}
								size="xs"
								className="border border-card"
							/>
						))}
					</div>
				)}
			</div>

			{/* Action Overlay (Visible on Hover) */}
			{!isDragging && (
				<div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm p-0.5 rounded-lg border border-border/50 shadow-sm">
					<Button
						variant="ghost"
						size="icon-xs"
						className="size-6 text-muted-foreground hover:text-primary"
						onClick={(e) => {
							e.stopPropagation();
							onOpen(task.id);
						}}
						title="View Task"
					>
						<Eye className="size-3" />
					</Button>
					{canEdit && (
						<Button
							variant="ghost"
							size="icon-xs"
							className="size-6 text-muted-foreground hover:text-primary"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(task);
							}}
							title="Edit Task"
						>
							<Edit2 className="size-3" />
						</Button>
					)}
					{canDelete && (
						<Button
							variant="ghost"
							size="icon-xs"
							className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(task.id);
							}}
							title="Delete Task"
						>
							<Trash2 className="size-3" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

interface DroppableColumnProps {
	columnId: string;
	label: string;
	colorClass: string;
	dotClass: string;
	tasks: Task[];
	isTasksLoading: boolean;
	onOpenTask: (taskId: number) => void;
	onEditTask: (task: Task) => void;
	onDeleteTask: (taskId: number) => void;
	canEdit?: boolean;
	canDelete?: boolean;
	isOver?: boolean;
}

function DroppableColumn({
	columnId,
	label,
	colorClass,
	tasks,
	isTasksLoading,
	onOpenTask,
	onEditTask,
	onDeleteTask,
	canEdit,
	canDelete,
}: DroppableColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id: columnId });

	return (
		<div className={`shrink-0 w-[280px] min-w-[280px] flex flex-col gap-2`}>
			{/* Column Header */}
			<div
				className={`flex items-center justify-between px-3 py-2.5 bg-card border border-border border-t-2 ${colorClass} rounded-xl`}
			>
				<span className="text-xs font-bold text-foreground uppercase tracking-wide">
					{label}
				</span>
				<span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
					{tasks.length}
				</span>
			</div>

			{/* Column Body */}
			<ScrollArea
				className={`flex-1 max-h-[calc(100vh-20rem)] rounded-xl transition-colors ${
					isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""
				}`}
			>
				<div
					ref={setNodeRef}
					className="flex flex-col gap-2 p-1 min-h-[100px]"
				>
					{isTasksLoading ? (
						<div className="text-center text-xs text-muted-foreground py-8">
							Loading...
						</div>
					) : tasks.length === 0 ? (
						<div className="text-center text-xs text-muted-foreground py-8">
							No tasks
						</div>
					) : (
						tasks.map((task) => (
							<DraggableTaskCard
								key={task.id}
								task={task}
								onOpen={onOpenTask}
								onEdit={onEditTask}
								onDelete={onDeleteTask}
								canEdit={canEdit}
								canDelete={canDelete}
							/>
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
}

// ─── Drag Overlay Card ────────────────────────────────────────────────────────

interface DragOverlayCardProps {
	task: Task;
}

function DragOverlayCard({ task }: DragOverlayCardProps) {
	return (
		<div className="p-3 bg-card border border-primary/30 rounded-xl space-y-2 shadow-2xl opacity-95 w-[260px] rotate-1">
			<div className="flex items-start justify-between gap-2">
				<span className="text-xs font-semibold leading-snug flex-1 min-w-0 break-words">
					{task.title}
				</span>
				<TaskPriorityBadge priority={task.priority} />
			</div>
			{task.description && (
				<p className="text-[10px] text-muted-foreground line-clamp-2">
					{task.description}
				</p>
			)}
			<div className="flex items-center justify-between">
				<TaskStatusBadge status={task.status} />
				{task.assignees && task.assignees.length > 0 && (
					<div className="flex -space-x-1 overflow-hidden">
						{task.assignees.map((a) => (
							<MemberAvatar
								key={a.id}
								name={a.name}
								email={a.email}
								image={a.image}
								size="xs"
								className="border border-card"
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Main Page Content ────────────────────────────────────────────────────────

function ProjectDetailsContent() {
	const searchParams = useSearchParams();
	const projectId = parseInt(searchParams.get("id") || "");
	const setHeaderData = useSetHeader();
	const { activeOrg } = useOrganization();
	const router = useRouter();

	// Modal States
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [showNewTaskModal, setShowNewTaskModal] = useState(false);
	const [showEditTaskModal, setShowEditTaskModal] = useState(false);
	const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
	const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
	const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<{
		id: number;
		nameOrEmail: string;
	} | null>(null);
	const [activelyDraggedId, setActivelyDraggedId] = useState<number | null>(
		null,
	);

	// Filter state
	const [filterPriority, setFilterPriority] = useState<string>("all");
	const [filterAssigneeId, setFilterAssigneeId] = useState<string>("all");

	// Hooks
	const { projectDetailsQuery, removeMemberMutation } = useProjects(
		isNaN(projectId) ? undefined : projectId,
	);
	const { orgDetailsQuery } = useOrg();
	const {
		tasksQuery,
		activeTimerQuery,
		updateTaskMutation,
		deleteTaskMutation,
		stopTimerMutation,
	} = useTasks(isNaN(projectId) ? {} : { projectId });

	const projectData = projectDetailsQuery.data;
	const isLoading = projectDetailsQuery.isLoading;
	const error = projectDetailsQuery.error;
	const tasks = (tasksQuery.data || []) as Task[];
	const isTasksLoading = tasksQuery.isLoading;
	const activeTimer = activeTimerQuery.data as ActiveTimer | null | undefined;

	// RBAC
	const isUserAdmin =
		activeOrg?.role === "ADMIN" || activeOrg?.role === "SUPER_ADMIN";
	const canViewProjects =
		isUserAdmin || activeOrg?.parsedPermissions?.projects?.view !== false;
	const canEditProject =
		isUserAdmin || activeOrg?.parsedPermissions?.projects?.edit;
	const canCreateTasks =
		isUserAdmin || activeOrg?.parsedPermissions?.tasks?.create;
	const canEditTasks =
		isUserAdmin || activeOrg?.parsedPermissions?.tasks?.edit;
	const canDeleteTasks =
		isUserAdmin || activeOrg?.parsedPermissions?.tasks?.delete;

	useEffect(() => {
		if (activeOrg && !canViewProjects) {
			router.replace("/portal/unauthorized");
		}
	}, [activeOrg, canViewProjects, router]);

	// Org members for the assign form
	const orgMembers = (orgDetailsQuery.data?.members || []) as ProjectMember[];
	const projectMembersList = (projectData?.members || []) as ProjectMember[];

	// Unassigned members (not already in project)
	const unassignedOrgMembers = orgMembers.filter(
		(om) => !projectMembersList.some((m) => m.id === om.id),
	);

	// Timer ticker
	const [now, setNow] = useState<number>(0);

	useEffect(() => {
		const timeout = setTimeout(() => setNow(Date.now()), 0);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (!activeTimer) return;

		const interval = setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => clearInterval(interval);
	}, [activeTimer]);

	const timerSeconds = activeTimer
		? Math.max(
				0,
				Math.floor(
					(now - new Date(activeTimer.startTime).getTime()) / 1000,
				),
			)
		: 0;

	const formatDuration = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
	};

	// Header
	useEffect(() => {
		if (isNaN(projectId) || !projectData?.project) return;
		const { project } = projectData;

		setHeaderData({
			title: (
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="icon-sm"
						nativeButton={false}
						render={<Link href="/portal/projects" />}
						title="Back to Projects"
					>
						<ArrowLeft className="size-4" />
					</Button>
					<span>{project.name}</span>
					<ProjectStatusBadge status={project.status} />
				</div>
			),
			description:
				"Configure settings, assign project teams, and review task states",
			actions: (
				<div className="flex items-center gap-2">
					{activeTimer && activeTimer.projectId === projectId && (
						<div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-mono text-xs">
							<Clock className="size-3.5 animate-pulse" />
							<span>{formatDuration(timerSeconds)}</span>
							<span className="text-muted-foreground truncate max-w-[120px] ml-1">
								({activeTimer.taskTitle})
							</span>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() =>
									stopTimerMutation.mutate(activeTimer.taskId)
								}
								title="Stop Timer"
								className="text-primary hover:bg-primary/20 ml-1.5"
							>
								<Square className="size-3 fill-current" />
							</Button>
						</div>
					)}
					{canCreateTasks && (
						<Button
							onClick={() => setShowNewTaskModal(true)}
							size="sm"
						>
							<Plus className="size-4 mr-1" />
							New Task
						</Button>
					)}
				</div>
			),
		});
		return () => setHeaderData(null);
	}, [
		setHeaderData,
		projectData,
		activeTimer,
		timerSeconds,
		stopTimerMutation,
		projectId,
		canCreateTasks,
	]);

	// ─── DnD Handlers ───────────────────────────────────────────────────────

	const activelyDraggedTask = activelyDraggedId
		? (tasks.find((t) => t.id === activelyDraggedId) ?? null)
		: null;

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActivelyDraggedId(null);
		if (!over) return;
		const draggedTask = tasks.find((t) => t.id === active.id);
		if (!draggedTask) return;
		const newStatus = String(over.id);
		if (newStatus === draggedTask.status) return;
		updateTaskMutation.mutate({
			id: draggedTask.id,
			title: draggedTask.title,
			status: newStatus,
			description: draggedTask.description,
			priority: draggedTask.priority,
			dueDate: draggedTask.dueDate,
		});
	};

	// ─── Filter Logic ────────────────────────────────────────────────────────

	const filteredTasks = tasks.filter((t) => {
		const matchesPriority =
			filterPriority === "all" || t.priority === filterPriority;
		const matchesAssignee =
			filterAssigneeId === "all" ||
			(t.assignees?.some((a) => a.id.toString() === filterAssigneeId) ??
				false);
		return matchesPriority && matchesAssignee;
	});

	// ─── Guard States ─────────────────────────────────────────────────────────

	if (activeOrg && !canViewProjects) {
		return null;
	}

	if (isNaN(projectId)) {
		return (
			<div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto py-20 text-center space-y-4">
				<p className="text-sm text-muted-foreground">
					Invalid project ID.
				</p>
				<Button
					nativeButton={false}
					render={<Link href="/portal/projects" />}
					variant="outline"
				>
					<ArrowLeft className="size-4 mr-2" /> Back to Projects
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Spinner className="size-10" />
			</div>
		);
	}

	if (error || !projectData) {
		return (
			<div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto py-20 text-center space-y-4">
				<p className="text-sm text-muted-foreground">
					Failed to load project details.
				</p>
				<Button
					nativeButton={false}
					render={<Link href="/portal/projects" />}
					variant="outline"
				>
					<ArrowLeft className="size-4 mr-2" /> Back to Projects
				</Button>
			</div>
		);
	}

	const { project, members } = projectData as {
		project: {
			name: string;
			description: string | null;
			status: string;
			createdAt: string;
		};
		members: ProjectMember[];
	};

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<div className="p-4 sm:p-6 pb-12">
			{/* Mobile Timer Banner */}
			{activeTimer && activeTimer.projectId === projectId && (
				<div className="md:hidden mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between font-mono text-xs text-primary">
					<div className="flex items-center gap-2">
						<Clock className="size-4 animate-pulse" />
						<span>{formatDuration(timerSeconds)}</span>
						<span className="text-muted-foreground truncate max-w-[150px]">
							— {activeTimer.taskTitle}
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() =>
							stopTimerMutation.mutate(activeTimer.taskId)
						}
						className="text-primary hover:bg-primary/20"
					>
						<Square className="size-3.5 fill-current" />
					</Button>
				</div>
			)}

			{/* Tabs */}
			<Tabs defaultValue="board">
				<TabsList className="mb-6">
					<TabsTrigger value="board">
						<LayoutGrid className="size-3.5 mr-1.5" />
						Task Board
					</TabsTrigger>
					<TabsTrigger value="members">
						<Users className="size-3.5 mr-1.5" />
						Members
					</TabsTrigger>
					<TabsTrigger value="details">
						<Settings className="size-3.5 mr-1.5" />
						Details
					</TabsTrigger>
				</TabsList>

				{/* ── Board Tab ─────────────────────────────────────────────── */}
				<TabsContent value="board">
					{/* Filter Bar */}
					<div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-border">
						<SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />
						<div className="flex flex-wrap gap-3">
							<div className="flex items-center gap-1.5">
								<span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
									Priority:
								</span>
								<Select
									value={filterPriority}
									onValueChange={(v) =>
										setFilterPriority(v || "all")
									}
									items={[
										{ label: "All", value: "all" },
										{ label: "Low", value: "low" },
										{ label: "Medium", value: "medium" },
										{ label: "High", value: "high" },
										{ label: "Urgent", value: "urgent" },
									]}
								>
									<SelectTrigger className="h-7 text-xs w-[110px]">
										<SelectValue placeholder="Priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">
											Medium
										</SelectItem>
										<SelectItem value="high">
											High
										</SelectItem>
										<SelectItem value="urgent">
											Urgent
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
									Assignee:
								</span>
								<Select
									value={filterAssigneeId}
									onValueChange={(v) =>
										setFilterAssigneeId(v || "all")
									}
									items={[
										{ label: "All", value: "all" },
										...members.map((m) => ({
											label: m.name || m.email,
											value: m.id.toString(),
										})),
									]}
								>
									<SelectTrigger className="h-7 text-xs w-[140px]">
										<SelectValue placeholder="Assignee" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										{members.map((m) => (
											<SelectItem
												key={m.id}
												value={m.id.toString()}
											>
												{m.name || m.email}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{(filterPriority !== "all" ||
								filterAssigneeId !== "all") && (
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs text-muted-foreground"
									onClick={() => {
										setFilterPriority("all");
										setFilterAssigneeId("all");
									}}
								>
									Clear filters
								</Button>
							)}
						</div>
						{(filterPriority !== "all" ||
							filterAssigneeId !== "all") && (
							<Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
								{filteredTasks.length} of {tasks.length} tasks
							</Badge>
						)}
					</div>

					{/* Kanban Board */}
					<DndContext
						collisionDetection={closestCenter}
						onDragStart={({ active }) =>
							setActivelyDraggedId(Number(active.id))
						}
						onDragEnd={handleDragEnd}
						onDragCancel={() => setActivelyDraggedId(null)}
					>
						<ScrollArea className="w-full">
							<div className="flex gap-4 pb-4 min-h-[calc(100vh-18rem)]">
								{KANBAN_COLUMNS.map((col) => {
									const colTasks = filteredTasks.filter(
										(t) => t.status === col.id,
									);
									return (
										<DroppableColumn
											key={col.id}
											columnId={col.id}
											label={col.label}
											colorClass={col.colorClass}
											dotClass={col.dotClass}
											tasks={colTasks}
											isTasksLoading={isTasksLoading}
											onOpenTask={(taskId) =>
												setSelectedTaskId(taskId)
											}
											onEditTask={(task) => {
												setTaskToEdit(task);
												setShowEditTaskModal(true);
											}}
											onDeleteTask={(taskId) => {
												setTaskToDelete(taskId);
												setShowDeleteTaskConfirm(true);
											}}
											canEdit={canEditTasks}
											canDelete={canDeleteTasks}
										/>
									);
								})}
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>

						<DragOverlay dropAnimation={null}>
							{activelyDraggedTask ? (
								<DragOverlayCard task={activelyDraggedTask} />
							) : null}
						</DragOverlay>
					</DndContext>
				</TabsContent>

				{/* ── Members Tab ────────────────────────────────────────────── */}
				<TabsContent value="members">
					<div className="max-w-2xl space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-sm font-bold text-foreground flex items-center gap-2">
								<Users className="size-4 text-primary" />
								Project Team
								<Badge className="bg-muted text-muted-foreground border border-border text-[10px]">
									{members.length}
								</Badge>
							</h2>
							{isUserAdmin && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowAddMemberModal(true)}
									disabled={unassignedOrgMembers.length === 0}
								>
									<UserPlus className="size-3.5 mr-1" />
									Add Member
								</Button>
							)}
						</div>

						<div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
							{members.length === 0 ? (
								<div className="py-10 text-center text-xs text-muted-foreground">
									No members assigned to this project yet.
								</div>
							) : (
								members.map((member) => (
									<div
										key={member.id}
										className="py-3 px-4 flex items-center justify-between gap-4"
									>
										<div className="flex items-center gap-3">
											<MemberAvatar
												name={member.name}
												email={member.email}
												size="sm"
											/>
											<div>
												<div className="text-sm font-semibold text-foreground">
													{member.name ||
														"Invite Pending"}
												</div>
												<div className="text-xs text-muted-foreground">
													{member.email}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge className="bg-muted text-muted-foreground border border-border text-[10px] uppercase">
												{member.role}
											</Badge>
											{isUserAdmin &&
												member.id !== activeOrg?.id && (
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() =>
															setMemberToRemove({
																id: member.id,
																nameOrEmail:
																	member.name ||
																	member.email,
															})
														}
														title="Remove Member"
													>
														<Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
													</Button>
												)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</TabsContent>

				{/* ── Details Tab ─────────────────────────────────────────────── */}
				<TabsContent value="details">
					<div className="max-w-2xl space-y-6">
						{/* Project meta */}
						<div className="p-5 bg-card border border-border rounded-lg space-y-3">
							<div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
								Project Description
							</div>
							<p className="text-sm text-foreground leading-relaxed">
								{project.description ||
									"No description provided."}
							</p>
							<div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 pt-2 border-t border-border">
								<Calendar className="size-3.5" />
								Created on{" "}
								{new Date(
									project.createdAt,
								).toLocaleDateString()}
							</div>
						</div>

						{/* Settings form */}
						{canEditProject && (
							<div className="p-5 bg-card border border-border rounded-lg">
								<div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-4">
									Project Settings
								</div>
								<ProjectSettingsForm
									projectId={projectId}
									initialName={project.name}
									initialDescription={
										project.description || ""
									}
									initialStatus={project.status}
									onSuccess={() => {}}
									onCancel={() => {}}
								/>
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>

			{/* ── Task Detail Sheet ─────────────────────────────────────────── */}
			<TaskDetailSheet
				taskId={selectedTaskId}
				open={selectedTaskId !== null}
				onOpenChange={(open) => {
					if (!open) setSelectedTaskId(null);
				}}
				activeTimer={activeTimer}
				canEdit={canEditTasks}
				canDelete={canDeleteTasks}
				onTaskUpdated={() => tasksQuery.refetch()}
			/>

			{/* ── Add Member Modal ──────────────────────────────────────────── */}
			<Dialog
				open={showAddMemberModal}
				onOpenChange={setShowAddMemberModal}
			>
				<ProjectMemberAssignForm
					projectId={projectId}
					unassignedMembers={unassignedOrgMembers}
					onSuccess={() => setShowAddMemberModal(false)}
					onCancel={() => setShowAddMemberModal(false)}
				/>
			</Dialog>

			{/* ── Create Task Modal ─────────────────────────────────────────── */}
			<Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
				<TaskCreateForm
					projects={[{ id: projectId, name: project.name }]}
					members={members}
					fixedProjectId={projectId}
					onSuccess={() => setShowNewTaskModal(false)}
					onCancel={() => setShowNewTaskModal(false)}
				/>
			</Dialog>

			{/* ── Remove Member Confirm ─────────────────────────────────────── */}
			<Dialog
				open={memberToRemove !== null}
				onOpenChange={(open) => !open && setMemberToRemove(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Remove Project Member</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove{" "}
							<strong>{memberToRemove?.nameOrEmail}</strong> from
							this project? This will unassign them from any
							tasks.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4 flex gap-2 justify-end">
						<Button
							variant="ghost"
							onClick={() => setMemberToRemove(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (memberToRemove !== null) {
									removeMemberMutation.mutate({
										projectId,
										userId: memberToRemove.id,
									});
									setMemberToRemove(null);
								}
							}}
						>
							Remove
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Edit Task Modal ───────────────────────────────────────────── */}
			{canEditTasks && taskToEdit && (
				<Dialog
					open={showEditTaskModal}
					onOpenChange={setShowEditTaskModal}
				>
					<TaskCreateForm
						projects={[{ id: projectId, name: project.name }]}
						members={members}
						fixedProjectId={projectId}
						initialData={{
							...taskToEdit,
							assignees: taskToEdit.assignees?.map((a) => a.id),
							dueDate: taskToEdit.dueDate
								? new Date(taskToEdit.dueDate)
										.toISOString()
										.split("T")[0]
								: "",
						}}
						onSuccess={() => {
							setShowEditTaskModal(false);
							setTaskToEdit(null);
							tasksQuery.refetch();
						}}
						onCancel={() => {
							setShowEditTaskModal(false);
							setTaskToEdit(null);
						}}
					/>
				</Dialog>
			)}

			{/* ── Delete Task Confirm ────────────────────────────────────────── */}
			{canDeleteTasks && (
				<Dialog
					open={showDeleteTaskConfirm}
					onOpenChange={(open) =>
						!open && setShowDeleteTaskConfirm(false)
					}
				>
				<DialogContent className="max-w-md rounded-lg p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">
							Delete Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Are you sure you want to delete this task? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
						<Button
							variant="ghost"
							onClick={() => setShowDeleteTaskConfirm(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={deleteTaskMutation.isPending}
							onClick={() => {
								if (taskToDelete !== null) {
									deleteTaskMutation.mutate(taskToDelete, {
										onSuccess: () => {
											setShowDeleteTaskConfirm(false);
											setTaskToDelete(null);
											tasksQuery.refetch();
										},
									});
								}
							}}
						>
							{deleteTaskMutation.isPending
								? "Deleting..."
								: "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			)}
		</div>
	);
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function ProjectDetailsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-20">
					<Spinner className="size-10" />
				</div>
			}
		>
			<ProjectDetailsContent />
		</Suspense>
	);
}
