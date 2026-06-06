"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
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
		<DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
			<DialogHeader className="p-6 pb-2">
				<DialogTitle className="text-lg font-bold">
					Assign Team Member
				</DialogTitle>
				<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
					Choose a member from your organization workspace to assign
					to this project.
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 min-h-0">
				<form
					id="project-member-assign-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6 space-y-6"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="assign-member-select"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Workspace Member
							</Label>
							<Controller
								name="userId"
								control={control}
								rules={{
									required: "Member selection is required",
								}}
								render={({ field }) => (
									<Select
										items={unassignedMembers.map((m) => ({
											label: `${m.name || m.email} (${m.email})`,
											value: m.id.toString(),
										}))}
										value={field.value}
										onValueChange={(val) =>
											field.onChange(val || "")
										}
									>
										<SelectTrigger className="w-full h-11 rounded-2xl bg-muted/20 border-border px-4">
											<SelectValue placeholder="Select a member..." />
										</SelectTrigger>
										<SelectContent>
											{unassignedMembers.map((m) => (
												<SelectItem
													key={m.id}
													value={m.id.toString()}
												>
													{m.name || m.email} (
													{m.email})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.userId && (
								<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
									{errors.userId.message}
								</p>
							)}
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
					form="project-member-assign-form"
					disabled={assignMemberMutation.isPending || !isValid}
				>
					{assignMemberMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Assign Member"
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
