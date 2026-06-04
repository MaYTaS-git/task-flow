import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/db.ts",
	dbCredentials: {
		url: "postgres://task_manager_user:task_manager_password@localhost:5432/task_manager",
	},
});
