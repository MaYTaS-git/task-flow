"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";

interface MemberInviteFormProps {
	initialData?: {
		email: string;
		name: string;
	};
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface MemberInviteInput {
	email: string;
	name: string;
	password?: string;
}

const generatePassword = () => {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let password = "";
	for (let i = 0; i < 8; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
};

export function MemberInviteForm({
	initialData,
	onSuccess,
	onCancel,
}: MemberInviteFormProps) {
	const { inviteMemberMutation } = useOrg();
	const [credentials, setCredentials] = useState<{
		email: string;
		password: string;
	} | null>(null);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const isEditing = !!initialData;

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<MemberInviteInput>({
		defaultValues: {
			email: initialData?.email || "",
			name: initialData?.name || "",
			password: "",
		},
		mode: "onChange",
	});

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		toast.success(`${field} copied to clipboard`);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const onSubmit = async (data: MemberInviteInput) => {
		try {
			const isRandom = !data.password;
			const passwordToUse = data.password || generatePassword();
			await inviteMemberMutation.mutateAsync({
				email: data.email,
				name: data.name,
				password: passwordToUse,
			});

			if (isRandom) {
				setCredentials({ email: data.email, password: passwordToUse });
			} else {
				if (onSuccess) onSuccess();
			}
		} catch (err) {
			console.error(err);
		}
	};

	if (credentials) {
		return (
			<DialogContent className="max-w-md rounded-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
				<DialogHeader className="p-6 pb-2">
					<div className="flex items-center gap-3 mb-2">
						<div className="size-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
							<ShieldCheck className="size-5 text-primary" />
						</div>
						<DialogTitle className="text-xl font-bold">
							Member Invited Successfully
						</DialogTitle>
					</div>
					<DialogDescription className="text-xs text-muted-foreground font-light ml-1">
						Please share these credentials with the team member.
						For security, they will not be shown again.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 min-h-0">
					<div className="p-6 space-y-4">
						<div className="space-y-2">
							<Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">
								Email Address
							</Label>
							<InputGroup className="h-11 rounded-lg">
								<InputGroupInput
									value={credentials.email}
									readOnly
									className="font-medium"
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										size="icon-sm"
										className="hover:bg-primary/10 hover:text-primary transition-colors"
										onClick={() =>
											copyToClipboard(
												credentials.email,
												"Email",
											)
										}
									>
										{copiedField === "Email" ? (
											<Check className="size-4" />
										) : (
											<Copy className="size-4" />
										)}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div className="space-y-2">
							<Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">
								Password
							</Label>
							<InputGroup className="h-11 rounded-lg">
								<InputGroupInput
									value={credentials.password}
									readOnly
									type="text"
									className="font-mono font-bold tracking-wider"
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										size="icon-sm"
										className="hover:bg-primary/10 hover:text-primary transition-colors"
										onClick={() =>
											copyToClipboard(
												credentials.password,
												"Password",
											)
										}
									>
										{copiedField === "Password" ? (
											<Check className="size-4" />
										) : (
											<Copy className="size-4" />
										)}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter className="p-6 pt-2 border-t border-border">
					<Button
						onClick={() => {
							if (onSuccess) onSuccess();
						}}
						className="w-full rounded-lg h-11 font-bold"
					>
						Done
					</Button>
				</DialogFooter>
			</DialogContent>
		);
	}

	return (
		<DialogContent className="max-w-md rounded-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
			<DialogHeader className="p-6 pb-2">
				<DialogTitle className="text-lg font-bold">
					{isEditing ? "Edit Member" : "Invite Member"}
				</DialogTitle>
				<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
					{isEditing
						? "Update team member profile information."
						: "Add a team member to collaborate on projects inside this organization workspace."}
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 min-h-0">
				<form
					id="member-invite-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6 space-y-6"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="mem-email"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Email Address
							</Label>
							<Input
								id="mem-email"
								type="email"
								placeholder="e.g. member@company.com"
								className="w-full text-sm rounded-lg bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								autoFocus
								disabled={isEditing}
								{...register("email", {
									required: "Email is required",
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: "Invalid email address",
									},
								})}
							/>
							{errors.email && (
								<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
									{errors.email.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="mem-name"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Full Name
							</Label>
							<Input
								id="mem-name"
								type="text"
								placeholder="e.g. John Doe"
								className="w-full text-sm rounded-lg bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								{...register("name", {
									required: "Full name is required",
								})}
							/>
							{errors.name && (
								<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
									{errors.name.message}
								</p>
							)}
						</div>

						{!isEditing && (
							<div className="space-y-2">
								<Label
									htmlFor="mem-pass"
									className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
								>
									Initial Password (Optional)
								</Label>
								<Input
									id="mem-pass"
									type="password"
									placeholder="Leave blank for random generation"
									className="w-full text-sm rounded-lg bg-muted/20 border-border h-11 px-4"
									{...register("password")}
								/>
							</div>
						)}

						{inviteMemberMutation.isError && (
							<p className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 uppercase tracking-wide">
								{inviteMemberMutation.error instanceof Error
									? inviteMemberMutation.error.message
									: "Failed to invite member. Please try again."}
							</p>
						)}
					</div>
				</form>
			</ScrollArea>

			<DialogFooter className="p-6 pt-2 border-t border-border flex gap-2 justify-end">
				<DialogClose
					render={
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							className="text-muted-foreground hover:text-foreground"
						/>
					}
				>
					Cancel
				</DialogClose>
				<Button
					type="submit"
					form="member-invite-form"
					disabled={inviteMemberMutation.isPending || !isValid}
				>
					{inviteMemberMutation.isPending ? (
						<Spinner className="size-4" />
					) : isEditing ? (
						"Save Changes"
					) : (
						"Invite Member"
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
