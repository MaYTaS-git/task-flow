"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Shield, Trash2 } from "lucide-react";

import { useOrg } from "@/hooks/use-org";
import { useSetHeader } from "@/contexts/header-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/common/member-chip";

// Form imports
import { MemberInviteForm } from "@/components/forms/member-invite-form";
import { MemberPermissionsForm } from "@/components/forms/member-permissions-form";

interface Member {
	id: number;
	name: string | null;
	email: string;
	role: string;
	permissions?: {
		projects?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
		tasks?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
	};
}

export default function MembersPage() {
	const setHeaderData = useSetHeader();
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [showPermissionsModal, setShowPermissionsModal] = useState(false);
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<{ id: number; nameOrEmail: string } | null>(null);

	const { orgDetailsQuery, removeMemberMutation } = useOrg();
	const members = (orgDetailsQuery.data?.members || []) as Member[];
	const userRole = orgDetailsQuery.data?.userRole || "MEMBER";
	const isLoading = orgDetailsQuery.isLoading;
	const isUserAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

	useEffect(() => {
		setHeaderData({
			title: "Workspace Members",
			description: "Manage roles, configure module specific RBAC permission blocks",
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
				<div className="py-20 text-center text-xs text-muted-foreground font-light">Loading members...</div>
			) : (
				<div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-fade-in-up">
					<div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider mb-2">
						<Users className="size-4 text-primary" />
						Workspace Users
						<span className="text-xs font-normal text-muted-foreground ml-1">({members.length})</span>
					</div>

					<div className="divide-y divide-border">
						{members.length === 0 ? (
							<div className="py-6 text-center text-xs text-muted-foreground font-light">
								No members found. Invite your first team member.
							</div>
						) : (
							members.map((member) => (
								<div key={member.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-accent/30 -mx-2 px-2 rounded-xl transition-all duration-150">
									<div className="flex items-center gap-3">
										<MemberAvatar name={member.name} email={member.email} size="default" />
										<div>
											<div className="text-sm font-bold flex items-center gap-2">
												{member.name || "Invite Pending"}
												{member.role === "ADMIN" && (
													<Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-1 py-0.5 rounded">Admin</Badge>
												)}
											</div>
											<div className="text-xs text-muted-foreground font-light">{member.email}</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										{isUserAdmin && member.role !== "ADMIN" && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedMember(member);
													setShowPermissionsModal(true);
												}}
											>
												<Shield className="size-3.5 mr-1" />
												Permissions
											</Button>
										)}

										{isUserAdmin && (
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => setMemberToRemove({ id: member.id, nameOrEmail: member.name || member.email })}
												title="Remove Member"
												className="hover:text-destructive hover:bg-destructive/10"
											>
												<Trash2 className="size-3.5" />
											</Button>
										)}
									</div>
								</div>
							))
						)}
					</div>

					{isUserAdmin && (
						<div className="pt-4 border-t border-border">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowInviteModal(true)}
								className="w-full border-dashed"
							>
								<Plus className="size-4 mr-1.5" /> Invite Member
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Invite Member Modal */}
			<Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">Invite Member</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Provide credentials for the new member to register and sign in.
						</DialogDescription>
					</DialogHeader>
					<MemberInviteForm
						onSuccess={() => setShowInviteModal(false)}
						onCancel={() => setShowInviteModal(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Permissions Dialog */}
			<Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
				{selectedMember && (
					<DialogContent className="max-w-md rounded-3xl p-6">
						<DialogHeader>
							<DialogTitle className="text-lg font-bold">
								Manage Permissions: {selectedMember.name || selectedMember.email}
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
								Toggle specific feature privileges for this user.
							</DialogDescription>
						</DialogHeader>
						<MemberPermissionsForm
							userId={selectedMember.id}
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
					</DialogContent>
				)}
			</Dialog>

			{/* Remove Member Dialog */}
			<Dialog open={memberToRemove !== null} onOpenChange={(open) => !open && setMemberToRemove(null)}>
				<DialogContent className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">Remove Member</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
							Are you sure you want to remove {memberToRemove?.nameOrEmail} from the organization workspace? This action cannot be undone.
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
									removeMemberMutation.mutate(memberToRemove.id);
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
