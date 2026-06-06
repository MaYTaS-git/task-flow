import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

export interface UseTasksOptions {
	projectId?: number;
	filterProjId?: string;
	filterStatus?: string;
	filterPriority?: string;
	filterAssigneeId?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
	const queryClient = useQueryClient();
	const { activeOrgId } = useOrganization();
	const {
		projectId,
		filterProjId,
		filterStatus,
		filterPriority,
		filterAssigneeId,
	} = options;

	// Fetch tasks inside a project (or across active organization projects)
	const tasksQuery = useQuery({
		queryKey: [
			"tasks",
			activeOrgId,
			projectId,
			filterProjId,
			filterStatus,
			filterPriority,
			filterAssigneeId,
		],
		queryFn: async () => {
			if (!activeOrgId) return [];

			// Case 1: We are looking at a specific project page
			if (projectId) {
				const queryParams: { projectId: string; status?: string; priority?: string; assigneeId?: string } = { projectId: projectId.toString() };
				if (filterStatus && filterStatus !== "all") queryParams.status = filterStatus;
				if (filterPriority && filterPriority !== "all") queryParams.priority = filterPriority;
				if (filterAssigneeId && filterAssigneeId !== "all") queryParams.assigneeId = filterAssigneeId;

				const res = await api.tasks.get({ query: queryParams });
				if (res.error) throw new Error("Failed to fetch tasks");
				return (res.data || []) as object[];
			}

			// Case 2: We are on the general tasks page with potential project filtering
			// First get all projects to resolve project names or check active workspace projects
			const projRes = await api.projects.get({ query: { orgId: activeOrgId.toString() } });
			if (projRes.error || !projRes.data) return [];
			const projects = projRes.data as { id: number; name: string }[];

			const targetProjects =
				filterProjId && filterProjId !== "all"
					? projects.filter((p) => p.id.toString() === filterProjId)
					: projects;

			if (targetProjects.length === 0) return [];

			const allTasks = await Promise.all(
				targetProjects.map(async (project) => {
					const queryParams: { projectId: string; status?: string; priority?: string; assigneeId?: string } = { projectId: project.id.toString() };
					if (filterStatus && filterStatus !== "all") queryParams.status = filterStatus;
					if (filterPriority && filterPriority !== "all") queryParams.priority = filterPriority;
					if (filterAssigneeId && filterAssigneeId !== "all") queryParams.assigneeId = filterAssigneeId;

					const res = await api.tasks.get({ query: queryParams });
					if (res.error || !res.data) return [];
					return (res.data as object[]).map((t) => ({
						...(t as object),
						projectName: project.name,
					}));
				})
			);

			return allTasks.flat();
		},
		enabled: !!activeOrgId,
	});

	// Active running timer query
	const activeTimerQuery = useQuery({
		queryKey: ["active-timer"],
		queryFn: async () => {
			const res = await api.tasks.timer.current.get();
			if (res.error || !res.data || !res.data.success) return null;
			return res.data.data || null;
		},
	});

	const createTaskMutation = useMutation({
		mutationFn: async (data: {
			title: string;
			description?: string;
			projectId: number;
			priority?: string;
			status?: string;
			assignees?: number[];
			dueDate?: string | null;
			estimatedMinutes?: number;
		}) => {
			const res = await api.tasks.post({
				title: data.title,
				description: data.description,
				projectId: data.projectId,
				priority: data.priority,
				status: data.status,
				assignees: data.assignees,
				dueDate: data.dueDate || undefined,
				estimatedMinutes: data.estimatedMinutes,
			});
			if (res.error) throw new Error((res.error.value as { error?: string })?.error || "Failed to create task");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			toast.success("Task created successfully!");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const updateTaskMutation = useMutation({
		mutationFn: async (data: {
			id: number;
			title: string;
			status: string;
			description?: string | null;
			priority?: string;
			dueDate?: string | null;
			assignees?: number[];
			estimatedMinutes?: number;
		}) => {
			const { id, ...rest } = data;
			const payload = {
				title: rest.title,
				status: rest.status,
				description: rest.description || undefined,
				priority: rest.priority || undefined,
				dueDate: rest.dueDate || undefined,
				assignees: rest.assignees || undefined,
				estimatedMinutes: rest.estimatedMinutes || undefined,
			};
			const res = await api.tasks({ id }).put(payload);
			if (res.error) throw new Error((res.error.value as { error?: string })?.error || "Failed to update task");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task updated successfully!");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const deleteTaskMutation = useMutation({
		mutationFn: async (taskId: number) => {
			const res = await api.tasks({ id: taskId }).delete();
			if (res.error) throw new Error((res.error.value as { error?: string })?.error || "Failed to delete task");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task deleted successfully!");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const startTimerMutation = useMutation({
		mutationFn: async ({ taskId, description }: { taskId: number; description?: string }) => {
			const res = await api.tasks({ id: taskId }).timer.start.post({ description });
			if (res.error) throw new Error((res.error.value as { error?: string })?.error || "Failed to start timer");
			return res.data;
		},
		onSuccess: () => {
			activeTimerQuery.refetch();
			toast.success("Timer started!");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const stopTimerMutation = useMutation({
		mutationFn: async (taskId: number) => {
			const res = await api.tasks({ id: taskId }).timer.stop.post();
			if (res.error) throw new Error((res.error.value as { error?: string })?.error || "Failed to stop timer");
			return res.data;
		},
		onSuccess: () => {
			activeTimerQuery.refetch();
			toast.success("Timer stopped!");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	return {
		tasksQuery,
		activeTimerQuery,
		createTaskMutation,
		updateTaskMutation,
		deleteTaskMutation,
		startTimerMutation,
		stopTimerMutation,
	};
}
