"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Shield, Trash2 } from "lucide-react";

import { useOrg } from "@/hooks/use-org";
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
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/common/member-chip";

// Form imports
import { MemberInviteForm } from "@/components/forms/member-invite-form";
import { MemberPermissionsForm } from "@/components/forms/member-permissions-form";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { MemberDetailSheet } from "@/components/common/member-detail-sheet";

interface Member {
	id: number;
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
	};
}

export default function MembersPage() {
	const setHeaderData = useSetHeader();
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [showPermissionsModal, setShowPermissionsModal] = useState(false);
	const [showDetailSheet, setShowDetailSheet] = useState(false);
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<{
		id: number;
		nameOrEmail: string;
	} | null>(null);

	const { orgDetailsQuery, removeMemberMutation } = useOrg();
	const members = (orgDetailsQuery.data?.members || []) as Member[];
	const userRole = orgDetailsQuery.data?.userRole || "MEMBER";
	const isLoading = orgDetailsQuery.isLoading;
	const isUserAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

	useEffect(() => {
		setHeaderData({
			title: "Workspace Members",
			description:
				"Manage roles, configure module specific RBAC permission blocks",
			actions: isUserAdmin ? (
				<Button onClick={() => setShowInviteModal(true)} size="sm">
					<Plus className="size-3.5 mr-1" /> Invite Member
				</Button>
			) : null,
		});
		return () => setHeaderData(null);
	}, [setHeaderData, isUserAdmin]);

	return (
		<div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-12">
			{isLoading ? (
				<div className="py-20 text-center text-xs text-muted-foreground font-light">
					Loading members...
				</div>
			) : (
				<div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-fade-in-up">
					<div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider mb-2">
						<Users className="size-4 text-primary" />
						Workspace Users
						<span className="text-xs font-normal text-muted-foreground ml-1">
							({members.length})
						</span>
					</div>

					<div className="border border-border rounded-2xl overflow-hidden">
						<Table>
							<TableHeader className="bg-muted/30">
								<TableRow className="hover:bg-transparent">
									<TableHead className="w-[300px] text-[10px] uppercase font-bold tracking-wider">Member</TableHead>
									<TableHead className="text-[10px] uppercase font-bold tracking-wider">Role</TableHead>
									<TableHead className="text-right text-[10px] uppercase font-bold tracking-wider">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{members.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="h-32 text-center text-xs text-muted-foreground font-light">
											No members found. Invite your first team member.
										</TableCell>
									</TableRow>
								) : (
									members.map((member) => (
										<TableRow
											key={member.id}
											className="cursor-pointer group"
											onClick={() => {
												setSelectedMember(member);
												setShowDetailSheet(true);
											}}
										>
											<TableCell>
												<div className="flex items-center gap-3">
													<MemberAvatar
														name={member.name}
														email={member.email}
														image={member.image}
														size="default"
													/>
													<div>
														<div className="text-sm font-bold group-hover:text-primary transition-colors">
															{member.name || "Invite Pending"}
														</div>
														<div className="text-xs text-muted-foreground font-light">
															{member.email}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{member.role === "ADMIN" ? (
													<Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
														Admin
													</Badge>
												) : (
													<Badge variant="outline" className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground border-border">
														Member
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
													{isUserAdmin && member.role !== "ADMIN" && (
														<Button
															variant="outline"
															size="sm"
															className="h-8 text-[10px] px-3"
															onClick={() => {
																setSelectedMember(member);
																setShowPermissionsModal(true);
															}}
														>
															<Shield className="size-3 mr-1" />
															Permissions
														</Button>
													)}

													{isUserAdmin && member.role !== "ADMIN" && (
														<Button
															variant="ghost"
															size="icon-sm"
															className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
															onClick={() =>
																setMemberToRemove({
																	id: member.id,
																	nameOrEmail: member.name || member.email,
																})
															}
															title="Remove Member"
														>
															<Trash2 className="size-3.5" />
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{/* Member Detail Sheet */}
			{selectedMember && (
				<MemberDetailSheet
					memberId={selectedMember.id}
					name={selectedMember.name}
					email={selectedMember.email}
					image={selectedMember.image}
					role={selectedMember.role}
					permissions={selectedMember.permissions || {}}
					open={showDetailSheet}
					onOpenChange={(open) => {
						setShowDetailSheet(open);
						if (!open && !showPermissionsModal) setSelectedMember(null);
					}}
				/>
			)}

			{/* Invite Member Modal */}
			<Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
				<MemberInviteForm
					onSuccess={() => setShowInviteModal(false)}
					onCancel={() => setShowInviteModal(false)}
				/>
			</Dialog>

			{/* Permissions Dialog */}
			<Dialog
				open={showPermissionsModal}
				onOpenChange={setShowPermissionsModal}
			>
				{selectedMember && (
					<MemberPermissionsForm
						userId={selectedMember.id}
						userNameOrEmail={
							selectedMember.name || selectedMember.email
						}
						initialPermissions={selectedMember.permissions || {}}
						onSuccess={() => {
							setShowPermissionsModal(false);
							setSelectedMember(null);
						}}
						onCancel={() => {
							setShowPermissionsModal(false);
							setSelectedMember(null);
						}}
					/>
				)}
			</Dialog>

			{/* Remove Member Dialog */}
			<Dialog
				open={memberToRemove !== null}
				onOpenChange={(open) => !open && setMemberToRemove(null)}
			>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">
							Remove Member
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Are you sure you want to remove{" "}
							{memberToRemove?.nameOrEmail} from the organization
							workspace? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
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
									removeMemberMutation.mutate(
										memberToRemove.id,
									);
									setMemberToRemove(null);
								}
							}}
						>
							Remove
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
