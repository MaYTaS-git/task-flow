"use client";

import React, { useState, useEffect } from "react";
import { FolderGit2, Plus, Calendar, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";

import { useProjects } from "@/hooks/use-projects";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/common/status-badge";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { Progress } from "@/components/ui/progress";
import { useOrganization } from "@/contexts/organization-context";

import { useRouter } from "next/navigation";

interface Project {
	id: number;
	name: string;
	description: string | null;
	status: string;
	createdAt: string;
	totalTasks?: number;
	doneTasks?: number;
}

const PROJECT_STATUSES = [
	{ label: "Planning", value: "planning" },
	{ label: "Active", value: "active" },
	{ label: "On Hold", value: "on_hold" },
	{ label: "Completed", value: "completed" },
];

export default function ProjectsPage() {
	const setHeaderData = useSetHeader();
	const { activeOrg } = useOrganization();
	const router = useRouter();
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);

	const { projectsQuery, deleteProjectMutation, updateProjectMutation } =
		useProjects();
	const projects = (projectsQuery.data || []) as Project[];
	const isLoading = projectsQuery.isLoading;

	const isUserAdmin = activeOrg?.role === "ADMIN" || activeOrg?.role === "SUPER_ADMIN";
	const canViewProjects = isUserAdmin || activeOrg?.parsedPermissions?.projects?.view !== false;
	const canCreateProjects = isUserAdmin || activeOrg?.parsedPermissions?.projects?.create;
	const canEditProjects = isUserAdmin || activeOrg?.parsedPermissions?.projects?.edit;
	const canDeleteProjects = isUserAdmin || activeOrg?.parsedPermissions?.projects?.delete;

	useEffect(() => {
		if (activeOrg && !canViewProjects) {
			router.replace("/portal/unauthorized");
		}
	}, [activeOrg, canViewProjects, router]);

	const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

	useEffect(() => {
		if (!canViewProjects) return;
		setHeaderData({
			title: "Organization Projects",
			description:
				"Manage workspaces, status, timeline and configure project boards",
			actions: canCreateProjects ? (
				<Button onClick={() => setShowNewProjectModal(true)} size="sm">
					<Plus className="size-3.5 mr-1" /> New Project
				</Button>
			) : null,
		});
		return () => setHeaderData(null);
	}, [setHeaderData, canCreateProjects, canViewProjects]);

	if (activeOrg && !canViewProjects) {
		return null;
	}

	const handleStatusChange = (
		projectId: number,
		project: Project,
		newStatus: string,
	) => {
		updateProjectMutation.mutate({
			id: projectId,
			name: project.name,
			description: project.description ?? undefined,
			status: newStatus,
		});
	};

	return (
		<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-12">
			{isLoading ? (
				<div className="py-20 text-center text-xs text-muted-foreground font-light">
					Loading organization projects...
				</div>
			) : projects.length === 0 ? (
				<div className="py-20 text-center border border-dashed border-border bg-muted/10 rounded-lg p-8 max-w-md mx-auto space-y-4 animate-fade-in">
					<div className="p-3.5 bg-primary/10 border border-primary/20 rounded-full text-primary w-fit mx-auto">
						<FolderGit2 className="size-8" />
					</div>
					<div className="space-y-1">
						<h3 className="text-sm font-bold">No projects found</h3>
						<p className="text-xs text-muted-foreground font-light">
							Get started by creating your first project
							workspace.
						</p>
					</div>
					{canCreateProjects && (
						<Button
							onClick={() => setShowNewProjectModal(true)}
							size="sm"
						>
							<Plus className="size-4 mr-1.5" /> Create Project
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
					{projects.map((project) => (
						<div key={project.id} className="relative group">
							<Link
								href={`/portal/projects/view?id=${project.id}`}
								className="block focus:outline-none"
							>
								<Card className="hover:shadow-lg gap-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-border h-full">
									<CardHeader className="border-b border-border">
										<div className="flex justify-between items-start">
											<div className="p-2 bg-muted rounded-xl border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
												<FolderGit2 className="size-4" />
											</div>
											{/* Status badge with dropdown — stop propagation on click */}
											<div
												onClick={(e) =>
													e.preventDefault()
												}
												onMouseDown={(e) =>
													e.preventDefault()
												}
											>
												{canEditProjects ? (
													<DropdownMenu>
														<DropdownMenuTrigger
															render={
																<Button
																	type="button"
																	variant={
																		"ghost"
																	}
																	size={"sm"}
																	className="flex items-center gap-1 focus:outline-none cursor-pointer"
																	onClick={(
																		e,
																	) => {
																		e.preventDefault();
																		e.stopPropagation();
																	}}
																/>
															}
														>
															<ProjectStatusBadge
																status={
																	project.status
																}
															/>
															<ChevronDown className="size-3 text-muted-foreground ml-0.5" />
														</DropdownMenuTrigger>
														<DropdownMenuPortal>
															<DropdownMenuContent
																className="min-w-36 p-1 rounded-xl"
																align="end"
															>
																{PROJECT_STATUSES.map(
																	(s) => (
																		<DropdownMenuItem
																			key={
																				s.value
																			}
																			onClick={(
																				e,
																			) => {
																				e.stopPropagation();
																				handleStatusChange(
																					project.id,
																					project,
																					s.value,
																				);
																			}}
																			className="cursor-pointer rounded-lg text-xs"
																		>
																			{
																				s.label
																			}
																		</DropdownMenuItem>
																	),
																)}
															</DropdownMenuContent>
														</DropdownMenuPortal>
													</DropdownMenu>
												) : (
													<ProjectStatusBadge
														status={project.status}
													/>
												)}
											</div>
										</div>
										<CardTitle className="text-sm font-bold leading-snug mt-2">
											{project.name}
										</CardTitle>
										<CardDescription className="text-xs font-light line-clamp-2">
											{project.description ||
												"No description provided."}
										</CardDescription>

										{/* Progress Section */}
										<div className="mt-4 space-y-2">
											<div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
												<span className="text-muted-foreground">
													Progress
												</span>
												<span className="text-primary">
													{project.doneTasks || 0} /{" "}
													{project.totalTasks || 0}{" "}
													Tasks
												</span>
											</div>
											<Progress
												value={
													project.totalTasks
														? ((project.doneTasks ||
																0) /
																project.totalTasks) *
														  100
														: 0
												}
												className="h-1.5"
											/>
										</div>
									</CardHeader>

									<CardFooter className="flex items-center justify-between">
										<span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
											<Calendar className="size-3" />
											{new Date(
												project.createdAt,
											).toLocaleDateString()}
										</span>
										{canDeleteProjects && (
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setProjectToDelete(project.id);
												}}
												title="Delete Project"
												className="hover:text-destructive hover:bg-destructive/10"
											>
												<Trash2 className="size-3.5" />
											</Button>
										)}
									</CardFooter>
								</Card>
							</Link>
						</div>
					))}
				</div>
			)}

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

			{/* Delete Project Dialog */}
			<Dialog
				open={projectToDelete !== null}
				onOpenChange={(open) => !open && setProjectToDelete(null)}
			>
				<DialogContent className="max-w-md rounded-lg p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">
							Delete Project
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Are you sure you want to delete this project? This
							will delete all tasks and sessions inside it. This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4 flex gap-2 justify-end">
						<Button
							variant="ghost"
							onClick={() => setProjectToDelete(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (projectToDelete !== null) {
									deleteProjectMutation.mutate(
										projectToDelete,
									);
									setProjectToDelete(null);
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
