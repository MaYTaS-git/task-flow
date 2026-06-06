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

interface ProjectSettingsFormProps {
	projectId: number;
	initialName: string;
	initialDescription: string;
	initialStatus: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface ProjectSettingsInput {
	name: string;
	description: string;
	status: string;
}

export function ProjectSettingsForm({
	projectId,
	initialName,
	initialDescription,
	initialStatus,
	onSuccess,
	onCancel,
}: ProjectSettingsFormProps) {
	const { updateProjectMutation } = useProjects();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useForm<ProjectSettingsInput>({
		defaultValues: {
			name: initialName,
			description: initialDescription || "",
			status: initialStatus || "planning",
		},
		mode: "onChange",
	});

	const onSubmit = async (data: ProjectSettingsInput) => {
		try {
			await updateProjectMutation.mutateAsync({
				id: projectId,
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
				<Label htmlFor="proj-sett-name" className="text-xs font-semibold text-muted-foreground">
					Project Title
				</Label>
				<Input
					id="proj-sett-name"
					type="text"
					className="w-full bg-muted/20 border-border focus:border-primary text-xs rounded-xl"
					{...register("name", { required: "Project title is required" })}
				/>
				{errors.name && (
					<p className="text-xs text-destructive mt-1">{errors.name.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="proj-sett-desc" className="text-xs font-semibold text-muted-foreground">
					Description
				</Label>
				<Input
					id="proj-sett-desc"
					type="text"
					className="w-full bg-muted/20 border-border focus:border-primary text-xs rounded-xl"
					{...register("description")}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="proj-sett-status" className="text-xs font-semibold text-muted-foreground">
					Project Status
				</Label>
				<Controller
					name="status"
					control={control}
					render={({ field }) => (
						<Select
							items={[
								{ label: "Planning", value: "planning" },
								{ label: "Active", value: "active" },
								{ label: "Completed", value: "completed" },
								{ label: "On Hold", value: "on_hold" },
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
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="on_hold">On Hold</SelectItem>
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
					className="text-muted-foreground hover:text-foreground"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={updateProjectMutation.isPending || !isValid}
				>
					{updateProjectMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Save Changes"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
