import { appendFileSync } from "node:fs";

export const summaryLabel = (label: string) => ({
	onTestRunEnd() {
		if (process.env.GITHUB_STEP_SUMMARY) {
			appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n## ${label}\n`);
		}
	},
});
