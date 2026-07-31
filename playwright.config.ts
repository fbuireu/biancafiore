import { defineConfig, devices } from "@playwright/test";

const LOCAL_URL = "http://localhost:4321";
const deployedUrl = process.env.E2E_URL;

export default defineConfig({
	webServer: deployedUrl
		? undefined
		: {
				command: "pnpm start",
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
	reporter: process.env.CI ? "github" : "html",
	use: {
		trace: "on-first-retry",
		baseURL: deployedUrl ?? LOCAL_URL,
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
