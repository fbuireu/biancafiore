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

export default defineConfig({
	resolve: { alias },
	test: {
		projects: [
			{
				resolve: { alias },
				test: {
					name: "node",
					environment: "node",
					env: { TZ: AWKWARD_TIMEZONE },
					setupFiles: [`${ROOT}src/tests/setup/network.ts`],
					include: ["src/**/*.test.ts", "src/**/*.spec.ts", "docs/**/*.test.ts"],
				},
			},
			{
				resolve: { alias },
				test: {
					name: "dom",
					environment: "happy-dom",
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
