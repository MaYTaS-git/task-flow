"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectCreateFormProps {
	initialData?: {
		id: number;
		name: string;
		description: string | null;
		status: string;
	};
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface ProjectCreateInput {
	name: string;
	description: string;
	status: string;
}

export function ProjectCreateForm({
	initialData,
	onSuccess,
	onCancel,
}: ProjectCreateFormProps) {
	const { createProjectMutation, updateProjectMutation } = useProjects();
	const isEditing = !!initialData;

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useForm<ProjectCreateInput>({
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			status: initialData?.status || "planning",
		},
		mode: "onChange",
	});

	const onSubmit = async (data: ProjectCreateInput) => {
		try {
			if (isEditing) {
				await updateProjectMutation.mutateAsync({
					id: initialData.id,
					name: data.name,
					description: data.description || undefined,
					status: data.status,
				});
			} else {
				await createProjectMutation.mutateAsync({
					name: data.name,
					description: data.description || undefined,
					status: data.status,
				});
			}
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	const isPending =
		createProjectMutation.isPending || updateProjectMutation.isPending;

	return (
		<DialogContent className="max-w-md rounded-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
			<DialogHeader className="p-6 pb-2">
				<DialogTitle className="text-lg font-bold">
					{isEditing ? "Edit Project" : "Create Project"}
				</DialogTitle>
				<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
					{isEditing
						? "Update project workspace details and status."
						: "Add a project space to categorize tasks and configure member boards."}
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 min-h-0">
				<form
					id="project-create-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6 space-y-6"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="proj-name"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Project Title
							</Label>
							<Input
								id="proj-name"
								type="text"
								placeholder="e.g. Mobile App Redesign"
								className="w-full text-sm rounded-lg bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								autoFocus
								{...register("name", {
									required: "Project title is required",
								})}
							/>
							{errors.name && (
								<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
									{errors.name.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="proj-desc"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Description (Optional)
							</Label>
							<Input
								id="proj-desc"
								type="text"
								placeholder="e.g. Migration of layout schemas to tailwind"
								className="w-full text-sm rounded-lg bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								{...register("description")}
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="proj-status"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Initial Status
							</Label>
							<Controller
								name="status"
								control={control}
								render={({ field }) => (
									<Select
										items={[
											{
												label: "Planning",
												value: "planning",
											},
											{ label: "Active", value: "active" },
											{ label: "On Hold", value: "on_hold" },
											{
												label: "Completed",
												value: "completed",
											},
										]}
										value={field.value}
										onValueChange={(val) =>
											field.onChange(val || "planning")
										}
									>
										<SelectTrigger className="w-full h-11 rounded-lg bg-muted/20 border-border px-4">
											<SelectValue placeholder="Select status..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="planning">
												Planning
											</SelectItem>
											<SelectItem value="active">
												Active
											</SelectItem>
											<SelectItem value="on_hold">
												On Hold
											</SelectItem>
											<SelectItem value="completed">
												Completed
											</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
						</div>
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
					form="project-create-form"
					disabled={isPending || !isValid}
				>
					{isPending ? (
						<Spinner className="size-4" />
					) : isEditing ? (
						"Save Changes"
					) : (
						"Create Project"
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
