"use client";

import React from "react";
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

interface OrgCreateFormProps {
	initialName?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface OrgCreateInput {
	name: string;
}

export function OrgCreateForm({ initialName = "", onSuccess, onCancel }: OrgCreateFormProps) {
	const { createOrgMutation } = useOrg();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<OrgCreateInput>({
		defaultValues: {
			name: initialName,
		},
		mode: "onChange",
	});

	const onSubmit = async (data: OrgCreateInput) => {
		try {
			await createOrgMutation.mutateAsync(data.name);
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
			<DialogHeader className="p-6 pb-2">
				<DialogTitle className="text-lg font-bold">
					{initialName ? "Edit Organization" : "Create Organization"}
				</DialogTitle>
				<DialogDescription className="text-xs text-muted-foreground font-light mt-1.5">
					{initialName 
						? "Update your organization workspace name." 
						: "Create a workspace to manage your team, projects, and track tasks."}
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 min-h-0">
				<form
					id="org-create-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6 space-y-6"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="org-name"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Organization Name
							</Label>
							<Input
								id="org-name"
								type="text"
								placeholder="e.g. Acme Core Engineering"
								className="w-full text-sm rounded-2xl bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								autoFocus
								{...register("name", {
									required: "Organization name is required",
								})}
							/>
							{errors.name && (
								<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
									{errors.name.message}
								</p>
							)}
						</div>
					</div>
				</form>
			</ScrollArea>

			<DialogFooter className="p-6 pt-2 border-t border-border flex gap-2 justify-end">
				<DialogClose render={<Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground" />}>
					Cancel
				</DialogClose>
				<Button
					type="submit"
					form="org-create-form"
					disabled={createOrgMutation.isPending || !isValid}
				>
					{createOrgMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						initialName ? "Save Changes" : "Create Workspace"
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
