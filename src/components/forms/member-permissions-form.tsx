"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface MemberPermissionsFormProps {
	userId: number;
	initialPermissions: {
		projects?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
		tasks?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
	};
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface MemberPermissionsInput {
	projectsView: boolean;
	projectsCreate: boolean;
	projectsEdit: boolean;
	projectsDelete: boolean;
	tasksView: boolean;
	tasksCreate: boolean;
	tasksEdit: boolean;
	tasksDelete: boolean;
}

export function MemberPermissionsForm({
	userId,
	initialPermissions,
	onSuccess,
	onCancel,
}: MemberPermissionsFormProps) {
	const { updatePermissionsMutation } = useOrg();
	const perms = initialPermissions || {};

	const {
		handleSubmit,
		control,
		formState: { isValid },
	} = useForm<MemberPermissionsInput>({
		defaultValues: {
			projectsView: perms.projects?.view ?? true,
			projectsCreate: perms.projects?.create ?? false,
			projectsEdit: perms.projects?.edit ?? false,
			projectsDelete: perms.projects?.delete ?? false,
			tasksView: perms.tasks?.view ?? true,
			tasksCreate: perms.tasks?.create ?? true,
			tasksEdit: perms.tasks?.edit ?? true,
			tasksDelete: perms.tasks?.delete ?? false,
		},
		mode: "onChange",
	});

	const onSubmit = async (data: MemberPermissionsInput) => {
		try {
			await updatePermissionsMutation.mutateAsync({
				userId,
				permissions: {
					projects: {
						view: data.projectsView,
						create: data.projectsCreate,
						edit: data.projectsEdit,
						delete: data.projectsDelete,
					},
					tasks: {
						view: data.tasksView,
						create: data.tasksCreate,
						edit: data.tasksEdit,
						delete: data.tasksDelete,
					},
				},
			});
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
			<div className="space-y-4">
				<div className="space-y-2.5">
					<h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Project Control</h4>
					<div className="grid grid-cols-2 gap-3">
						<Controller
							name="projectsView"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>View Projects</span>
								</label>
							)}
						/>
						<Controller
							name="projectsCreate"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>Create Projects</span>
								</label>
							)}
						/>
						<Controller
							name="projectsEdit"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>Edit Projects</span>
								</label>
							)}
						/>
						<Controller
							name="projectsDelete"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>Delete Projects</span>
								</label>
							)}
						/>
					</div>
				</div>

				<div className="space-y-2.5 pt-2 border-t border-border">
					<h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Task Control</h4>
					<div className="grid grid-cols-2 gap-3">
						<Controller
							name="tasksView"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>View Tasks</span>
								</label>
							)}
						/>
						<Controller
							name="tasksCreate"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>Create Tasks</span>
								</label>
							)}
						/>
						<Controller
							name="tasksEdit"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>Edit Tasks</span>
								</label>
							)}
						/>
						<Controller
							name="tasksDelete"
							control={control}
							render={({ field }) => (
								<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
									<span>Delete Tasks</span>
								</label>
							)}
						/>
					</div>
				</div>
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
					disabled={updatePermissionsMutation.isPending || !isValid}
				>
					{updatePermissionsMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Save Permissions"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
