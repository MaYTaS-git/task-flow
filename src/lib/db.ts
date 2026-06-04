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

export const sql = postgres(serverEnv.DATABASE_URL);

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
	},
	(users) => [uniqueIndex("users_email_idx").on(users.email)],
);

export const accounts = pgTable(
	"accounts",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id),
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
			.references(() => users.id),
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
