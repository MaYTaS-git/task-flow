"use client";

import React, { useState, useEffect } from "react";
import { FolderGit2, Users, Plus, PieChart, CheckSquare, Clock, Square } from "lucide-react";
import Link from "next/link";

import { useProjects } from "@/hooks/use-projects";
import { useOrg } from "@/hooks/use-org";
import { useTasks } from "@/hooks/use-tasks";
import { useSetHeader } from "@/contexts/header-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Form imports
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { TaskCreateForm } from "@/components/forms/task-create-form";
import { MemberInviteForm } from "@/components/forms/member-invite-form";

interface TaskData {
	id: number;
	status: string;
	projectId: number;
}

interface ProjectData {
	id: number;
	name: string;
	status: string;
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

	const projects = (projectsQuery.data || []) as ProjectData[];
	const isProjectsLoading = projectsQuery.isLoading;
	const orgDetails = orgDetailsQuery.data;
	const members = orgDetails?.members || [];
	const tasks = (tasksQuery.data || []) as TaskData[];
	const activeTimer = activeTimerQuery.data;

	// Modals state
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);
	const [showNewTaskModal, setShowNewTaskModal] = useState(false);
	const [showNewMemberModal, setShowNewMemberModal] = useState(false);

	// Timer Ticker
	const [timerSeconds, setTimerSeconds] = useState(0);
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (activeTimer) {
			const start = new Date(activeTimer.startTime).getTime();
			const update = () => {
				const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
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
			title: "Dashboard Overview",
			description: "Monitor status, projects, team capacity, and track time",
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
						onClick={() => setShowNewTaskModal(true)}
						size="sm"
					>
						<Plus className="size-3.5 mr-1" />
						New Task
					</Button>
				</div>
			),
		});
		return () => setHeaderData(null);
	}, [setHeaderData, activeTimer?.taskId, activeTimer?.taskTitle, timerSeconds, stopTimerMutation.mutate]);

	// Statistics Calculations
	const totalTasksCount = tasks.length;
	const doneTasksCount = tasks.filter((t) => t.status === "done").length;
	const completionRate = totalTasksCount > 0 ? ((doneTasksCount / totalTasksCount) * 100).toFixed(1) : "0.0";

	// Group projects with progress
	const projectsWithProgress = projects.map((proj) => {
		const projTasks = tasks.filter((t) => t.projectId === proj.id);
		const projDoneTasks = projTasks.filter((t) => t.status === "done");
		const progress = projTasks.length > 0 ? Math.round((projDoneTasks.length / projTasks.length) * 100) : 0;
		return {
			...proj,
			tasksCount: projTasks.length,
			progress,
		};
	});

	return (
		<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-12">
			{/* Active Timer Banner for Mobile */}
			{activeTimer && (
				<div className="md:hidden p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between font-mono text-xs text-primary animate-fade-in">
					<div className="flex items-center gap-2">
						<Clock className="size-4 animate-pulse" />
						<span>{formatDuration(timerSeconds)}</span>
						<span className="text-muted-foreground truncate max-w-[150px]"> - {activeTimer.taskTitle}</span>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => stopTimerMutation.mutate(activeTimer.taskId)}
						className="text-primary hover:bg-primary/20"
					>
						<Square className="size-3.5 fill-current" />
					</Button>
				</div>
			)}

			{/* Performance Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
				<div className="p-5 bg-card border border-border rounded-3xl space-y-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-wider">Completion Rate</span>
						<PieChart className="size-4" />
					</div>
					<div className="flex items-end justify-between">
						<span className="text-3xl font-extrabold">{completionRate}%</span>
					</div>
					<div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-500"
							style={{ width: `${completionRate}%` }}
						/>
					</div>
				</div>

				<div className="p-5 bg-card border border-border rounded-3xl space-y-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-wider">Active Projects</span>
						<FolderGit2 className="size-4" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-extrabold">{projects.length}</span>
						<span className="text-xs text-muted-foreground font-light">projects active</span>
					</div>
					<div className="w-full h-1.5 bg-muted rounded-full" />
				</div>

				<div className="p-5 bg-card border border-border rounded-3xl space-y-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-wider">Workspace Members</span>
						<Users className="size-4" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-extrabold">{members.length}</span>
						<span className="text-xs text-muted-foreground font-light">team capacity</span>
					</div>
					<div className="w-full h-1.5 bg-muted rounded-full" />
				</div>

				<div className="p-5 bg-card border border-border rounded-3xl space-y-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
					<div className="flex justify-between items-center text-muted-foreground">
						<span className="text-[10px] uppercase font-bold tracking-wider">Total Tasks</span>
						<CheckSquare className="size-4" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-extrabold">{totalTasksCount}</span>
						<span className="text-xs text-muted-foreground font-light">logged tasks</span>
					</div>
					<div className="w-full h-1.5 bg-muted rounded-full" />
				</div>
			</div>

			{/* Project Overview List */}
			<div className="p-6 bg-card border border-border rounded-3xl space-y-4 animate-fade-in-up">
				<div className="flex justify-between items-center">
					<h2 className="text-sm font-bold uppercase tracking-wider">Projects Progress Overview</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowNewProjectModal(true)}
					>
						<Plus className="size-3.5 mr-1" /> Create Project
					</Button>
				</div>
				<div className="divide-y divide-border">
					{isProjectsLoading ? (
						<div className="py-6 text-center text-xs text-muted-foreground font-light">Loading projects...</div>
					) : projectsWithProgress.length === 0 ? (
						<div className="py-6 text-center text-xs text-muted-foreground font-light">No projects created yet.</div>
					) : (
						projectsWithProgress.map((proj) => (
							<Link
								key={proj.id}
								href={`/portal/projects/view?id=${proj.id}`}
								className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-accent/40 -mx-2 px-2 rounded-xl transition-all duration-150 block"
							>
								<div className="flex items-center gap-3">
									<div className="p-2.5 bg-muted rounded-xl border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
										<FolderGit2 className="size-4" />
									</div>
									<div>
										<div className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
											{proj.name}
										</div>
										<div className="text-xs text-muted-foreground font-light">{proj.tasksCount} tasks</div>
									</div>
								</div>
								<div className="w-full sm:w-64 flex items-center gap-4">
									<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-emerald-500 rounded-full transition-all duration-500"
											style={{ width: `${proj.progress}%` }}
										/>
									</div>
									<span className="text-xs font-bold text-muted-foreground shrink-0 w-8 text-right">{proj.progress}%</span>
								</div>
							</Link>
						))
					)}
				</div>
			</div>

			{/* Create Project Modal */}
			<Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">Create Project</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Add a project space to categorize tasks and configure member boards.
						</DialogDescription>
					</DialogHeader>
					<ProjectCreateForm
						onSuccess={() => setShowNewProjectModal(false)}
						onCancel={() => setShowNewProjectModal(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Create Task Modal */}
			<Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">Create Task</DialogTitle>
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

			{/* Invite Member Modal */}
			<Dialog open={showNewMemberModal} onOpenChange={setShowNewMemberModal}>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">Invite Member</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Add a team member to collaborate on projects inside this organization workspace.
						</DialogDescription>
					</DialogHeader>
					<MemberInviteForm
						onSuccess={() => setShowNewMemberModal(false)}
						onCancel={() => setShowNewMemberModal(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
