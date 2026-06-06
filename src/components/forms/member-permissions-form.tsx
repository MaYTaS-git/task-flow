"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberPermissionsFormProps {
	userId: number;
	userNameOrEmail?: string;
	initialPermissions: {
		projects?: {
			view?: boolean;
			create?: boolean;
			edit?: boolean;
			delete?: boolean;
		};
		tasks?: {
			view?: boolean;
			create?: boolean;
			edit?: boolean;
			delete?: boolean;
		};
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
	userNameOrEmail = "Member",
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
		<DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
			<DialogHeader className="p-6 pb-2">
				<DialogTitle className="text-lg font-bold">
					Manage Permissions: {userNameOrEmail}
				</DialogTitle>
				<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
					Toggle specific feature privileges for this user.
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 min-h-0">
				<form
					id="member-permissions-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6 space-y-8"
				>
					<div className="space-y-6">
						<div className="space-y-4">
							<h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">
								Project Control
							</h4>
							<div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-3xl border border-border/50">
								<Controller
									name="projectsView"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">View Projects</span>
										</label>
									)}
								/>
								<Controller
									name="projectsCreate"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">Create Projects</span>
										</label>
									)}
								/>
								<Controller
									name="projectsEdit"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">Edit Projects</span>
										</label>
									)}
								/>
								<Controller
									name="projectsDelete"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">Delete Projects</span>
										</label>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">
								Task Control
							</h4>
							<div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-3xl border border-border/50">
								<Controller
									name="tasksView"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">View Tasks</span>
										</label>
									)}
								/>
								<Controller
									name="tasksCreate"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">Create Tasks</span>
										</label>
									)}
								/>
								<Controller
									name="tasksEdit"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">Edit Tasks</span>
										</label>
									)}
								/>
								<Controller
									name="tasksDelete"
									control={control}
									render={({ field }) => (
										<label className="flex items-center gap-3 text-xs font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors group">
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(!!checked)
												}
												className="rounded-lg"
											/>
											<span className="group-hover:translate-x-0.5 transition-transform">Delete Tasks</span>
										</label>
									)}
								/>
							</div>
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
					form="member-permissions-form"
					disabled={updatePermissionsMutation.isPending || !isValid}
				>
					{updatePermissionsMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Save Permissions"
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
