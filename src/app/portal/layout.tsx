"use client";

import React, { useState, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import {
	redirect,
	usePathname,
	useSearchParams,
} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

import {
	LayoutGrid,
	FolderGit2,
	Users,
	CheckSquare,
	Bell,
	Building2,
	ChevronDown,
	Plus,
	LogOut,
	PanelLeftClose,
	PanelLeft,
	AlertTriangle,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import {
	SidebarProvider,
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	useSidebar,
} from "@/components/ui/sidebar";

import {
	OrganizationProvider,
	useOrganization,
} from "@/contexts/organization-context";
import { SessionProvider, useUserSession } from "@/contexts/session-context";
import { ThemeSelector } from "@/components/common/theme-selector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrgCreateForm } from "@/components/forms/org-create-form";

type LayoutProps = {
	children: React.ReactNode;
};

function SidebarTriggerButton() {
	const { toggleSidebar, state } = useSidebar();
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			onClick={toggleSidebar}
			title={state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
		>
			{state === "expanded" ? (
				<PanelLeftClose className="size-4" />
			) : (
				<PanelLeft className="size-4" />
			)}
		</Button>
	);
}

function SidebarProjectsSubmenu({
	projects,
	pathname,
}: {
	projects: { id: number; name: string }[];
	pathname: string;
}) {
	const searchParams = useSearchParams();
	const activeProjectId = searchParams.get("id");
	return (
		<SidebarMenuSub>
			{projects.map((proj) => {
				const isSubActive =
					pathname === "/portal/projects/view" &&
					activeProjectId === proj.id.toString();
				return (
					<SidebarMenuSubItem key={proj.id}>
						<SidebarMenuSubButton
							render={
								<Link
									href={`/portal/projects/view?id=${proj.id}`}
								/>
							}
							isActive={isSubActive}
						>
							<div className="size-1.5 rounded-full bg-muted-foreground mr-2 shrink-0" />
							<span className="truncate">{proj.name}</span>
						</SidebarMenuSubButton>
					</SidebarMenuSubItem>
				);
			})}
		</SidebarMenuSub>
	);
}

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const session = useUserSession();
	const user = session.user;
	const { toggleSidebar, state } = useSidebar();
	const { headerData } = useHeader();

	const { organizations, activeOrg, activeOrgId, setActiveOrgId } =
		useOrganization();

	const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

	const { data: projects = [] } = useQuery({
		queryKey: ["projects", activeOrgId],
		queryFn: async () => {
			if (!activeOrgId) return [];
			const res = await api.projects.get({
				query: { orgId: activeOrgId.toString() },
			});
			if (res.error || !res.data) {
				console.error(
					"Failed to fetch projects for sidebar:",
					res.error,
				);
				return [];
			}
			return res.data as { id: number; name: string }[];
		},
		enabled: !!activeOrgId,
	});

	const navItems = [
		{ name: "Dashboard", href: "/portal/dashboard", icon: LayoutGrid },
		{
			name: "Projects",
			href: "/portal/projects",
			icon: FolderGit2,
			hasSubmenu: projects.length > 0,
		},
		{ name: "Members", href: "/portal/members", icon: Users },
		{ name: "Tasks", href: "/portal/tasks", icon: CheckSquare },
		{ name: "Notifications", href: "/portal/notifications", icon: Bell },
	];

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
			<Sidebar className="border-r border-border bg-sidebar">
				<SidebarHeader className="flex flex-row items-center justify-between p-4 border-b border-border h-20">
					<Link
						href="/portal/dashboard"
						className="flex items-center gap-2.5 group cursor-pointer select-none"
					>
						<div className="p-2 bg-muted rounded-xl border border-border shadow-inner group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
							<Image
								src="/icons/apple-touch-icon.png"
								alt="TaskFlow Logo"
								width={20}
								height={20}
								className="object-contain"
							/>
						</div>
						<span className="text-md font-bold tracking-tight text-sidebar-foreground transition-colors">
							TaskFlow
						</span>
					</Link>

					{/* Toggle shrink button */}
					<SidebarTriggerButton />
				</SidebarHeader>

				<SidebarContent className="p-3 space-y-4">
					{/* Organization Dropdown Switcher */}
					<div className="space-y-1">
						<div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-3 mb-1">
							Workspace
						</div>
						{organizations.length > 0 ? (
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button
											variant="outline"
											className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl cursor-pointer"
										/>
									}
								>
									<div className="flex items-center gap-2 max-w-[80%]">
										<Building2 className="size-4 text-sidebar-primary shrink-0" />
										<span className="truncate text-sm font-semibold">
											{activeOrg?.name}
										</span>
									</div>
									<ChevronDown className="size-4 text-muted-foreground shrink-0" />
								</DropdownMenuTrigger>
								<DropdownMenuPortal>
									<DropdownMenuContent className="w-[var(--anchor-width)] min-w-48 p-1.5 rounded-2xl">
										{organizations.map((org) => (
											<DropdownMenuItem
												key={org.id}
												onClick={() =>
													setActiveOrgId(org.id)
												}
												className="cursor-pointer rounded-xl text-xs"
											>
												<Building2 className="size-3.5 text-muted-foreground mr-2" />
												{org.name}
											</DropdownMenuItem>
										))}
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												setShowCreateOrgModal(true)
											}
											className="text-primary focus:bg-primary/5 cursor-pointer font-medium rounded-xl text-xs"
										>
											<Plus className="size-4 mr-1.5" />
											Create Org
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenuPortal>
							</DropdownMenu>
						) : (
							<Button
								variant="outline"
								onClick={() => setShowCreateOrgModal(true)}
								className="w-full border-dashed"
							>
								<Plus className="size-4" />
								Create Org
							</Button>
						)}
					</div>

					{/* Navigation Links */}
					<div className="space-y-1">
						<div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-3 mb-1">
							Navigation
						</div>
						<SidebarMenu>
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									pathname.startsWith(item.href + "/");
								const Icon = item.icon;
								return (
									<SidebarMenuItem key={item.name}>
										<div className="flex items-center justify-between w-full">
											<SidebarMenuButton
												render={
													<Link href={item.href} />
												}
												isActive={isActive}
												className="flex-1 transition-all duration-150"
											>
												<Icon className="size-4 mr-2" />
												<span>{item.name}</span>
											</SidebarMenuButton>

											{item.hasSubmenu && (
												<Button
													variant="ghost"
													size="icon-sm"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setIsProjectsExpanded(
															!isProjectsExpanded,
														);
													}}
													className="size-7 rounded-lg hover:bg-accent shrink-0 text-muted-foreground mr-1"
												>
													<ChevronDown
														className={`size-3.5 transition-transform duration-200 ${
															isProjectsExpanded
																? "rotate-0"
																: "-rotate-90"
														}`}
													/>
												</Button>
											)}
										</div>

										{item.name === "Projects" &&
											item.hasSubmenu &&
											isProjectsExpanded && (
												<Suspense
													fallback={
														<div className="pl-6 py-2 text-xs text-muted-foreground font-light">
															Loading...
														</div>
													}
												>
													<SidebarProjectsSubmenu
														projects={projects}
														pathname={pathname}
													/>
												</Suspense>
											)}
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</div>
				</SidebarContent>
			</Sidebar>

			{/* Main Content Pane */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
				{/* Top Header */}
				<header className="h-20 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
					{/* Left: Open sidebar button when closed + Page title & description */}
					<div className="flex items-center gap-4 min-w-0">
						{state === "collapsed" && (
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={toggleSidebar}
								title="Expand Sidebar"
							>
								<PanelLeft className="size-4" />
							</Button>
						)}
						{headerData && (
							<div className="min-w-0 animate-fade-in">
								<h1 className="text-sm font-bold tracking-tight flex items-center gap-2 truncate">
									{headerData.title}
								</h1>
								{headerData.description && (
									<p className="text-xs text-muted-foreground font-medium tracking-wide truncate hidden sm:block">
										{headerData.description}
									</p>
								)}
							</div>
						)}
					</div>

					{/* Right: page actions + theme selector + user profile chip + logout */}
					<div className="flex items-center gap-3 shrink-0">
						{headerData?.actions && (
							<div className="flex items-center gap-2">
								{headerData.actions}
							</div>
						)}
						<ThemeSelector />

						{/* User profile chip */}
						<Link href="/portal/profile" title="My Profile">
							<div className="flex items-center gap-2 px-2 py-1 bg-muted border border-border rounded-full hover:border-primary/50 transition-all duration-200 outline-none group cursor-pointer hover:shadow-sm">
								<Avatar className="size-7">
									<AvatarImage
										src={user?.image || ""}
										alt={user?.name || ""}
									/>
									<AvatarFallback className="text-[10px]">
										{user?.name
											? user.name[0].toUpperCase()
											: "U"}
									</AvatarFallback>
								</Avatar>
								<span className="text-xs font-semibold text-foreground/80 pr-2 group-hover:text-foreground transition-colors max-w-[120px] truncate inline-block">
									{user?.name || "User Portal"}
								</span>
							</div>
						</Link>

						<Button
							variant="outline"
							size="icon"
							onClick={() => setShowLogoutConfirm(true)}
							title="Log Out"
							className="transition-all duration-150 hover:border-destructive/50 hover:text-destructive"
						>
							<LogOut className="size-4" />
						</Button>
					</div>
				</header>

				{activeOrgId === null || organizations.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
						<div className="p-4 bg-primary/10 border border-primary/20 rounded-full text-primary animate-breathe">
							<Building2 className="size-12" />
						</div>
						<div className="space-y-2 max-w-md animate-fade-in-up">
							<h2 className="text-2xl font-bold tracking-tight">
								Organization Required
							</h2>
							<p className="text-sm text-muted-foreground font-light">
								You must belong to or create an organization
								workspace to access the dashboard, projects,
								tasks, members, and notifications.
							</p>
						</div>
						<Button
							onClick={() => setShowCreateOrgModal(true)}
							size="lg"
							className="animate-fade-in-up"
						>
							<Plus className="size-4 mr-2" />
							Create Organization
						</Button>
					</div>
				) : (
					<ScrollArea className="h-[calc(100vh-5rem)] w-full">
						{children}
					</ScrollArea>
				)}
			</div>

			{/* Create Org Modal */}
			<Dialog
				open={showCreateOrgModal}
				onOpenChange={setShowCreateOrgModal}
			>
				<OrgCreateForm
					onSuccess={() => setShowCreateOrgModal(false)}
					onCancel={() => setShowCreateOrgModal(false)}
				/>
			</Dialog>

			{/* Logout Confirmation Dialog */}
			<Dialog
				open={showLogoutConfirm}
				onOpenChange={setShowLogoutConfirm}
			>
				<DialogContent className="max-w-sm rounded-3xl p-6">
					<DialogHeader>
						<div className="flex items-center gap-3 mb-1">
							<div className="p-2 bg-destructive/10 rounded-full">
								<AlertTriangle className="size-5 text-destructive" />
							</div>
							<DialogTitle className="text-base font-bold">
								Sign Out?
							</DialogTitle>
						</div>
						<DialogDescription className="text-xs text-muted-foreground font-light">
							You will be signed out of your account and
							redirected to the login page. Any unsaved work may
							be lost.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
						<Button
							variant="ghost"
							onClick={() => setShowLogoutConfirm(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => signOut({ callbackUrl: "/" })}
						>
							<LogOut className="size-4 mr-1.5" />
							Sign Out
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-background">
				<Spinner className="size-10" />
			</div>
		);
	}

	if (status === "unauthenticated" || !session) {
		redirect("/login");
	}

	return (
		<SessionProvider session={session}>
			<OrganizationProvider>
				<SidebarProvider>
					<HeaderProvider>
						<PortalLayoutContent>{children}</PortalLayoutContent>
					</HeaderProvider>
				</SidebarProvider>
			</OrganizationProvider>
		</SessionProvider>
	);
};

export default Layout;
