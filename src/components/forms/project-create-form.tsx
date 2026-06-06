"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectCreateFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface ProjectCreateInput {
	name: string;
	description: string;
	status: string;
}

export function ProjectCreateForm({ onSuccess, onCancel }: ProjectCreateFormProps) {
	const { createProjectMutation } = useProjects();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useForm<ProjectCreateInput>({
		defaultValues: {
			name: "",
			description: "",
			status: "planning",
		},
		mode: "onChange",
	});

	const onSubmit = async (data: ProjectCreateInput) => {
		try {
			await createProjectMutation.mutateAsync({
				name: data.name,
				description: data.description || undefined,
				status: data.status,
			});
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="proj-name" className="text-xs font-semibold text-muted-foreground">
					Project Title
				</Label>
				<Input
					id="proj-name"
					type="text"
					placeholder="e.g. Mobile App Redesign"
					className="w-full text-xs rounded-xl"
					autoFocus
					{...register("name", { required: "Project title is required" })}
				/>
				{errors.name && (
					<p className="text-xs text-destructive mt-1">{errors.name.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="proj-desc" className="text-xs font-semibold text-muted-foreground">
					Description (Optional)
				</Label>
				<Input
					id="proj-desc"
					type="text"
					placeholder="e.g. Migration of layout schemas to tailwind"
					className="w-full text-xs rounded-xl"
					{...register("description")}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="proj-status" className="text-xs font-semibold text-muted-foreground">
					Initial Status
				</Label>
				<Controller
					name="status"
					control={control}
					render={({ field }) => (
						<Select
							items={[
								{ label: "Planning", value: "planning" },
								{ label: "Active", value: "active" },
								{ label: "On Hold", value: "on_hold" },
								{ label: "Completed", value: "completed" },
							]}
							value={field.value}
							onValueChange={(val) => field.onChange(val || "planning")}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select status..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="planning">Planning</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="on_hold">On Hold</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
			</div>

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
					disabled={createProjectMutation.isPending || !isValid}
				>
					{createProjectMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Create Project"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
