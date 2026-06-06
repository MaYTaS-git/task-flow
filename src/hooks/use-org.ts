import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

export function useOrg() {
	const queryClient = useQueryClient();
	const { activeOrgId } = useOrganization();

	const orgDetailsQuery = useQuery({
		queryKey: ["org-details", activeOrgId],
		queryFn: async () => {
			if (!activeOrgId) return null;
			const res = await api.org({ id: activeOrgId }).get();
			if (res.error) throw new Error("Failed to fetch organization details");
			return res.data as unknown as { members: { id: number; name: string | null; email: string; role: string; permissions?: object }[]; userRole: string };
		},
		enabled: !!activeOrgId,
	});

	const createOrgMutation = useMutation({
		mutationFn: async (name: string) => {
			const res = await api.org.post({ name });
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to create organization");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
			toast.success("Organization created successfully!");
		},
	});

	const inviteMemberMutation = useMutation({
		mutationFn: async (data: { email: string; name: string; password?: string }) => {
			if (!activeOrgId) throw new Error("No active organization selected");
			const res = await api.org({ id: activeOrgId }).members.post(data);
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to invite member");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["org-details", activeOrgId] });
			toast.success("Member added to workspace successfully!");
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: async (userId: number) => {
			if (!activeOrgId) throw new Error("No active organization selected");
			const res = await api.org({ id: activeOrgId }).members({ userId }).delete();
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to remove member");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["org-details", activeOrgId] });
			toast.success("Member removed successfully.");
		},
	});

	const updatePermissionsMutation = useMutation({
		mutationFn: async (data: { userId: number; permissions: any }) => {
			if (!activeOrgId) throw new Error("No active organization selected");
			const res = await api.org({ id: activeOrgId }).members({ userId: data.userId }).put({
				permissions: data.permissions,
			});
			if (res.error) throw new Error((res.error.value as unknown as { error?: string })?.error || "Failed to update permissions");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["org-details", activeOrgId] });
			toast.success("Permissions updated successfully!");
		},
	});

	return {
		orgDetailsQuery,
		createOrgMutation,
		inviteMemberMutation,
		removeMemberMutation,
		updatePermissionsMutation,
	};
}
