"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectMemberAssignFormProps {
	projectId: number;
	unassignedMembers: { id: number; name: string | null; email: string }[];
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface ProjectMemberAssignInput {
	userId: string;
}

export function ProjectMemberAssignForm({
	projectId,
	unassignedMembers,
	onSuccess,
	onCancel,
}: ProjectMemberAssignFormProps) {
	const { assignMemberMutation } = useProjects(projectId);
	const {
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useForm<ProjectMemberAssignInput>({
		defaultValues: {
			userId: "",
		},
		mode: "onChange",
	});

	const onSubmit = async (data: ProjectMemberAssignInput) => {
		try {
			const uId = parseInt(data.userId);
			if (isNaN(uId)) return;
			await assignMemberMutation.mutateAsync({
				projectId,
				userId: uId,
			});
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="assign-member-select" className="text-xs font-semibold text-muted-foreground">
					Workspace Member
				</Label>
				<Controller
					name="userId"
					control={control}
					rules={{ required: "Member selection is required" }}
					render={({ field }) => (
						<Select
							items={unassignedMembers.map((m) => ({
								label: `${m.name || m.email} (${m.email})`,
								value: m.id.toString(),
							}))}
							value={field.value}
							onValueChange={(val) => field.onChange(val || "")}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a member..." />
							</SelectTrigger>
							<SelectContent>
								{unassignedMembers.map((m) => (
									<SelectItem key={m.id} value={m.id.toString()}>
										{m.name || m.email} ({m.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.userId && (
					<p className="text-xs text-destructive mt-1">{errors.userId.message}</p>
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
					disabled={assignMemberMutation.isPending || !isValid}
				>
					{assignMemberMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Assign Member"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
