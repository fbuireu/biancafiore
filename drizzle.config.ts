import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".dev.vars")) {
	process.loadEnvFile(".dev.vars");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/infrastructure/db/schema.ts",
	dialect: "turso",
	dbCredentials: {
		url: process.env.ASTRO_DB_REMOTE_URL as string,
		authToken: process.env.ASTRO_DB_APP_TOKEN as string,
	},
});
