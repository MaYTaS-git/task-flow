"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";

interface MemberInviteFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface MemberInviteInput {
	email: string;
	name: string;
	password?: string;
}

export function MemberInviteForm({ onSuccess, onCancel }: MemberInviteFormProps) {
	const { inviteMemberMutation } = useOrg();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<MemberInviteInput>({
		defaultValues: {
			email: "",
			name: "",
			password: "",
		},
		mode: "onChange",
	});

	const onSubmit = async (data: MemberInviteInput) => {
		try {
			await inviteMemberMutation.mutateAsync({
				email: data.email,
				name: data.name,
				password: data.password || undefined,
			});
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="mem-email" className="text-xs font-semibold text-muted-foreground">
					Email Address
				</Label>
				<Input
					id="mem-email"
					type="email"
					placeholder="e.g. member@company.com"
					className="w-full text-xs rounded-xl"
					autoFocus
					{...register("email", {
						required: "Email is required",
						pattern: {
							value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message: "Invalid email address",
						},
					})}
				/>
				{errors.email && (
					<p className="text-xs text-destructive mt-1">{errors.email.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="mem-name" className="text-xs font-semibold text-muted-foreground">
					Full Name
				</Label>
				<Input
					id="mem-name"
					type="text"
					placeholder="e.g. John Doe"
					className="w-full text-xs rounded-xl"
					{...register("name", { required: "Full name is required" })}
				/>
				{errors.name && (
					<p className="text-xs text-destructive mt-1">{errors.name.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="mem-pass" className="text-xs font-semibold text-muted-foreground">
					Initial Password (Optional)
				</Label>
				<Input
					id="mem-pass"
					type="password"
					placeholder="Leave blank for random generation"
					className="w-full text-xs rounded-xl"
					{...register("password")}
				/>
			</div>

			{inviteMemberMutation.isError && (
				<p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
					{inviteMemberMutation.error instanceof Error
						? inviteMemberMutation.error.message
						: "Failed to invite member. Please try again."}
				</p>
			)}

			<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={inviteMemberMutation.isPending || !isValid}
				>
					{inviteMemberMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Invite Member"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
