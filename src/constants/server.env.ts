import { t } from "elysia";
import { Value } from "@sinclair/typebox/value";

const envSchema = t.Object({
	DATABASE_URL: t.String(),
	GOOGLE_CLIENT_ID: t.String(),
	GOOGLE_CLIENT_SECRET: t.String(),
	GITHUB_ID: t.String(),
	GITHUB_SECRET: t.String(),
	DISCORD_CLIENT_ID: t.String(),
	DISCORD_CLIENT_SECRET: t.String(),
});

const cleanEnv = Value.Clean(envSchema, { ...process.env });

if (!Value.Check(envSchema, cleanEnv)) {
	const errors = [...Value.Errors(envSchema, cleanEnv)];
	throw new Error(
		`Invalid server environment variables: ${JSON.stringify(errors, null, 2)}`,
	);
}

export const serverEnv = cleanEnv;
