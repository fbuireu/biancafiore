import { defineConfig, devices } from "@playwright/test";

const LOCAL_URL = "http://localhost:4321";
const deployedUrl = process.env.BASE_URL;

const accessHeaders = ((): Record<string, string> => {
	const id = process.env.CF_ACCESS_CLIENT_ID;
	const secret = process.env.CF_ACCESS_CLIENT_SECRET;
	if (!id && !secret) return {};
	if (!id || !secret) {
		throw new Error(`CF Access misconfigured: ${!id ? "CF_ACCESS_CLIENT_ID" : "CF_ACCESS_CLIENT_SECRET"} is missing`);
	}
	return { "CF-Access-Client-Id": id, "CF-Access-Client-Secret": secret };
})();

export default defineConfig({
	webServer: deployedUrl
		? undefined
		: {
				command: "pnpm dev",
				url: LOCAL_URL,
				env: { ASTRO_DEV_BACKGROUND: "1" },
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? "50%" : undefined,
	timeout: 90_000,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
	use: {
		trace: "on-first-retry",
		baseURL: deployedUrl ?? LOCAL_URL,
		extraHTTPHeaders: accessHeaders,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
	],
});
