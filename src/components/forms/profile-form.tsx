"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface ProfileFormProps {
	initialName: string;
	initialImage: string;
	onSuccess?: () => void;
}

interface ProfileInput {
	name: string;
	image: string;
}

export function ProfileForm({ initialName, initialImage, onSuccess }: ProfileFormProps) {
	const { update } = useSession();
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isDirty, isValid },
	} = useForm<ProfileInput>({
		defaultValues: {
			name: initialName,
			image: initialImage || "",
		},
		mode: "onChange",
	});

	// Keep defaultValues synced if initial props change
	useEffect(() => {
		setValue("name", initialName);
		setValue("image", initialImage || "");
	}, [initialName, initialImage, setValue]);

	const updateProfileMutation = useMutation({
		mutationFn: async (data: { name: string; image?: string }) => {
			const res = await api.users.profile.put(data);
			if (res.error) {
				throw new Error((res.error.value as { error?: string })?.error || "Failed to update profile");
			}
			return res.data;
		},
		onSuccess: async (data, variables) => {
			await update({ name: variables.name, image: variables.image || null });
			toast.success("Profile updated successfully!");
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const onSubmit = (data: ProfileInput) => {
		if (!data.name.trim()) return;
		updateProfileMutation.mutate({
			name: data.name,
			image: data.image || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label
						htmlFor="profile-name"
						className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
					>
						Full Name
					</Label>
					<div className="relative group">
						<User className="absolute left-4 top-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
						<Input
							id="profile-name"
							type="text"
							placeholder="Your Name"
							className="pl-11 w-full text-sm rounded-2xl bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-12"
							{...register("name", {
								required: "Name is required",
							})}
						/>
					</div>
					{errors.name && (
						<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
							{errors.name.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="profile-image"
						className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
					>
						Profile Picture URL
					</Label>
					<div className="relative group">
						<ImageIcon className="absolute left-4 top-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
						<Input
							id="profile-image"
							type="url"
							placeholder="https://example.com/avatar.png"
							className="pl-11 w-full text-sm rounded-2xl bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-12"
							{...register("image")}
						/>
					</div>
				</div>
			</div>

			<div className="pt-2 flex justify-end">
				<Button
					type="submit"
					size="lg"
					className="rounded-2xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
					disabled={
						updateProfileMutation.isPending || !isDirty || !isValid
					}
				>
					{updateProfileMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Save Changes"
					)}
				</Button>
			</div>
		</form>
	);
}
