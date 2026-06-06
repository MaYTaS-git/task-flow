"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";

interface OrgCreateFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface OrgCreateInput {
	name: string;
}

export function OrgCreateForm({ onSuccess, onCancel }: OrgCreateFormProps) {
	const { createOrgMutation } = useOrg();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<OrgCreateInput>({
		defaultValues: {
			name: "",
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
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="org-name" className="text-xs font-semibold text-muted-foreground">
					Organization Name
				</Label>
				<Input
					id="org-name"
					type="text"
					placeholder="e.g. Acme Core Engineering"
					className="w-full bg-muted/20 border-border focus:border-primary text-xs rounded-xl"
					autoFocus
					{...register("name", { required: "Organization name is required" })}
				/>
				{errors.name && (
					<p className="text-xs text-destructive mt-1">{errors.name.message}</p>
				)}
			</div>
			<DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
					className="text-muted-foreground hover:text-foreground"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={createOrgMutation.isPending || !isValid}
				>
					{createOrgMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Create Workspace"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
