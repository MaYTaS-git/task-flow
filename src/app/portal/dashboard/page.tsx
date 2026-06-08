"use client";

import React, { useState, useEffect } from "react";
import {
	FolderGit2,
	Users,
	Plus,
	PieChart,
	CheckSquare,
	Clock,
	Square,
} from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useOrg } from "@/hooks/use-org";
import { useTasks } from "@/hooks/use-tasks";
import { useSetHeader } from "@/contexts/header-context";
import { useOrganization } from "@/contexts/organization-context";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

// Form imports
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { TaskCreateForm } from "@/components/forms/task-create-form";
import { MemberInviteForm } from "@/components/forms/member-invite-form";

import { useRouter } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TaskData {
	id: number;
	status: string;
	projectId: number;
}

interface ProjectData {
	id: number;
	name: string;
	status: string;
	totalTasks?: number;
	doneTasks?: number;
}

function formatDuration(sec: number): string {
	const h = Math.floor(sec / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const s = sec % 60;
	return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

export default function Dashboard() {
	const setHeaderData = useSetHeader();

	// Custom Hooks
	const { projectsQuery } = useProjects();
	const { orgDetailsQuery } = useOrg();
	const { tasksQuery, activeTimerQuery, stopTimerMutation } = useTasks();

	const { activeOrg } = useOrganization();

	const projects = (projectsQuery.data || []) as ProjectData[];
	const isProjectsLoading = projectsQuery.isLoading;
	const orgDetails = orgDetailsQuery.data;
	const members = orgDetails?.members || [];
	const userRole = orgDetails?.userRole || "MEMBER";
	const tasks = (tasksQuery.data || []) as TaskData[];
	const activeTimer = activeTimerQuery.data;

	const isUserAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
	const canCreateTasks = isUserAdmin || activeOrg?.parsedPermissions?.tasks?.create;
	const canCreateProjects = isUserAdmin || activeOrg?.parsedPermissions?.projects?.create;

	// Modals state
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);
	const [showNewTaskModal, setShowNewTaskModal] = useState(false);
	const [showNewMemberModal, setShowNewMemberModal] = useState(false);

	// Timer Ticker
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

	// Set Top Layout Header Data
	useEffect(() => {
		setHeaderData({
			title: "Dashboard Overview",
			description:
				"Monitor status, projects, team capacity, and track time",
			actions: (
				<div className="flex items-center gap-2">
					{activeTimer && (
						<div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-primary font-mono text-xs animate-fade-in">
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
					{isUserAdmin && (
						<Button
							onClick={() => setShowNewMemberModal(true)}
							size="sm"
							className="hidden sm:flex"
						>
							<Users className="size-3.5 mr-1" />
							Invite
						</Button>
					)}
					{canCreateTasks && (
						<Button onClick={() => setShowNewTaskModal(true)} size="sm">
							<Plus className="size-3.5 mr-1" />
							New Task
						</Button>
					)}
				</div>
			),
		});
		return () => setHeaderData(null);
	}, [
		setHeaderData,
		activeTimer,
		timerSeconds,
		stopTimerMutation,
		isUserAdmin,
		canCreateTasks,
	]);

	// Statistics Calculations
	const totalTasksCount = tasks.length;
	const doneTasksCount = tasks.filter((t) => t.status === "done").length;
	const completionRate =
		totalTasksCount > 0
			? ((doneTasksCount / totalTasksCount) * 100).toFixed(1)
			: "0.0";

	// Group projects with progress
	const projectsWithProgress = projects.map((proj) => {
		const projTasks = tasks.filter((t) => t.projectId === proj.id);
		const projDoneTasks = projTasks.filter((t) => t.status === "done");
		const progress =
			projTasks.length > 0
				? Math.round((projDoneTasks.length / projTasks.length) * 100)
				: 0;
		return {
			...proj,
			tasksCount: projTasks.length,
			progress,
		};
	});

	const router = useRouter();

	return (
		<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-12">
			{/* Active Timer Banner for Mobile */}
			{activeTimer && (
				<div className="md:hidden p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between font-mono text-xs text-primary animate-fade-in">
					<div className="flex items-center gap-2">
						<Clock className="size-4 animate-pulse" />
						<span>{formatDuration(timerSeconds)}</span>
						<span className="text-muted-foreground truncate max-w-[150px]">
							{" "}
							- {activeTimer.taskTitle}
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

			{/* Performance Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
				<div className="p-6 bg-card border border-border rounded-lg space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-[0.15em] group-hover:text-primary transition-colors">
							Performance
						</span>
						<PieChart className="size-4 group-hover:text-primary transition-colors" />
					</div>
					<div className="flex items-end justify-between">
						<span className="text-4xl font-extrabold tracking-tight">
							{completionRate}%
						</span>
					</div>
					<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-700 ease-in-out"
							style={{ width: `${completionRate}%` }}
						/>
					</div>
				</div>

				<div className="p-6 bg-card border border-border rounded-lg space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-[0.15em] group-hover:text-primary transition-colors">
							Workspaces
						</span>
						<FolderGit2 className="size-4 group-hover:text-primary transition-colors" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-4xl font-extrabold tracking-tight">
							{projects.length}
						</span>
						<span className="text-xs text-muted-foreground font-medium">
							projects
						</span>
					</div>
					<div className="w-full h-2 bg-muted/50 rounded-full" />
				</div>

				<div className="p-6 bg-card border border-border rounded-lg space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-[0.15em] group-hover:text-primary transition-colors">
							Team Size
						</span>
						<Users className="size-4 group-hover:text-primary transition-colors" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-4xl font-extrabold tracking-tight">
							{members.length}
						</span>
						<span className="text-xs text-muted-foreground font-medium">
							members
						</span>
					</div>
					<div className="w-full h-2 bg-muted/50 rounded-full" />
				</div>

				<div className="p-6 bg-card border border-border rounded-lg space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-[0.15em] group-hover:text-primary transition-colors">
							Total Items
						</span>
						<CheckSquare className="size-4 group-hover:text-primary transition-colors" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-4xl font-extrabold tracking-tight">
							{totalTasksCount}
						</span>
						<span className="text-xs text-muted-foreground font-medium">
							tasks
						</span>
					</div>
					<div className="w-full h-2 bg-muted/50 rounded-full" />
				</div>
			</div>

			{/* Project Overview List */}
			<div className="p-6 bg-card border border-border rounded-lg space-y-4 animate-fade-in-up flex flex-col h-[600px]">
				<div className="flex justify-between items-center shrink-0">
					<h2 className="text-sm font-bold uppercase tracking-wider">
						Projects Progress Overview
					</h2>
					{canCreateProjects && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowNewProjectModal(true)}
						>
							<Plus className="size-3.5 mr-1" /> Create Project
						</Button>
					)}
				</div>
				<ScrollArea className="flex-1 w-full border border-border rounded-lg">
					<div className="min-w-[600px]">
						<Table>
							<TableHeader className="bg-muted/30">
								<TableRow className="hover:bg-transparent">
									<TableHead className="w-12"></TableHead>
									<TableHead className="text-[10px] uppercase font-bold tracking-wider">Project Name</TableHead>
									<TableHead className="text-[10px] uppercase font-bold tracking-wider">Tasks</TableHead>
									<TableHead className="w-[300px] text-[10px] uppercase font-bold tracking-wider">Progress</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isProjectsLoading ? (
									<TableRow>
										<TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground font-light">
											Loading projects...
										</TableCell>
									</TableRow>
								) : projectsWithProgress.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground font-light">
											No projects created yet.
										</TableCell>
									</TableRow>
								) : (
									projectsWithProgress.map((proj) => (
										<TableRow 
											key={proj.id}
											className="cursor-pointer group"
											onClick={() => router.push(`/portal/projects/view?id=${proj.id}`)}
										>
											<TableCell>
												<div className="p-2 bg-muted group-hover:bg-primary/10 rounded-md border border-border text-muted-foreground group-hover:text-primary transition-colors">
													<FolderGit2 className="size-4" />
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm font-bold group-hover:text-primary transition-colors">
													{proj.name}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
													{proj.tasksCount} total
												</span>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Progress 
														value={proj.progress} 
														className="h-2 flex-1"
													/>
													<span className="text-xs font-black w-8 text-right">
														{proj.progress}%
													</span>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>

			{/* Create Project Modal */}
			<Dialog
				open={showNewProjectModal}
				onOpenChange={setShowNewProjectModal}
			>
				<ProjectCreateForm
					onSuccess={() => setShowNewProjectModal(false)}
					onCancel={() => setShowNewProjectModal(false)}
				/>
			</Dialog>

			{/* Create Task Modal */}
			<Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
				<TaskCreateForm
					projects={projects}
					members={members}
					onSuccess={() => setShowNewTaskModal(false)}
					onCancel={() => setShowNewTaskModal(false)}
				/>
			</Dialog>

			{/* Invite Member Modal */}
			<Dialog
				open={showNewMemberModal}
				onOpenChange={setShowNewMemberModal}
			>
				<MemberInviteForm
					onSuccess={() => setShowNewMemberModal(false)}
					onCancel={() => setShowNewMemberModal(false)}
				/>
			</Dialog>
		</div>
	);
}
