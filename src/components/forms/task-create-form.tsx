"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberChip } from "@/components/common/member-chip";

interface TaskCreateFormProps {
	projects: { id: number; name: string }[];
	members: { id: number; name: string | null; email: string }[];
	fixedProjectId?: number;
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
	onSuccess,
	onCancel,
}: TaskCreateFormProps) {
	const { createTaskMutation } = useTasks();
	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		formState: { errors, isValid },
	} = useForm<TaskCreateInput>({
		defaultValues: {
			title: "",
			description: "",
			projectId: fixedProjectId ? fixedProjectId.toString() : "",
			priority: "medium",
			status: "todo",
			assignees: [],
			dueDate: "",
			estimatedMinutes: "",
		},
		mode: "onChange",
	});

	const watchAssignees = watch("assignees");

	const onSubmit = async (data: TaskCreateInput) => {
		try {
			const projId = parseInt(data.projectId);
			if (isNaN(projId)) return;
			const estimatedMinutes = data.estimatedMinutes ? parseInt(data.estimatedMinutes) : undefined;
			await createTaskMutation.mutateAsync({
				title: data.title,
				description: data.description || undefined,
				projectId: projId,
				priority: data.priority,
				status: data.status,
				assignees: data.assignees,
				dueDate: data.dueDate || undefined,
				estimatedMinutes: !isNaN(estimatedMinutes ?? NaN) ? estimatedMinutes : undefined,
			});
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error(err);
		}
	};

	const toggleAssignee = (memberId: number) => {
		const current = watchAssignees;
		if (current.includes(memberId)) {
			setValue("assignees", current.filter((id) => id !== memberId), { shouldValidate: true });
		} else {
			setValue("assignees", [...current, memberId], { shouldValidate: true });
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="new-task-title" className="text-xs font-semibold text-muted-foreground">
					Task Title
				</Label>
				<Input
					id="new-task-title"
					type="text"
					placeholder="e.g. Setup PostgreSQL tables"
					className="w-full text-xs rounded-xl"
					autoFocus
					{...register("title", { required: "Task title is required" })}
				/>
				{errors.title && (
					<p className="text-xs text-destructive mt-1">{errors.title.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="new-task-desc" className="text-xs font-semibold text-muted-foreground">
					Description
				</Label>
				<Input
					id="new-task-desc"
					type="text"
					placeholder="e.g. Implement schema and indices"
					className="w-full text-xs rounded-xl"
					{...register("description")}
				/>
			</div>

			{!fixedProjectId && (
				<div className="space-y-2">
					<Label htmlFor="new-task-project" className="text-xs font-semibold text-muted-foreground">
						Project Workspace
					</Label>
					<Controller
						name="projectId"
						control={control}
						rules={{ required: "Project selection is required" }}
						render={({ field }) => (
							<Select
								items={projects.map((p) => ({
									label: p.name,
									value: p.id.toString(),
								}))}
								value={field.value}
								onValueChange={(val) => field.onChange(val || "")}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select project..." />
								</SelectTrigger>
								<SelectContent>
									{projects.map((p) => (
										<SelectItem key={p.id} value={p.id.toString()}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.projectId && (
						<p className="text-xs text-destructive mt-1">{errors.projectId.message}</p>
					)}
				</div>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="new-task-priority" className="text-xs font-semibold text-muted-foreground">
						Priority
					</Label>
					<Controller
						name="priority"
						control={control}
						render={({ field }) => (
							<Select
								items={[
									{ label: "Low", value: "low" },
									{ label: "Medium", value: "medium" },
									{ label: "High", value: "high" },
									{ label: "Urgent", value: "urgent" },
								]}
								value={field.value}
								onValueChange={(val) => field.onChange(val || "medium")}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select priority..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="new-task-status" className="text-xs font-semibold text-muted-foreground">
						Initial Status
					</Label>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<Select
								items={[
									{ label: "Backlog", value: "backlog" },
									{ label: "To Do", value: "todo" },
									{ label: "In Progress", value: "in_progress" },
									{ label: "In Review", value: "in_review" },
									{ label: "Done", value: "done" },
								]}
								value={field.value}
								onValueChange={(val) => field.onChange(val || "todo")}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select status..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="backlog">Backlog</SelectItem>
									<SelectItem value="todo">To Do</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="in_review">In Review</SelectItem>
									<SelectItem value="done">Done</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>

			{/* Due Date + Estimated Time */}
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="new-task-due" className="text-xs font-semibold text-muted-foreground">
						Due Date
					</Label>
					<Input
						id="new-task-due"
						type="date"
						className="w-full text-xs rounded-xl"
						{...register("dueDate")}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="new-task-estimate" className="text-xs font-semibold text-muted-foreground">
						Est. Time (minutes)
					</Label>
					<Input
						id="new-task-estimate"
						type="number"
						min="1"
						placeholder="e.g. 90"
						className="w-full text-xs rounded-xl"
						{...register("estimatedMinutes")}
					/>
				</div>
			</div>

			{/* Assign Members — chip style */}
			<div className="space-y-2">
				<Label className="text-xs font-semibold text-muted-foreground block mb-1">Assign Members</Label>
				<div className="flex gap-1.5 flex-wrap py-1 min-h-[36px]">
					{members.length === 0 ? (
						<span className="text-[10px] text-muted-foreground">No members available</span>
					) : (
						members.map((m) => {
							const active = watchAssignees.includes(m.id);
							return (
								<MemberChip
									key={m.id}
									name={m.name}
									email={m.email}
									active={active}
									onClick={() => toggleAssignee(m.id)}
									size="sm"
								/>
							);
						})
					)}
				</div>
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
					disabled={createTaskMutation.isPending || !isValid}
				>
					{createTaskMutation.isPending ? (
						<Spinner className="size-4" />
					) : (
						"Create Task"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}
