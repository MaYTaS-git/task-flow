"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
	Building2,
	Plus,
	FolderGit2,
	Users,
	ChevronDown,
	LogOut,
	LayoutGrid,
	PieChart,
	MessageSquare,
	UserPlus,
	CheckSquare,
	Send,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useUserSession } from "@/contexts/session-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

// Mock Data
interface Org {
	id: string;
	name: string;
}

interface Project {
	id: string;
	name: string;
	progress: number;
	tasksCount: number;
}

interface Member {
	id: string;
	name: string;
	initials: string;
	color: string;
}

interface Task {
	id: string;
	title: string;
	status: "todo" | "in_progress" | "in_review" | "done";
	assignees: string[]; // member ids
	commentsCount: number;
}

interface Comment {
	id: string;
	author: string;
	initials: string;
	content: string;
	timestamp: string;
}

export default function Dashboard() {
	const session = useUserSession();
	const user = session?.user;

	// Dashboard state
	const [organizations, setOrganizations] = useState<Org[]>([
		{ id: "org1", name: "Acme Product Group" },
		{ id: "org2", name: "Personal Lab Space" },
	]);
	const [activeOrg, setActiveOrg] = useState<Org>(organizations[0]);
	const [projects, setProjects] = useState<Project[]>([
		{ id: "p1", name: "Marketing Web Redesign", progress: 80, tasksCount: 5 },
		{ id: "p2", name: "Mobile App Dev", progress: 45, tasksCount: 8 },
		{ id: "p3", name: "Internal Analytics Hub", progress: 100, tasksCount: 3 },
	]);
	const [members, setMembers] = useState<Member[]>([
		{ id: "m1", name: "Jane Doe", initials: "JD", color: "bg-purple-600" },
		{ id: "m2", name: "Alex Smith", initials: "AS", color: "bg-emerald-600" },
		{ id: "m3", name: "Sam Wilson", initials: "SW", color: "bg-pink-600" },
		{ id: "m4", name: "Elena Rostova", initials: "ER", color: "bg-cyan-600" },
	]);
	const [tasks, setTasks] = useState<Task[]>([
		{ id: "t1", title: "Design landing page wireframes", status: "done", assignees: ["m1", "m2"], commentsCount: 2 },
		{ id: "t2", title: "Setup PostgreSQL tables & Drizzle hooks", status: "in_review", assignees: ["m1", "m3"], commentsCount: 4 },
		{ id: "t3", title: "Implement framer motion animation loops", status: "in_progress", assignees: ["m2"], commentsCount: 1 },
		{ id: "t4", title: "Configure NextAuth rememberMe dynamic cookies", status: "todo", assignees: ["m4", "m1"], commentsCount: 0 },
	]);

	// Dialog & Dropdown States
	const [showOrgDropdown, setShowOrgDropdown] = useState(false);
	const [showNewOrgModal, setShowNewOrgModal] = useState(false);
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);
	const [showNewTaskModal, setShowNewTaskModal] = useState(false);
	const [showNewMemberModal, setShowNewMemberModal] = useState(false);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	// Form inputs state
	const [newOrgName, setNewOrgName] = useState("");
	const [newProjName, setNewProjName] = useState("");
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("todo");
	const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);
	const [newMemberName, setNewMemberName] = useState("");

	// Comment State & Mentions
	const [commentText, setCommentText] = useState("");
	const [showMentions, setShowMentions] = useState(false);
	const [mentionSearch, setMentionSearch] = useState("");
	const [comments, setComments] = useState<Record<string, Comment[]>>({
		t1: [
			{ id: "c1", author: "Jane Doe", initials: "JD", content: "Landing page looks amazing! Great color scheme.", timestamp: "2 hours ago" },
			{ id: "c2", author: "Alex Smith", initials: "AS", content: "Thanks @JD, completed the review as well.", timestamp: "1 hour ago" },
		],
		t2: [
			{ id: "c3", author: "Sam Wilson", initials: "SW", content: "Postgres schema resolves relation checks.", timestamp: "3 hours ago" },
		],
	});

	// Mentions autocomplete handler
	const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setCommentText(val);

		const atIndex = val.lastIndexOf("@");
		if (atIndex !== -1 && atIndex >= val.length - 15) {
			const query = val.substring(atIndex + 1);
			if (!query.includes(" ")) {
				setShowMentions(true);
				setMentionSearch(query.toLowerCase());
			} else {
				setShowMentions(false);
			}
		} else {
			setShowMentions(false);
		}
	};

	const insertMention = (memberInitials: string) => {
		const atIndex = commentText.lastIndexOf("@");
		if (atIndex !== -1) {
			const newVal = commentText.substring(0, atIndex) + `@${memberInitials} `;
			setCommentText(newVal);
			setShowMentions(false);
		}
	};

	const postComment = (taskId: string) => {
		if (!commentText.trim()) return;

		const userInitials = user?.name
			? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
			: "ME";

		const newComment: Comment = {
			id: `c_${Date.now()}`,
			author: user?.name || user?.email || "CurrentUser",
			initials: userInitials.substring(0, 2),
			content: commentText,
			timestamp: "Just now",
		};

		setComments((prev) => ({
			...prev,
			[taskId]: [...(prev[taskId] || []), newComment],
		}));

		setTasks((prev) =>
			prev.map((t) =>
				t.id === taskId ? { ...t, commentsCount: t.commentsCount + 1 } : t
			)
		);

		setCommentText("");
		toast.success("Comment posted!");
	};

	// Form actions
	const handleCreateOrg = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newOrgName.trim()) return;
		const newOrg: Org = { id: `org_${Date.now()}`, name: newOrgName };
		setOrganizations([...organizations, newOrg]);
		setActiveOrg(newOrg);
		setNewOrgName("");
		setShowNewOrgModal(false);
		toast.success("Organization created!");
	};

	const handleCreateProject = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newProjName.trim()) return;
		const newProj: Project = { id: `p_${Date.now()}`, name: newProjName, progress: 0, tasksCount: 0 };
		setProjects([...projects, newProj]);
		setNewProjName("");
		setShowNewProjectModal(false);
		toast.success("Project created!");
	};

	const handleCreateTask = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTaskTitle.trim()) return;
		const newTask: Task = {
			id: `t_${Date.now()}`,
			title: newTaskTitle,
			status: newTaskStatus,
			assignees: newTaskAssignees,
			commentsCount: 0,
		};
		setTasks([...tasks, newTask]);
		setNewTaskTitle("");
		setNewTaskStatus("todo");
		setNewTaskAssignees([]);
		setShowNewTaskModal(false);
		toast.success("Task added to workspace!");
	};

	const handleAddMember = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMemberName.trim()) return;
		const initials = newMemberName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
		const bgColors = ["bg-purple-600", "bg-emerald-600", "bg-pink-600", "bg-cyan-600", "bg-amber-600"];
		const color = bgColors[members.length % bgColors.length];

		const newMem: Member = {
			id: `m_${Date.now()}`,
			name: newMemberName,
			initials,
			color,
		};
		setMembers([...members, newMem]);
		setNewMemberName("");
		setShowNewMemberModal(false);
		toast.success("Team member invited!");
	};

	return (
		<div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans selection:bg-primary/20">
			{/* Dashboard Sidebar */}
			<aside className="w-64 border-r border-white/5 bg-neutral-950 flex flex-col justify-between shrink-0 hidden md:flex relative z-20">
				<div className="p-6 space-y-6">
					{/* Org Switcher */}
					<div className="relative">
						<button
							onClick={() => setShowOrgDropdown(!showOrgDropdown)}
							className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer select-none text-left"
						>
							<div className="flex items-center gap-2">
								<Building2 className="size-4 text-primary shrink-0" />
								<span className="text-sm font-semibold truncate max-w-[130px]">{activeOrg.name}</span>
							</div>
							<ChevronDown className="size-4 text-neutral-400 shrink-0" />
						</button>

						<AnimatePresence>
							{showOrgDropdown && (
								<motion.div
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 5 }}
									className="absolute top-14 left-0 right-0 p-1 bg-neutral-900 border border-white/10 rounded-2xl shadow-xl z-50 space-y-0.5"
								>
									{organizations.map((org) => (
										<button
											key={org.id}
											onClick={() => {
												setActiveOrg(org);
												setShowOrgDropdown(false);
											}}
											className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
										>
											{org.name}
										</button>
									))}
									<hr className="border-white/5 my-1" />
									<button
										onClick={() => {
											setShowNewOrgModal(true);
											setShowOrgDropdown(false);
										}}
										className="w-full text-left p-2.5 text-primary hover:bg-primary/5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
									>
										<Plus className="size-3.5" />
										Create Org
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Navigation Links */}
					<nav className="space-y-1">
						<div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2.5 text-sm font-semibold cursor-default">
							<LayoutGrid className="size-4" />
							Dashboard Overview
						</div>
						<button
							onClick={() => setShowNewProjectModal(true)}
							className="w-full p-2.5 hover:bg-white/5 text-neutral-400 hover:text-neutral-200 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-colors cursor-pointer text-left"
						>
							<FolderGit2 className="size-4" />
							Create Project
						</button>
						<button
							onClick={() => setShowNewTaskModal(true)}
							className="w-full p-2.5 hover:bg-white/5 text-neutral-400 hover:text-neutral-200 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-colors cursor-pointer text-left"
						>
							<CheckSquare className="size-4" />
							Add Work Task
						</button>
						<button
							onClick={() => setShowNewMemberModal(true)}
							className="w-full p-2.5 hover:bg-white/5 text-neutral-400 hover:text-neutral-200 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-colors cursor-pointer text-left"
						>
							<UserPlus className="size-4" />
							Invite Member
						</button>
					</nav>
				</div>

				{/* User Profile / Logout */}
				<div className="p-6 border-t border-white/5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
							{user?.name ? user.name[0].toUpperCase() : "U"}
						</div>
						<div className="truncate max-w-[120px]">
							<div className="text-xs font-semibold text-neutral-200">{user?.name || "User Portal"}</div>
							<div className="text-[10px] text-neutral-500 truncate">{user?.email}</div>
						</div>
					</div>
					<button
						onClick={() => signOut({ callbackUrl: "/login" })}
						className="p-2 hover:bg-white/5 text-neutral-400 hover:text-red-400 rounded-xl cursor-pointer transition-colors"
						title="Log Out"
					>
						<LogOut className="size-4" />
					</button>
				</div>
			</aside>

			{/* Main Workspace Frame */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
				{/* Top Navbar */}
				<header className="h-20 border-b border-white/5 bg-neutral-950/60 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between shrink-0">
					<div className="flex items-center gap-4">
						<div className="md:hidden p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
							<Image
								src="/icons/apple-touch-icon.png"
								alt="TaskFlow Logo"
								width={18}
								height={18}
								className="object-contain"
							/>
						</div>
						<div>
							<h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
								{activeOrg.name} Dashboard
							</h1>
							<p className="text-xs text-neutral-500 font-light hidden sm:block">
								Workspace tasks, board, and project logs
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowNewTaskModal(true)}
							className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/10"
						>
							<Plus className="size-3.5" />
							New Task
						</button>
					</div>
				</header>

				{/* Scrollable Dashboard Workspace */}
				<ScrollArea className="flex-1 w-full">
					<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
						{/* Performance Summary Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
							<div className="p-5 bg-neutral-900/40 border border-white/5 rounded-3xl space-y-3">
								<div className="flex justify-between items-center text-neutral-500">
									<span className="text-[10px] uppercase font-bold tracking-wider">Completion Rate</span>
									<PieChart className="size-4" />
								</div>
								<div className="flex items-end justify-between">
									<span className="text-3xl font-extrabold text-white">82.5%</span>
									<span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
										+4.2%
									</span>
								</div>
								<div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
									<div className="h-full bg-primary" style={{ width: "82.5%" }} />
								</div>
							</div>

							<div className="p-5 bg-neutral-900/40 border border-white/5 rounded-3xl space-y-3">
								<div className="flex justify-between items-center text-neutral-500">
									<span className="text-[10px] uppercase font-bold tracking-wider">Active Projects</span>
									<FolderGit2 className="size-4" />
								</div>
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-extrabold text-white">{projects.length}</span>
									<span className="text-xs text-neutral-500 font-light">projects active</span>
								</div>
								<div className="w-full h-1 bg-white/5 rounded-full" />
							</div>

							<div className="p-5 bg-neutral-900/40 border border-white/5 rounded-3xl space-y-3">
								<div className="flex justify-between items-center text-neutral-500">
									<span className="text-[10px] uppercase font-bold tracking-wider">Team Capacity</span>
									<Users className="size-4" />
								</div>
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-extrabold text-white">{members.length}</span>
									<span className="text-xs text-neutral-500 font-light">members active</span>
								</div>
								<div className="w-full h-1 bg-white/5 rounded-full" />
							</div>

							<div className="p-5 bg-neutral-900/40 border border-white/5 rounded-3xl space-y-3">
								<div className="flex justify-between items-center text-neutral-500">
									<span className="text-[10px] uppercase font-bold tracking-wider">Total Tasks</span>
									<CheckSquare className="size-4" />
								</div>
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-extrabold text-white">{tasks.length}</span>
									<span className="text-xs text-neutral-500 font-light">total tasks logged</span>
								</div>
								<div className="w-full h-1 bg-white/5 rounded-full" />
							</div>
						</div>

						{/* Project Overview List */}
						<div className="p-6 bg-neutral-900/20 border border-white/5 rounded-3xl space-y-4">
							<div className="flex justify-between items-center">
								<h2 className="text-sm font-bold text-white uppercase tracking-wider">Projects Progress Overview</h2>
								<button
									onClick={() => setShowNewProjectModal(true)}
									className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
								>
									<Plus className="size-3.5" /> Create Project
								</button>
							</div>
							<div className="divide-y divide-white/5">
								{projects.map((proj) => (
									<div key={proj.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
										<div className="flex items-center gap-3">
											<div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-neutral-400">
												<FolderGit2 className="size-4" />
											</div>
											<div>
												<div className="text-sm font-bold text-white">{proj.name}</div>
												<div className="text-xs text-neutral-500 font-light">{proj.tasksCount} active tasks</div>
											</div>
										</div>
										<div className="w-full sm:w-64 flex items-center gap-4">
											<div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
												<div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proj.progress}%` }} />
											</div>
											<span className="text-xs font-bold text-neutral-300 shrink-0 w-8 text-right">{proj.progress}%</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Kanban Columns Status Board */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h2 className="text-sm font-bold text-white uppercase tracking-wider">Interactive Task Board</h2>
								<button
									onClick={() => setShowNewTaskModal(true)}
									className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
								>
									<Plus className="size-3.5" /> Add Task
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
								{(["todo", "in_progress", "in_review", "done"] as const).map((status) => {
									const statusTitle = {
										todo: "To Do",
										in_progress: "In Progress",
										in_review: "In Review",
										done: "Done",
									}[status];

									const statusColor = {
										todo: "border-t-neutral-500 bg-neutral-500/5",
										in_progress: "border-t-primary bg-primary/5",
										in_review: "border-t-amber-500 bg-amber-500/5",
										done: "border-t-emerald-500 bg-emerald-500/5",
									}[status];

									const statusLabelColor = {
										todo: "text-neutral-400 bg-neutral-400/10 border-neutral-400/20",
										in_progress: "text-primary bg-primary/10 border-primary/20",
										in_review: "text-amber-400 bg-amber-400/10 border-amber-400/20",
										done: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
									}[status];

									const filteredTasks = tasks.filter((t) => t.status === status);

									return (
										<div
											key={status}
											className={`p-4 rounded-3xl border border-white/5 border-t-2 ${statusColor} space-y-4 flex flex-col h-[400px]`}
										>
											<div className="flex justify-between items-center">
												<span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${statusLabelColor}`}>
													{statusTitle}
												</span>
												<span className="text-xs text-neutral-500 font-bold bg-white/5 px-2 py-0.5 rounded-md">
													{filteredTasks.length}
												</span>
											</div>

											<ScrollArea className="flex-1 w-full pr-1">
												<div className="space-y-3">
													{filteredTasks.map((task) => (
														<div
															key={task.id}
															onClick={() => setSelectedTask(task)}
															className="p-4 bg-neutral-950 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all space-y-3 select-none"
														>
															<div className="text-sm font-semibold leading-snug text-neutral-200">
																{task.title}
															</div>
															<div className="flex items-center justify-between pt-1">
																<div className="flex -space-x-1.5 overflow-hidden">
																	{task.assignees.map((memId) => {
																		const member = members.find((m) => m.id === memId);
																		return (
																			<div
																				key={memId}
																				className={`size-6 rounded-full border border-neutral-950 flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${member?.color || "bg-neutral-700"}`}
																				title={member?.name}
																			>
																				{member?.initials || "U"}
																			</div>
																		);
																	})}
																</div>
																{task.commentsCount > 0 && (
																	<div className="flex items-center gap-1 text-[10px] text-neutral-500">
																		<MessageSquare className="size-3.5" />
																		{task.commentsCount}
																	</div>
																)}
															</div>
														</div>
													))}
												</div>
											</ScrollArea>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</ScrollArea>
			</div>

			{/* Task Details & Mentions Dialog */}
			<AnimatePresence>
				{selectedTask && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] flex flex-col"
						>
							{/* Header */}
							<div className="flex justify-between items-start border-b border-white/5 pb-4 shrink-0">
								<div className="space-y-1.5 pr-6">
									<span className="text-[10px] uppercase font-bold text-primary tracking-wider">Task details</span>
									<h3 className="text-lg font-bold text-white leading-snug">{selectedTask.title}</h3>
								</div>
								<button
									onClick={() => setSelectedTask(null)}
									className="text-neutral-500 hover:text-neutral-300 text-xs font-semibold cursor-pointer"
								>
									Close
								</button>
							</div>

							{/* Detail properties */}
							<div className="grid grid-cols-2 gap-4 shrink-0">
								<div className="space-y-1">
									<div className="text-[10px] uppercase text-neutral-500 tracking-wider">Status</div>
									<div className="text-xs font-bold text-neutral-300 uppercase">
										{selectedTask.status.replace("_", " ")}
									</div>
								</div>
								<div className="space-y-1">
									<div className="text-[10px] uppercase text-neutral-500 tracking-wider">Assignees</div>
									<div className="flex gap-1.5 items-center">
										{selectedTask.assignees.map((memId) => {
											const member = members.find((m) => m.id === memId);
											return (
												<div
													key={memId}
													className={`size-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${member?.color || "bg-neutral-700"}`}
													title={member?.name}
												>
													{member?.initials || "U"}
												</div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Comments Section */}
							<div className="flex-1 flex flex-col min-h-0 space-y-4">
								<h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0">Discussion / Comments</h4>

								<ScrollArea className="flex-1 w-full bg-white/5 border border-white/5 rounded-2xl p-4 min-h-0 pr-1">
									<div className="space-y-4">
										{(!comments[selectedTask.id] || comments[selectedTask.id].length === 0) ? (
											<div className="text-xs text-neutral-500 font-light text-center py-6">
												No comments posted yet. Mention a member using @ to chat.
											</div>
										) : (
											comments[selectedTask.id].map((comment) => {
												// Format @ references with text-primary
												const formattedContent = comment.content.split(/(@\w+)/g).map((part, i) => {
													if (part.startsWith("@")) {
														return <span key={i} className="text-primary font-semibold">{part}</span>;
													}
													return part;
												});

												return (
													<div key={comment.id} className="flex items-start gap-3 text-xs leading-relaxed">
														<div className="size-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-[10px] text-neutral-300 shrink-0">
															{comment.initials}
														</div>
														<div className="space-y-1 flex-1 min-w-0">
															<div className="flex items-baseline gap-2">
																<span className="font-bold text-neutral-200">{comment.author}</span>
																<span className="text-[9px] text-neutral-500">{comment.timestamp}</span>
															</div>
															<p className="text-neutral-400 break-words">{formattedContent}</p>
														</div>
													</div>
												);
											})
										)}
									</div>
								</ScrollArea>

								{/* Add Comment Input */}
								<div className="relative shrink-0 pt-2 border-t border-white/5">
									<div className="flex items-center gap-2">
										<div className="flex-1 relative">
											<Input
												type="text"
												placeholder="Add updates... type @ to reference team member"
												value={commentText}
												onChange={handleCommentChange}
												className="w-full bg-white/5 border-neutral-800 rounded-xl text-xs pr-10 focus:border-primary"
												onKeyDown={(e) => {
													if (e.key === "Enter") postComment(selectedTask.id);
												}}
											/>
											<button
												onClick={() => postComment(selectedTask.id)}
												className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
												title="Send"
											>
												<Send className="size-3.5" />
											</button>
										</div>
									</div>

									{/* Mentions Dropdown Autocomplete */}
									<AnimatePresence>
										{showMentions && (
											<motion.div
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 5 }}
												className="absolute bottom-12 left-0 right-0 max-h-36 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-1"
											>
												<ScrollArea className="flex-1 w-full">
													<div className="space-y-0.5">
														{members
															.filter((m) => m.name.toLowerCase().includes(mentionSearch) || m.initials.toLowerCase().includes(mentionSearch))
															.map((m) => (
																<button
																	key={m.id}
																	onClick={() => insertMention(m.initials)}
																	className="w-full text-left p-2 hover:bg-white/5 rounded-xl text-xs flex items-center justify-between cursor-pointer"
																>
																	<div className="flex items-center gap-2">
																		<span className={`size-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${m.color}`}>
																			{m.initials}
																		</span>
																		<span className="font-semibold text-neutral-200">{m.name}</span>
																	</div>
																	<span className="text-[10px] text-neutral-500 font-mono">@{m.initials}</span>
																</button>
															))}
													</div>
												</ScrollArea>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Create Org Modal */}
			<AnimatePresence>
				{showNewOrgModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6"
						>
							<div className="space-y-1.5 border-b border-white/5 pb-3">
								<h3 className="text-md font-bold text-white">Create Organization</h3>
								<p className="text-xs text-neutral-500 font-light">Add a new organization workspace to start categorizing projects.</p>
							</div>
							<form onSubmit={handleCreateOrg} className="space-y-4">
								<div className="space-y-1">
									<label htmlFor="org-name" className="text-xs font-semibold text-neutral-400">Org Name</label>
									<Input
										id="org-name"
										type="text"
										placeholder="e.g. Acme Core Engineering"
										value={newOrgName}
										onChange={(e) => setNewOrgName(e.target.value)}
										className="w-full bg-white/5 border-neutral-800 focus:border-primary text-xs rounded-xl"
										autoFocus
									/>
								</div>
								<div className="flex justify-end gap-2 pt-2 border-t border-white/5">
									<button
										type="button"
										onClick={() => setShowNewOrgModal(false)}
										className="px-4 py-2 hover:bg-white/5 text-neutral-400 text-xs font-semibold rounded-xl cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer"
									>
										Create
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Create Project Modal */}
			<AnimatePresence>
				{showNewProjectModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6"
						>
							<div className="space-y-1.5 border-b border-white/5 pb-3">
								<h3 className="text-md font-bold text-white">Create Project</h3>
								<p className="text-xs text-neutral-500 font-light">Add a project space to begin tracking boards.</p>
							</div>
							<form onSubmit={handleCreateProject} className="space-y-4">
								<div className="space-y-1">
									<label htmlFor="project-name" className="text-xs font-semibold text-neutral-400">Project Title</label>
									<Input
										id="project-name"
										type="text"
										placeholder="e.g. Mobile Design Sprint"
										value={newProjName}
										onChange={(e) => setNewProjName(e.target.value)}
										className="w-full bg-white/5 border-neutral-800 focus:border-primary text-xs rounded-xl"
										autoFocus
									/>
								</div>
								<div className="flex justify-end gap-2 pt-2 border-t border-white/5">
									<button
										type="button"
										onClick={() => setShowNewProjectModal(false)}
										className="px-4 py-2 hover:bg-white/5 text-neutral-400 text-xs font-semibold rounded-xl cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer"
									>
										Create
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Create Task Modal */}
			<AnimatePresence>
				{showNewTaskModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6"
						>
							<div className="space-y-1.5 border-b border-white/5 pb-3">
								<h3 className="text-md font-bold text-white">Create Task</h3>
								<p className="text-xs text-neutral-500 font-light">Add a task item with statuses and multiple assignees.</p>
							</div>
							<form onSubmit={handleCreateTask} className="space-y-4">
								<div className="space-y-1">
									<label htmlFor="task-title" className="text-xs font-semibold text-neutral-400">Task Title</label>
									<Input
										id="task-title"
										type="text"
										placeholder="e.g. Finalize UI layouts"
										value={newTaskTitle}
										onChange={(e) => setNewTaskTitle(e.target.value)}
										className="w-full bg-white/5 border-neutral-800 focus:border-primary text-xs rounded-xl"
										autoFocus
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1">
										<label htmlFor="task-status" className="text-xs font-semibold text-neutral-400">Status</label>
										<select
											id="task-status"
											value={newTaskStatus}
											onChange={(e) => setNewTaskStatus(e.target.value as Task["status"])}
											className="w-full bg-neutral-900 border border-neutral-800 focus:border-primary text-xs rounded-xl p-2.5 outline-none cursor-pointer"
										>
											<option value="todo">To Do</option>
											<option value="in_progress">In Progress</option>
											<option value="in_review">In Review</option>
											<option value="done">Done</option>
										</select>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-semibold text-neutral-400">Assign Members</label>
										<div className="flex gap-1 overflow-x-auto py-1 max-w-[200px]">
											{members.map((m) => {
												const active = newTaskAssignees.includes(m.id);
												return (
													<button
														key={m.id}
														type="button"
														onClick={() => {
															if (active) {
																setNewTaskAssignees(newTaskAssignees.filter((id) => id !== m.id));
															} else {
																setNewTaskAssignees([...newTaskAssignees, m.id]);
															}
														}}
														className={`size-6 rounded-full text-[8px] font-bold text-white shrink-0 flex items-center justify-center cursor-pointer border ${active ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-neutral-800 opacity-60"} ${m.color}`}
														title={m.name}
													>
														{m.initials}
													</button>
												);
											})}
										</div>
									</div>
								</div>

								<div className="flex justify-end gap-2 pt-2 border-t border-white/5">
									<button
										type="button"
										onClick={() => setShowNewTaskModal(false)}
										className="px-4 py-2 hover:bg-white/5 text-neutral-400 text-xs font-semibold rounded-xl cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer"
									>
										Add Task
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Invite Member Modal */}
			<AnimatePresence>
				{showNewMemberModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6"
						>
							<div className="space-y-1.5 border-b border-white/5 pb-3">
								<h3 className="text-md font-bold text-white">Invite Team Member</h3>
								<p className="text-xs text-neutral-500 font-light">Invite a new colleague to join projects inside this organization workspace.</p>
							</div>
							<form onSubmit={handleAddMember} className="space-y-4">
								<div className="space-y-1">
									<label htmlFor="member-name" className="text-xs font-semibold text-neutral-400">Full Name</label>
									<Input
										id="member-name"
										type="text"
										placeholder="e.g. Sam Wilson"
										value={newMemberName}
										onChange={(e) => setNewMemberName(e.target.value)}
										className="w-full bg-white/5 border-neutral-800 focus:border-primary text-xs rounded-xl"
										autoFocus
									/>
								</div>
								<div className="flex justify-end gap-2 pt-2 border-t border-white/5">
									<button
										type="button"
										onClick={() => setShowNewMemberModal(false)}
										className="px-4 py-2 hover:bg-white/5 text-neutral-400 text-xs font-semibold rounded-xl cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer"
									>
										Invite
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}
