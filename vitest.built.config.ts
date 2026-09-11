import { defineConfig } from "vitest/config";
import { alias, BUILT_OUTPUT_SUITE, summaryLabel } from "./vitest.config";

export default defineConfig({
	resolve: { alias },
	test: {
		environment: "node",
		include: [BUILT_OUTPUT_SUITE],
		reporters: process.env.GITHUB_ACTIONS
			? ["default", summaryLabel("Built output suite (biancafiore)"), "github-actions"]
			: ["default"],
	},
});
