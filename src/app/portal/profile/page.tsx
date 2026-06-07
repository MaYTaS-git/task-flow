"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Shield, Mail } from "lucide-react";

import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSetHeader } from "@/contexts/header-context";

// Form import
import { ProfileForm } from "@/components/forms/profile-form";

export default function ProfilePage() {
	const { data: session } = useSession();
	const router = useRouter();
	const user = session?.user;
	const setHeaderData = useSetHeader();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	useEffect(() => {
		setHeaderData({
			title: "User Profile",
			description: "Manage your personal profile, credentials, and account settings",
		});
		return () => setHeaderData(null);
	}, [setHeaderData]);

	const deleteAccountMutation = useMutation({
		mutationFn: async () => {
			const res = await api.users["delete-account"].delete();
			if (res.error) {
				throw new Error((res.error.value as { error?: string })?.error || "Failed to delete account");
			}
			return res.data;
		},
		onSuccess: (data: { message?: string }) => {
			toast.success(data.message || "Account permanently deleted.");
			router.push("/login");
		},
		onError: (err) => {
			toast.error(err.message);
			setShowDeleteConfirm(false);
		},
	});

	const handleDeleteAccount = () => {
		deleteAccountMutation.mutate();
	};

	const initials = user?.name
		? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
		: user?.email?.substring(0, 2).toUpperCase() || "U";

	return (
		<div className="p-6 sm:p-8 space-y-8 max-w-3xl mx-auto pb-12 w-full">
			{/* Profile Details Card */}
			<div className="p-6 bg-muted/20 border border-border rounded-lg space-y-6">
				<div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-6">
					<Avatar className="size-20 border-2 border-border">
						<AvatarImage src={user?.image || ""} alt={user?.name || ""} />
						<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
					</Avatar>
					<div className="text-center sm:text-left space-y-1">
						<h2 className="text-lg font-bold text-foreground leading-tight">
							{user?.name || "User Portal"}
						</h2>
						<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								<Mail className="size-3.5" /> {user?.email}
							</span>
							<span className="text-muted-foreground/30">•</span>
							<span className="flex items-center gap-1">
								<Shield className="size-3.5" />
								<Badge variant="outline" className="border-border text-muted-foreground capitalize py-0 px-1.5 text-[10px]">
									{((user as unknown) as { role?: string })?.role?.toLowerCase() || "member"}
								</Badge>
							</span>
						</div>
					</div>
				</div>

				<ProfileForm
					initialName={user?.name || ""}
					initialImage={user?.image || ""}
				/>
			</div>

			{/* Danger Zone */}
			<div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg space-y-4">
				<h3 className="text-sm font-bold text-destructive uppercase tracking-wider">Danger Zone</h3>
				<p className="text-xs text-foreground leading-relaxed font-light">
					Permanently delete your account and all associated work data. This action is irreversible.
					Please note that if you are the creator or owner of any organizations, you must delete them first before you can proceed.
				</p>
				<div>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteConfirm(true)}
					>
						<Trash2 className="size-4 mr-2" />
						Delete Account
					</Button>
				</div>
			</div>

			{/* Delete Confirm Dialog */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent className="max-w-md bg-background border border-border text-foreground rounded-lg p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
							<Trash2 className="size-5 text-destructive" />
							Delete Account?
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground font-light mt-1.5 leading-relaxed">
							Are you absolutely sure you want to permanently delete your account? This will cascade-delete all your assignments, task durations, and user credentials.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setShowDeleteConfirm(false)}
							className="text-muted-foreground hover:text-foreground"
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={deleteAccountMutation.isPending}
							onClick={handleDeleteAccount}
						>
							{deleteAccountMutation.isPending ? "Deleting..." : "Permanently Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
