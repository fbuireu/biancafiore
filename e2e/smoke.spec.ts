import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "./fixtures";

const UNKNOWN_PATH = "/this-does-not-exist-xyz";
const SECURITY_TXT_PATH = "/.well-known/security.txt";
const PLAIN_TEXT = /^text\/plain/;
const EXPIRES_FIELD = /^Expires: *(.+)$/m;
const PUBLISHED_SECURITY_TXT = "../public/.well-known/security.txt";
const SHADOWED_AT_THE_EDGE =
	"the served security.txt is not the one in public/: a security.txt the Cloudflare zone serves itself answers before the Worker";

test.describe("smoke", () => {
	test("the homepage answers with a rendered document @smoke", async ({ page }) => {
		const response = await page.goto("/");

		expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle(/.+/);
	});

	test("an unknown path answers 404 @smoke", async ({ page }) => {
		const response = await page.goto(UNKNOWN_PATH);

		expect(response?.status()).toBe(404);
	});

	test("robots.txt is served @smoke", async ({ request }) => {
		const response = await request.get("/robots.txt");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/plain");
	});

	test("security.txt is served as the repository publishes it, and has not expired @smoke", async ({
		request,
	}, testInfo) => {
		const published = readFileSync(join(testInfo.project.testDir, PUBLISHED_SECURITY_TXT), "utf8");
		const response = await request.get(SECURITY_TXT_PATH);

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toMatch(PLAIN_TEXT);

		const body = await response.text();

		expect(body, SHADOWED_AT_THE_EDGE).toBe(published);
		expect(Date.parse(body.match(EXPIRES_FIELD)?.[1] ?? "")).toBeGreaterThan(Date.now());
	});
});
