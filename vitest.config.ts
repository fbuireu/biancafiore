/// <reference types="vitest" />
import { appendFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import type { TestModule } from "vitest/node";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

const TRAILING_GLOB = /\/\*$/;
const LEADING_RELATIVE = /^\.\//;

const { paths } = JSON.parse(readFileSync(new URL("./tsconfig.json", import.meta.url), "utf8")).compilerOptions as {
	paths: Record<string, string[]>;
};

const AWKWARD_TIMEZONE = "America/New_York";

const aliasesFromTsconfig = Object.entries(paths).map(([alias, [target]]) => ({
	find: alias.replace(TRAILING_GLOB, ""),
	replacement: `${ROOT}${target.replace(LEADING_RELATIVE, "").replace(TRAILING_GLOB, "")}`,
}));

const alias = [
	...aliasesFromTsconfig,
	{ find: "astro:env/server", replacement: `${ROOT}src/tests/doubles/astroEnvServer.ts` },
	{ find: "astro:env/client", replacement: `${ROOT}src/tests/doubles/astroEnvClient.ts` },
	{ find: "astro:middleware", replacement: `${ROOT}src/tests/doubles/astroMiddleware.ts` },
];

const BUILT_OUTPUT_SUITE = "docs/built-output.test.ts";

const summaryLabel = {
	onTestRunEnd(testModules: readonly TestModule[]) {
		if (!process.env.GITHUB_STEP_SUMMARY || testModules.length === 0) return;
		const projects = [...new Set(testModules.map((module) => module.project.name))].sort();
		appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n## Vitest run: ${projects.join(" + ")}\n`);
	},
};

export default defineConfig({
	resolve: { alias },
	test: {
		reporters: process.env.GITHUB_ACTIONS ? ["default", summaryLabel, "github-actions"] : ["default"],
		projects: [
			{
				resolve: { alias },
				test: {
					name: "node",
					environment: "node",
					env: { TZ: AWKWARD_TIMEZONE },
					setupFiles: [`${ROOT}src/tests/setup/network.ts`],
					include: ["src/**/*.test.ts", "src/**/*.spec.ts", "docs/**/*.test.ts"],
					exclude: [BUILT_OUTPUT_SUITE],
				},
			},
			{
				resolve: { alias },
				test: {
					name: "built",
					environment: "node",
					include: [BUILT_OUTPUT_SUITE],
				},
			},
			{
				resolve: { alias },
				test: {
					name: "dom",
					environment: "happy-dom",
					setupFiles: [`${ROOT}src/tests/setup/network.ts`],
					include: ["src/**/*.test.tsx", "src/**/*.spec.tsx"],
				},
			},
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			reportsDirectory: "./coverage",
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.test.{ts,tsx}",
				"src/tests/**",
				"src/**/types.ts",
				"src/**/index.ts",
				"src/**/schema.ts",
				"src/const/**",
				"src/data/**",
				"src/env.d.ts",
			],
		},
	},
});
