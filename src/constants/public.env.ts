import { t } from "elysia";
import { Value } from "@sinclair/typebox/value";

const envSchema = t.Object({
	NEXT_PUBLIC_APP_NAME: t.String(),
	NEXT_PUBLIC_APP_URL: t.String(),
});

const cleanEnv = Value.Clean(envSchema, {
	NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
	NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!Value.Check(envSchema, cleanEnv)) {
	const errors = [...Value.Errors(envSchema, cleanEnv)];
	throw new Error(
		`Invalid public environment variables: ${JSON.stringify(errors, null, 2)}`,
	);
}

export const publicEnv = cleanEnv;
