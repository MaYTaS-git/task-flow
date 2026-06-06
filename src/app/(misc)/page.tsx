"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Building2,
	KanbanSquare,
	Users2,
	MessageSquareShare,
	BarChart3,
	Zap,
	CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";

export default function LandingPage() {
	return (
		<ScrollArea className="h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20 relative">
			{/* Grid & Radial Glowing Gradients */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] pointer-events-none" />
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

			{/* Header Navigation */}
			<Header />

			{/* Main Landing Content */}
			<main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32 space-y-36">
				{/* Hero Section */}
				<section className="text-center max-w-4xl mx-auto space-y-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-semibold"
					>
						<Zap className="size-3.5 text-primary" />
						All-In-One Workspace Management
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] bg-linear-to-b from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
					>
						Unite your teams.
						<br />
						Ship projects faster.
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-lg sm:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed"
					>
						Create organizations, isolate projects, assign tasks to
						multiple members, and collaborate in real-time with rich
						mentions and metrics dashboard.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="flex items-center justify-center gap-4 pt-4"
					>
						<Button render={<Link href="/login" />} size="lg">
							Start Now
							<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
						</Button>
					</motion.div>
				</section>

				{/* Features Presentation & Interactive Mockups */}
				<section className="space-y-20">
					<div className="text-center max-w-2xl mx-auto space-y-4">
						<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
							Engineered for modern workflow speed
						</h2>
						<p className="text-sm text-muted-foreground leading-relaxed font-light">
							Ditch single-assignee silos and disconnected chats.
							Work together seamlessly.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Feature Card 1 */}
						<motion.div
							whileHover={{ y: -5 }}
							className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-md flex flex-col justify-between h-72 group transition-all"
						>
							<div className="p-3 bg-muted border border-border rounded-2xl w-fit">
								<Building2 className="size-6 text-indigo-500 dark:text-indigo-400" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
									Organizations & Workspaces
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Build organization-level containers,
									partition departments into specific
									projects, and configure user spaces.
								</p>
							</div>
						</motion.div>

						{/* Feature Card 2 */}
						<motion.div
							whileHover={{ y: -5 }}
							className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-md flex flex-col justify-between h-72 group transition-all"
						>
							<div className="p-3 bg-muted border border-border rounded-2xl w-fit">
								<KanbanSquare className="size-6 text-emerald-500 dark:text-emerald-400" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
									Flexible Kanban Status Boards
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Assign tasks to multiple statuses like To
									Do, In Progress, In Review, or Done. Drag,
									drop, and view clear timelines.
								</p>
							</div>
						</motion.div>

						{/* Feature Card 3 */}
						<motion.div
							whileHover={{ y: -5 }}
							className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-md flex flex-col justify-between h-72 group transition-all"
						>
							<div className="p-3 bg-muted border border-border rounded-2xl w-fit">
								<Users2 className="size-6 text-pink-500 dark:text-pink-400" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
									Multi-Member Assignments
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Stop limiting tasks to one person. Assign
									multiple members to complex projects and
									collaborate collectively.
								</p>
							</div>
						</motion.div>

						{/* Feature Card 4 */}
						<motion.div
							whileHover={{ y: -5 }}
							className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-md flex flex-col justify-between h-72 group transition-all"
						>
							<div className="p-3 bg-muted border border-border rounded-2xl w-fit">
								<MessageSquareShare className="size-6 text-amber-500 dark:text-amber-400" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
									Colleague Mentions (@Name)
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Post updates inside task comments and query
									or reference team members using `@name`
									tokens for rapid loops.
								</p>
							</div>
						</motion.div>

						{/* Feature Card 5 */}
						<motion.div
							whileHover={{ y: -5 }}
							className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-md flex flex-col justify-between h-72 group transition-all"
						>
							<div className="p-3 bg-muted border border-border rounded-2xl w-fit">
								<BarChart3 className="size-6 text-purple-500 dark:text-purple-400" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
									Visual Analytics Dashboard
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Analyze workspace health, review task
									completion rate charts, and filter statuses
									to track overall progress.
								</p>
							</div>
						</motion.div>

						{/* Feature Card 6 */}
						<motion.div
							whileHover={{ y: -5 }}
							className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-md flex flex-col justify-between h-72 group transition-all"
						>
							<div className="p-3 bg-muted border border-border rounded-2xl w-fit">
								<CheckCircle2 className="size-6 text-cyan-500 dark:text-cyan-400" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
									Premium Design & Security
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Experience dark/light themes, sleek
									animations, secure Dynamic NextAuth session
									lifetimes, and Typebox validation.
								</p>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Visual Showcase (Mockup Layout) */}
				<section className="p-1.5 rounded-3xl border border-border bg-muted relative overflow-hidden group">
					<div className="absolute inset-0 bg-linear-to-b from-primary/5 dark:from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
					<div className="rounded-2xl border border-border bg-background p-6 sm:p-8 space-y-6">
						{/* Mockup Header */}
						<div className="flex items-center justify-between border-b border-border pb-4">
							<div className="flex items-center gap-3">
								<span className="size-3 rounded-full bg-red-500/80" />
								<span className="size-3 rounded-full bg-yellow-500/80" />
								<span className="size-3 rounded-full bg-green-500/80" />
								<span className="text-xs text-muted-foreground font-mono ml-4 select-none">
									workspace://taskflow-dashboard
								</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="w-16 h-1.5 rounded-full bg-muted" />
								<span className="w-12 h-1.5 rounded-full bg-muted/60" />
							</div>
						</div>

						{/* Mockup Dashboard Body */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							{/* Sidebar Mockup */}
							<div className="space-y-4 md:col-span-1 border-r border-border pr-4 hidden md:block">
								<div className="p-3 bg-muted border border-border rounded-xl flex items-center justify-between">
									<span className="text-xs font-bold text-foreground">
										Acme Corp
									</span>
									<span className="text-[10px] text-muted-foreground">
										v1.0
									</span>
								</div>
								<div className="space-y-1.5 pt-2">
									<span className="block h-6 w-3/4 rounded-md bg-muted" />
									<span className="block h-6 w-5/6 rounded-md bg-muted/50" />
									<span className="block h-6 w-2/3 rounded-md bg-muted/50" />
									<span className="block h-6 w-1/2 rounded-md bg-muted/50" />
								</div>
							</div>

							{/* Main Content Mockup */}
							<div className="md:col-span-3 space-y-6">
								{/* Charts & Status Mockup */}
								<div className="grid grid-cols-3 gap-4">
									<div className="p-4 bg-muted border border-border rounded-2xl space-y-2">
										<span className="text-[10px] uppercase text-muted-foreground tracking-wider">
											Completed
										</span>
										<span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
											84%
										</span>
									</div>
									<div className="p-4 bg-muted border border-border rounded-2xl space-y-2">
										<span className="text-[10px] uppercase text-muted-foreground tracking-wider">
											Active Tasks
										</span>
										<span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">
											12
										</span>
									</div>
									<div className="p-4 bg-muted border border-border rounded-2xl space-y-2">
										<span className="text-[10px] uppercase text-muted-foreground tracking-wider">
											Team Capacity
										</span>
										<span className="block text-2xl font-bold text-pink-600 dark:text-pink-400">
											92%
										</span>
									</div>
								</div>

								{/* Kanban Board Mockup */}
								<div className="grid grid-cols-3 gap-4">
									<div className="p-3 bg-muted border border-border rounded-xl space-y-3">
										<div className="flex justify-between items-center border-b border-border pb-1.5">
											<span className="text-xs font-bold text-foreground/80">
												To Do
											</span>
											<span className="size-4 text-[9px] bg-muted rounded-full flex items-center justify-center font-bold">
												2
											</span>
										</div>
										<div className="p-2.5 bg-background border border-border rounded-lg space-y-1.5">
											<span className="block h-3 w-5/6 rounded-sm bg-muted" />
											<div className="flex gap-1">
												<span className="size-4 rounded-full bg-purple-500 text-[8px] flex items-center justify-center text-white">
													A
												</span>
												<span className="size-4 rounded-full bg-emerald-500 text-[8px] flex items-center justify-center text-white">
													B
												</span>
											</div>
										</div>
									</div>

									<div className="p-3 bg-muted border border-border rounded-xl space-y-3">
										<div className="flex justify-between items-center border-b border-border pb-1.5">
											<span className="text-xs font-bold text-foreground/80">
												In Progress
											</span>
											<span className="size-4 text-[9px] bg-muted rounded-full flex items-center justify-center font-bold">
												1
											</span>
										</div>
										<div className="p-2.5 bg-background border border-border rounded-lg space-y-1.5">
											<span className="block h-3 w-4/5 rounded-sm bg-muted" />
											<div className="flex gap-1">
												<span className="size-4 rounded-full bg-pink-500 text-[8px] flex items-center justify-center text-white">
													C
												</span>
											</div>
										</div>
									</div>

									<div className="p-3 bg-muted border border-border rounded-xl space-y-3">
										<div className="flex justify-between items-center border-b border-border pb-1.5">
											<span className="text-xs font-bold text-foreground/80">
												Done
											</span>
											<span className="size-4 text-[9px] bg-muted rounded-full flex items-center justify-center font-bold">
												4
											</span>
										</div>
										<div className="p-2.5 bg-background border border-border rounded-lg space-y-1.5">
											<span className="block h-3 w-full rounded-sm bg-muted" />
											<span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
												✓ Completed
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Bottom Conversion Section */}
				<section className="p-12 rounded-3xl border border-border bg-radial-[at_50%_0%] from-primary/5 to-transparent text-center space-y-6 max-w-4xl mx-auto">
					<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						Ready to unlock team velocity?
					</h2>
					<p className="text-base text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
						Join thousands of projects shipping high-fidelity
						products in centralized, multi-assignee workspaces
						today.
					</p>
					<div className="pt-2">
						<Button render={<Link href="/login" />} size="lg">
							Get Started
							<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
						</Button>
					</div>
				</section>
			</main>

			<Footer />
		</ScrollArea>
	);
}
