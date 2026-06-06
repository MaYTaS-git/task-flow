"use client";

import React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useTasks } from "@/hooks/use-tasks";
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
import { MemberChip } from "@/components/common/member-chip";

import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskCreateFormProps {
	projects: { id: number; name: string }[];
	members: { id: number; name: string | null; email: string; image?: string | null }[];
	fixedProjectId?: number;
	initialData?: {
		id: number;
		title: string;
		description: string | null;
		projectId: number;
		priority: string;
		status: string;
		assignees?: number[];
		dueDate?: string | null;
		estimatedMinutes?: number | null;
	};
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface TaskCreateInput {
	title: string;
	description: string;
	projectId: string;
	priority: string;
	status: string;
	assignees: number[];
	dueDate: string;
	estimatedMinutes: string;
}

export function TaskCreateForm({
	projects,
	members,
	fixedProjectId,
	initialData,
	onSuccess,
	onCancel,
}: TaskCreateFormProps) {
	const { createTaskMutation, updateTaskMutation } = useTasks();
	const isEditing = !!initialData;

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors, isValid },
	} = useForm<TaskCreateInput>({
		defaultValues: {
			title: initialData?.title || "",
			description: initialData?.description || "",
			projectId: fixedProjectId
				? fixedProjectId.toString()
				: initialData?.projectId?.toString() || "",
			priority: initialData?.priority || "medium",
			status: initialData?.status || "todo",
			assignees: initialData?.assignees || [],
			dueDate: initialData?.dueDate || "",
			estimatedMinutes: initialData?.estimatedMinutes?.toString() || "",
		},
		mode: "onChange",
	});

	const watchAssignees =
		useWatch({
			control,
			name: "assignees",
		}) || [];

	const onSubmit = async (data: TaskCreateInput) => {
		try {
			const projId = parseInt(data.projectId);
			if (isNaN(projId)) return;
			const estimatedMinutes = data.estimatedMinutes
				? parseInt(data.estimatedMinutes)
				: undefined;

			if (isEditing) {
				await updateTaskMutation.mutateAsync({
					id: initialData.id,
					title: data.title,
					description: data.description || undefined,
					// projectId: projId,
					priority: data.priority,
					status: data.status,
					assignees: data.assignees,
					dueDate: data.dueDate || undefined,
					estimatedMinutes: !isNaN(estimatedMinutes ?? NaN)
						? estimatedMinutes
						: undefined,
				});
			} else {
				await createTaskMutation.mutateAsync({
					title: data.title,
					description: data.description || undefined,
					projectId: projId,
					priority: data.priority,
					status: data.status,
					assignees: data.assignees,
					dueDate: data.dueDate || undefined,
					estimatedMinutes: !isNaN(estimatedMinutes ?? NaN)
						? estimatedMinutes
						: undefined,
				});
			}
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	const toggleAssignee = (memberId: number) => {
		const current = watchAssignees;
		if (current.includes(memberId)) {
			setValue(
				"assignees",
				current.filter((id) => id !== memberId),
				{ shouldValidate: true },
			);
		} else {
			setValue("assignees", [...current, memberId], {
				shouldValidate: true,
			});
		}
	};

	const isPending =
		createTaskMutation.isPending || updateTaskMutation.isPending;

	return (
		<DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
			<DialogHeader className="p-6 pb-2">
				<DialogTitle className="text-lg font-bold">
					{isEditing ? "Edit Task" : "Create Task"}
				</DialogTitle>
				<DialogDescription className="text-xs text-muted-foreground font-light mt-1">
					{isEditing
						? "Update task details, status, and assignees."
						: "Add a task item with status and multiple assignee options."}
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 min-h-0">
				<form
					id="task-create-form"
					onSubmit={handleSubmit(onSubmit)}
					className="p-6 space-y-6"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="new-task-title"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Task Title
							</Label>
							<Input
								id="new-task-title"
								type="text"
								placeholder="e.g. Setup PostgreSQL tables"
								className="w-full text-sm rounded-2xl bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								autoFocus
								{...register("title", {
									required: "Task title is required",
								})}
							/>
							{errors.title && (
								<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
									{errors.title.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="new-task-desc"
								className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
							>
								Description
							</Label>
							<Input
								id="new-task-desc"
								type="text"
								placeholder="e.g. Implement schema and indices"
								className="w-full text-sm rounded-2xl bg-muted/20 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11 px-4"
								{...register("description")}
							/>
						</div>

						{!fixedProjectId && (
							<div className="space-y-2">
								<Label
									htmlFor="new-task-project"
									className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
								>
									Project Workspace
								</Label>
								<Controller
									name="projectId"
									control={control}
									rules={{
										required: "Project selection is required",
									}}
									render={({ field }) => (
										<Select
											items={projects.map((p) => ({
												label: p.name,
												value: p.id.toString(),
											}))}
											value={field.value}
											onValueChange={(val) =>
												field.onChange(val || "")
											}
										>
											<SelectTrigger className="w-full h-11 rounded-2xl bg-muted/20 border-border px-4">
												<SelectValue placeholder="Select project..." />
											</SelectTrigger>
											<SelectContent>
												{projects.map((p) => (
													<SelectItem
														key={p.id}
														value={p.id.toString()}
													>
														{p.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.projectId && (
									<p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">
										{errors.projectId.message}
									</p>
								)}
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label
									htmlFor="new-task-priority"
									className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
								>
									Priority
								</Label>
								<Controller
									name="priority"
									control={control}
									render={({ field }) => (
										<Select
											items={[
												{ label: "Low", value: "low" },
												{
													label: "Medium",
													value: "medium",
												},
												{ label: "High", value: "high" },
												{
													label: "Urgent",
													value: "urgent",
												},
											]}
											value={field.value}
											onValueChange={(val) =>
												field.onChange(val || "medium")
											}
										>
											<SelectTrigger className="w-full h-11 rounded-2xl bg-muted/20 border-border px-4">
												<SelectValue placeholder="Select priority..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">
													Low
												</SelectItem>
												<SelectItem value="medium">
													Medium
												</SelectItem>
												<SelectItem value="high">
													High
												</SelectItem>
												<SelectItem value="urgent">
													Urgent
												</SelectItem>
											</SelectContent>
										</Select>
									)}
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="new-task-status"
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
													label: "Backlog",
													value: "backlog",
												},
												{ label: "To Do", value: "todo" },
												{
													label: "In Progress",
													value: "in_progress",
												},
												{
													label: "In Review",
													value: "in_review",
												},
												{ label: "Done", value: "done" },
											]}
											value={field.value}
											onValueChange={(val) =>
												field.onChange(val || "todo")
											}
										>
											<SelectTrigger className="w-full h-11 rounded-2xl bg-muted/20 border-border px-4">
												<SelectValue placeholder="Select status..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="backlog">
													Backlog
												</SelectItem>
												<SelectItem value="todo">
													To Do
												</SelectItem>
												<SelectItem value="in_progress">
													In Progress
												</SelectItem>
												<SelectItem value="in_review">
													In Review
												</SelectItem>
												<SelectItem value="done">
													Done
												</SelectItem>
											</SelectContent>
										</Select>
									)}
								/>
							</div>
						</div>

						{/* Due Date + Estimated Time */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label
									htmlFor="new-task-due"
									className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
								>
									Due Date
								</Label>
								<Input
									id="new-task-due"
									type="date"
									className="w-full text-sm rounded-2xl bg-muted/20 border-border h-11 px-4"
									{...register("dueDate")}
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="new-task-estimate"
									className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1"
								>
									Est. Time (min)
								</Label>
								<Input
									id="new-task-estimate"
									type="number"
									min="1"
									placeholder="e.g. 90"
									className="w-full text-sm rounded-2xl bg-muted/20 border-border h-11 px-4"
									{...register("estimatedMinutes")}
								/>
							</div>
						</div>

						{/* Assign Members — chip style */}
						<div className="space-y-3 pt-2">
							<Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1 block">
								Assign Members
							</Label>
							<div className="flex gap-2 flex-wrap py-2 min-h-[44px] bg-muted/10 p-3 rounded-2xl border border-border/50">
								{members.length === 0 ? (
									<span className="text-[10px] text-muted-foreground font-medium px-1">
										No members available in this workspace
									</span>
								) : (
									members.map((m) => {
										const active = watchAssignees.includes(
											m.id,
										);
										return (
											<MemberChip
												key={m.id}
												name={m.name}
												email={m.email}
												image={m.image}
												active={active}
												onClick={() => toggleAssignee(m.id)}
												size="sm"
											/>
										);
									})
								)}
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
					form="task-create-form"
					disabled={isPending || !isValid}
				>
					{isPending ? (
						<Spinner className="size-4" />
					) : isEditing ? (
						"Save Changes"
					) : (
						"Create Task"
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
