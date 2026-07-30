/// <reference types="vitest" />
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

const TRAILING_GLOB = /\/\*$/;
const LEADING_RELATIVE = /^\.\//;

const { paths } = JSON.parse(readFileSync(new URL("./tsconfig.json", import.meta.url), "utf8")).compilerOptions as {
	paths: Record<string, string[]>;
};

const aliasesFromTsconfig = Object.entries(paths).map(([alias, [target]]) => ({
	find: alias.replace(TRAILING_GLOB, ""),
	replacement: `${ROOT}${target.replace(LEADING_RELATIVE, "").replace(TRAILING_GLOB, "")}`,
}));

export default defineConfig({
	resolve: {
		alias: [
			...aliasesFromTsconfig,
			{ find: "astro:env/server", replacement: `${ROOT}tests/doubles/astroEnvServer.ts` },
			{ find: "astro:env/client", replacement: `${ROOT}tests/doubles/astroEnvClient.ts` },
		],
	},
	test: {
		include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}", "docs/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			reportsDirectory: "./coverage",
		},
	},
});
