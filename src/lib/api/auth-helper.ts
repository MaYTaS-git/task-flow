import { getServerSession } from "next-auth";
import { eq, and } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import {
	db,
	users,
	organizationMembers,
	projects,
	projectMembers,
	tasks,
} from "@/lib/db";

export interface ModulePermissions {
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
	sessions?: {
		start_stop?: boolean;
		view_all?: boolean;
	};
}

/**
 * Retrieves the currently authenticated user from NextAuth session
 * and validates their existence in the database.
 */
export async function getAuthenticatedUser() {
	const session = await getServerSession(authOptions);
	const sessionUser = session?.user as { id?: string } | undefined;
	if (!sessionUser?.id) {
		throw new Error("Unauthorized");
	}

	const userId = parseInt(sessionUser.id);
	if (isNaN(userId)) {
		throw new Error("Invalid User ID");
	}

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}

/**
 * Checks if a user has access to an organization.
 * Admins have full access. Members have permissions evaluated from JSON.
 * Global SUPER_ADMIN bypasses all checks.
 */
export async function checkOrgAccess(
	userId: number,
	orgId: number,
	requiredRole?: "ADMIN"
) {
	// Fetch user role
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		throw new Error("User not found");
	}

	// SUPER_ADMIN has global access
	if (user.role === "SUPER_ADMIN") {
		return { role: "SUPER_ADMIN", permissions: null as ModulePermissions | null };
	}

	// Verify organization member record
	const [member] = await db
		.select()
		.from(organizationMembers)
		.where(
			and(
				eq(organizationMembers.organizationId, orgId),
				eq(organizationMembers.userId, userId)
			)
		)
		.limit(1);

	if (!member) {
		throw new Error("Forbidden: Not a member of this organization");
	}

	if (requiredRole === "ADMIN" && member.role !== "ADMIN") {
		throw new Error("Forbidden: Admin role required");
	}

	// Parse member specific permissions
	let permissions: ModulePermissions | null = null;
	if (member.permissions) {
		try {
			permissions = JSON.parse(member.permissions) as ModulePermissions;
		} catch {
			// fallback
		}
	}

	return { role: member.role, permissions };
}

/**
 * Verifies if a user has access to a project.
 * Organization ADMINs and SUPER_ADMINs get full access automatically.
 * MEMBERs must be project members and have permissions validated.
 */
export async function checkProjectAccess(
	userId: number,
	projectId: number,
	action?: "view" | "create" | "edit" | "delete"
) {
	const [project] = await db
		.select()
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);

	if (!project) {
		throw new Error("Project not found");
	}

	// Check org access
	const orgAccess = await checkOrgAccess(userId, project.organizationId);

	// Org Admins or Super Admins bypass project membership
	if (orgAccess.role === "ADMIN" || orgAccess.role === "SUPER_ADMIN") {
		return { role: orgAccess.role, permissions: null, orgId: project.organizationId };
	}

	// MEMBERs must be associated with the project
	const [pm] = await db
		.select()
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId)
			)
		)
		.limit(1);

	if (!pm) {
		throw new Error("Forbidden: You are not assigned to this project");
	}

	// Validate action permission
	if (action) {
		const allowed = orgAccess.permissions?.projects?.[action] ?? false;
		if (!allowed) {
			throw new Error(`Forbidden: Missing project:${action} permission`);
		}
	}

	return { role: "MEMBER", permissions: orgAccess.permissions, orgId: project.organizationId };
}

/**
 * Verifies if a user has access to a task.
 * Cascades permission evaluation down to the task's parent project.
 */
export async function checkTaskAccess(
	userId: number,
	taskId: number,
	action?: "view" | "create" | "edit" | "delete"
) {
	const [task] = await db
		.select()
		.from(tasks)
		.where(eq(tasks.id, taskId))
		.limit(1);

	if (!task) {
		throw new Error("Task not found");
	}

	const projectAccess = await checkProjectAccess(userId, task.projectId);

	// Org Admins or Super Admins bypass permissions
	if (projectAccess.role === "ADMIN" || projectAccess.role === "SUPER_ADMIN") {
		return { task, projectId: task.projectId };
	}

	// Validate task permission for MEMBER
	if (action) {
		const allowed = projectAccess.permissions?.tasks?.[action] ?? false;
		if (!allowed) {
			throw new Error(`Forbidden: Missing task:${action} permission`);
		}
	}

	return { task, projectId: task.projectId };
}
