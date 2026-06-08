import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { serverEnv } from "@/constants/server.env";

const globalForDb = globalThis as unknown as {
	conn: postgres.Sql | undefined;
};

export const sql =
	globalForDb.conn ||
	postgres(serverEnv.DATABASE_URL, {
		max: process.env.NODE_ENV === "production" ? 1 : undefined,
	});
if (process.env.NODE_ENV !== "production") globalForDb.conn = sql;

export const db = drizzle(sql);

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		name: text("name"),
		email: text("email").notNull(),
		emailVerified: timestamp("email_verified"),
		image: text("image"),
		hashedPassword: text("hashed_password"),
		createdAt: timestamp("created_at").defaultNow(),
		role: text("role").default("ADMIN").notNull(),
	},
	(users) => [uniqueIndex("users_email_idx").on(users.email)],
);

export const accounts = pgTable(
	"accounts",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("provider_account_id").notNull(),
		refreshToken: text("refresh_token"),
		accessToken: text("access_token"),
		expiresAt: integer("expires_at"),
		tokenType: text("token_type"),
		scope: text("scope"),
		idToken: text("id_token"),
		sessionState: text("session_state"),
	},
	(accounts) => [
		uniqueIndex("accounts_provider_account_id_idx").on(
			accounts.provider,
			accounts.providerAccountId,
		),
	],
);

export const sessions = pgTable(
	"sessions",
	{
		id: serial("id").primaryKey(),
		sessionToken: text("session_token").notNull(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expires: timestamp("expires").notNull(),
	},
	(sessions) => [
		uniqueIndex("sessions_session_token_idx").on(sessions.sessionToken),
	],
);

export const verificationTokens = pgTable(
	"verification_tokens",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires").notNull(),
	},
	(verificationTokens) => [
		uniqueIndex("verification_tokens_identifier_token_idx").on(
			verificationTokens.identifier,
			verificationTokens.token,
		),
	],
);

// --- Multi-Tenant and RBAC Schemas ---

export const organizations = pgTable(
	"organizations",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		createdById: integer("created_by_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	}
);

export const organizationMembers = pgTable(
	"organization_members",
	{
		id: serial("id").primaryKey(),
		organizationId: integer("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: text("role").notNull(), // "ADMIN", "MEMBER"
		permissions: text("permissions"), // JSON configuration string
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(m) => [
		uniqueIndex("org_member_unique_idx").on(m.organizationId, m.userId),
	]
);

export const projects = pgTable(
	"projects",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		organizationId: integer("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		status: text("status").default("planning").notNull(), // planning, active, completed, on_hold
		createdAt: timestamp("created_at").defaultNow().notNull(),
	}
);

export const projectMembers = pgTable(
	"project_members",
	{
		id: serial("id").primaryKey(),
		projectId: integer("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(m) => [
		uniqueIndex("project_member_unique_idx").on(m.projectId, m.userId),
	]
);

export const tasks = pgTable(
	"tasks",
	{
		id: serial("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		projectId: integer("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		status: text("status").default("todo").notNull(), // todo, in_progress, in_review, done
		priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
		dueDate: timestamp("due_date"),
		estimatedMinutes: integer("estimated_minutes"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	}
);

export const taskAssignees = pgTable(
	"task_assignees",
	{
		id: serial("id").primaryKey(),
		taskId: integer("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(a) => [
		uniqueIndex("task_assignee_unique_idx").on(a.taskId, a.userId),
	]
);

export const taskWorkSessions = pgTable(
	"task_work_sessions",
	{
		id: serial("id").primaryKey(),
		taskId: integer("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		startTime: timestamp("start_time").notNull(),
		endTime: timestamp("end_time"),
		duration: integer("duration"), // in seconds
		description: text("description"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	}
);

export const notifications = pgTable(
	"notifications",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		message: text("message").notNull(),
		type: text("type").notNull(), // task_assigned, status_changed, timer_alert, digest
		read: timestamp("read"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	}
);
