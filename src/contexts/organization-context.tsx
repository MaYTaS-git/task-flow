"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useSession } from "next-auth/react";

interface Organization {
	id: number;
	name: string;
	role: string;
}

interface OrganizationContextType {
	organizations: Organization[];
	activeOrg: Organization | null;
	activeOrgId: number | null;
	setActiveOrgId: (id: number | null) => void;
	isLoading: boolean;
	createOrg: (name: string) => Promise<{ id: number; name: string }>;
	isCreating: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [activeOrgId, setActiveOrgIdState] = useState<number | null>(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("activeOrgId");
			return stored ? parseInt(stored) : null;
		}
		return null;
	});

	const { data: organizations = [], isLoading } = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			if (!session) return [];
			const res = await api.org.dropdown.get();
			if (res.error) {
				console.error("Failed to fetch organizations:", res.error);
				return [];
			}
			return res.data as unknown as Organization[];
		},
		enabled: !!session,
	});

	// Initialize activeOrgId if not set and organizations are available
	useEffect(() => {
		if (organizations.length > 0 && activeOrgId === null) {
			const stored = localStorage.getItem("activeOrgId");
			const storedId = stored ? parseInt(stored) : null;
			
			const exists = storedId !== null && organizations.some(o => o.id === storedId);
			if (exists) {
				setTimeout(() => setActiveOrgIdState(storedId), 0);
			} else {
				const firstId = organizations[0].id;
				setTimeout(() => setActiveOrgIdState(firstId), 0);
				localStorage.setItem("activeOrgId", firstId.toString());
			}
		} else if (organizations.length === 0 && activeOrgId !== null) {
			setTimeout(() => setActiveOrgIdState(null), 0);
		}
	}, [organizations, activeOrgId]);

	const setActiveOrgId = (id: number | null) => {
		setActiveOrgIdState(id);
		if (id !== null) {
			localStorage.setItem("activeOrgId", id.toString());
		} else {
			localStorage.removeItem("activeOrgId");
		}
		// Invalidate queries that depend on the active organization
		queryClient.invalidateQueries({ queryKey: ["projects"] });
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
		queryClient.invalidateQueries({ queryKey: ["org-members"] });
		queryClient.invalidateQueries({ queryKey: ["org-details"] });
		queryClient.invalidateQueries({ queryKey: ["analytics"] });
	};

	const createMutation = useMutation({
		mutationFn: async (name: string) => {
			const res = await api.org.post({ name });
			if (res.error || !res.data?.success) {
				const errorValue = res.error?.value as { error?: string } | undefined;
				throw new Error(
					errorValue?.error ||
						(res.data as { error?: string })?.error ||
						"Failed to create organization",
				);
			}
			return res.data.data as { id: number; name: string };
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
			if (data && data.id) {
				setActiveOrgId(data.id);
			}
		},
	});

	const activeOrg = organizations.find(o => o.id === activeOrgId) || null;

	return (
		<OrganizationContext.Provider
			value={{
				organizations,
				activeOrg,
				activeOrgId,
				setActiveOrgId,
				isLoading,
				createOrg: async (name) => createMutation.mutateAsync(name),
				isCreating: createMutation.isPending,
			}}
		>
			{children}
		</OrganizationContext.Provider>
	);
}

export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (!context) {
		throw new Error("useOrganization must be used within an OrganizationProvider");
	}
	return context;
}
