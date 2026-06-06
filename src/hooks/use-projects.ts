import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

export function useProjects(projectId?: number) {
	const queryClient = useQueryClient();
	const { activeOrgId } = useOrganization();

	// Fetch projects in the active organization
	const projectsQuery = useQuery({
		queryKey: ["projects", activeOrgId],
		queryFn: async () => {
			if (!activeOrgId) return [];
			const res = await api.projects.get({ query: { orgId: activeOrgId.toString() } });
			if (res.error) throw new Error("Failed to fetch projects");
			return res.data as unknown as object[];
		},
		enabled: !!activeOrgId,
	});

	// Fetch single project details
	const projectDetailsQuery = useQuery({
		queryKey: ["project-details", projectId],
		queryFn: async () => {
			if (!projectId) return null;
			const res = await api.projects({ id: projectId }).get();
			if (res.error || !res.data) throw new Error("Failed to fetch project details");
			const responseData = res.data as unknown as {
			success: boolean;
			data: {
				project: { id: number; name: string; description: string | null; status: string; organizationId: number; createdAt: string };
				members: { id: number; name: string | null; email: string; role: string }[];
			};
			error?: string;
		};
		if (!responseData.success) throw new Error(responseData.error || "Failed to fetch project details");
		return responseData.data;
		},
		enabled: !!projectId && !isNaN(projectId),
	});

	const createProjectMutation = useMutation({
		mutationFn: async (data: { name: string; description?: string; status?: string }) => {
			if (!activeOrgId) throw new Error("No active organization selected");
			const res = await api.projects.post({
				name: data.name,
				description: data.description,
				organizationId: activeOrgId,
				status: data.status,
			});
			if (res.error) throw new Error((res.error.value as unknown as { message?: string })?.message || "Failed to create project");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects", activeOrgId] });
			toast.success("Project created successfully!");
		},
	});

	const updateProjectMutation = useMutation({
		mutationFn: async (data: { id: number; name: string; description?: string; status: string }) => {
			const res = await api.projects({ id: data.id }).put({
				name: data.name,
				description: data.description,
				status: data.status,
			});
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to update project");
			return res.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["project-details", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["projects", activeOrgId] });
			toast.success("Project updated successfully!");
		},
	});

	const assignMemberMutation = useMutation({
		mutationFn: async (data: { projectId: number; userId: number }) => {
			const res = await api.projects({ id: data.projectId }).members.post({ userId: data.userId });
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to assign member");
			return res.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["project-details", variables.projectId] });
			toast.success("Member assigned to project!");
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: async (data: { projectId: number; userId: number }) => {
			const res = await api.projects({ id: data.projectId }).members({ userId: data.userId }).delete();
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to remove member");
			return res.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["project-details", variables.projectId] });
			toast.success("Member removed from project.");
		},
	});

	const deleteProjectMutation = useMutation({
		mutationFn: async (id: number) => {
			const res = await api.projects({ id }).delete();
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to delete project");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects", activeOrgId] });
			toast.success("Project deleted successfully.");
		},
	});

	return {
		projectsQuery,
		projectDetailsQuery,
		createProjectMutation,
		updateProjectMutation,
		assignMemberMutation,
		removeMemberMutation,
		deleteProjectMutation,
	};
}
