import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	webServer: {
		command: "yarn start",
		reuseExistingServer: !process.env.CI,
	},
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? "github" : "html",
	use: {
		trace: "on-first-retry",
		baseURL: `${process.env.E2E_URL ?? "http://localhost:4321"}`,
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
