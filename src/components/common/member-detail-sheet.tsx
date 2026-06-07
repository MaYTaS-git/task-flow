"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
	Mail, 
	FolderGit2, 
	CheckSquare, 
	ExternalLink,
	Calendar
} from "lucide-react";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MemberAvatar } from "@/components/common/member-chip";
import { useUserProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/common/status-badge";
import { Separator } from "@/components/ui/separator";

interface MemberDetailSheetProps {
	memberId: number;
	name: string | null;
	email: string;
	image?: string | null;
	role: string;
	permissions?: {
		projects?: {
			view?: boolean;
			create?: boolean;
			edit?: boolean;
			delete?: boolean;
		};
		tasks?: {
			view?: boolean;
			create?: boolean;
			edit?: boolean;
			delete?: boolean;
		};
		members?: {
			view?: boolean;
			manage?: boolean;
		};
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface Project {
	id: number;
	name: string;
	description: string | null;
	status: string;
	createdAt: string;
}

interface Task {
	id: number;
	title: string;
	description: string | null;
	status: string;
	priority: string;
	projectName?: string;
}

export function MemberDetailSheet({
	memberId,
	name,
	email,
	image,
	role,
	open,
	onOpenChange,
}: MemberDetailSheetProps) {
	const { data: projects = [], isLoading: isLoadingProjects } = useUserProjects(memberId);
	
	const [activeTab, setActiveTab] = useState("tasks");
	const [taskStatusFilter, setTaskStatusFilter] = useState("all");

	const { tasksQuery } = useTasks({
		filterAssigneeId: memberId.toString(),
		filterStatus: taskStatusFilter,
	});
	const tasks = (tasksQuery.data || []) as Task[];
	const isLoadingTasks = tasksQuery.isLoading;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-xl p-0 flex flex-col h-full gap-0 rounded-l-[2.5rem] border-l border-border overflow-hidden">
				<SheetHeader className="p-8 pb-6 bg-muted/20 shrink-0">
					<div className="flex items-start justify-between mb-4">
						<MemberAvatar 
							name={name} 
							email={email} 
							image={image}
							size="lg" 
							className="size-16 border-4 border-background shadow-xl"
						/>
					</div>
					<div className="space-y-1">
						<SheetTitle className="text-2xl font-black tracking-tight leading-none">{name || "Invite Pending"}</SheetTitle>
						<div className="flex items-center gap-2">
							{role === "ADMIN" ? (
								<Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-2 py-0.5 rounded-lg uppercase font-bold tracking-wider">
									Admin
								</Badge>
							) : (
								<Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-lg uppercase font-bold tracking-wider text-muted-foreground border-border">
									Member
								</Badge>
							)}
						</div>
					</div>
					<SheetDescription className="flex items-center gap-2 text-sm text-muted-foreground font-medium mt-1">
						<Mail className="size-3.5" />
						{email}
					</SheetDescription>
				</SheetHeader>

				<Separator />

				<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
					<div className="px-8 pt-4 bg-muted/10 shrink-0">
						<TabsList className="bg-muted/50 p-1 rounded-lg h-11 w-full max-w-sm">
							<TabsTrigger value="tasks" className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold gap-2">
								<CheckSquare className="size-3.5" />
								Tasks
							</TabsTrigger>
							<TabsTrigger value="projects" className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold gap-2">
								<FolderGit2 className="size-3.5" />
								Projects
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex-1 overflow-hidden min-h-0">
						<TabsContent value="tasks" className="m-0 h-full">
							<ScrollArea className="flex-1 min-h-0">
								<div className="px-8 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 sticky top-0 bg-background z-10 pb-4 border-b border-border/50 mb-4">
									{["all", "todo", "in_progress", "done"].map((status) => (
										<button
											key={status}
											onClick={() => setTaskStatusFilter(status)}
											className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0 ${
												taskStatusFilter === status
													? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
													: "bg-background text-muted-foreground border-border hover:border-primary/50"
											}`}
										>
											{status.replace("_", " ")}
										</button>
									))}
								</div>

								<div className="px-8 space-y-4 pb-8">
									{isLoadingTasks ? (
										<div className="py-20 text-center text-xs text-muted-foreground font-light">Loading tasks...</div>
									) : tasks.length === 0 ? (
										<div className="py-20 text-center text-xs text-muted-foreground font-light border-2 border-dashed border-border rounded-lg">
											No tasks found for this member.
										</div>
									) : (
										tasks.map((task) => (
											<div key={task.id} className="p-4 bg-card border border-border rounded-lg space-y-2 hover:shadow-md transition-shadow group relative">
												<div className="flex items-center justify-between gap-2">
													<div className="flex items-center gap-2">
														<span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{task.projectName}</span>
														<TaskStatusBadge status={task.status} />
													</div>
													<TaskPriorityBadge priority={task.priority} />
												</div>
												<h4 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors pr-8">{task.title}</h4>
												<p className="text-xs text-muted-foreground font-light line-clamp-2">{task.description || "No description."}</p>
											</div>
										))
									)}
								</div>
							</ScrollArea>
						</TabsContent>

						<TabsContent value="projects" className="m-0 h-full">
							<ScrollArea className="flex-1 min-h-0">
								<div className="px-8 space-y-4 py-6 pb-12">
									{isLoadingProjects ? (
										<div className="py-20 text-center text-xs text-muted-foreground font-light">Loading projects...</div>
									) : projects.length === 0 ? (
										<div className="py-20 text-center text-xs text-muted-foreground font-light border-2 border-dashed border-border rounded-lg">
											This member is not assigned to any projects.
										</div>
									) : (
										(projects as Project[]).map((project) => (
											<Link 
												key={project.id} 
												href={`/portal/projects/view?id=${project.id}`}
												className="block p-5 bg-card border border-border rounded-lg space-y-4 hover:shadow-md transition-all group border-transparent hover:border-primary/20 bg-muted/10 hover:bg-card"
											>
												<div className="flex items-center justify-between">
													<div className="p-3 bg-background border border-border rounded-md text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
														<FolderGit2 className="size-5" />
													</div>
													<ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
												</div>
												<div className="space-y-1">
													<h4 className="text-base font-black tracking-tight group-hover:text-primary transition-colors">{project.name}</h4>
													<p className="text-xs text-muted-foreground font-light line-clamp-2">{project.description || "No description provided."}</p>
												</div>
												<div className="flex items-center justify-between pt-2">
													<Badge variant="outline" className="text-[9px] uppercase font-bold border-border bg-background px-2 py-0.5">
														{project.status}
													</Badge>
													<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
														<Calendar className="size-3" />
														{new Date(project.createdAt).toLocaleDateString()}
													</div>
												</div>
											</Link>
										))
									)}
								</div>
							</ScrollArea>
						</TabsContent>
					</div>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
}
