import { expect, test } from "@playwright/test";

const UNKNOWN_PATH = "/this-does-not-exist-xyz";

test.describe("production smoke", () => {
	test("the homepage answers with a rendered document @smoke", async ({ page }) => {
		const response = await page.goto("/");

		expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle(/.+/);
	});

	test("an unknown path answers 404 @smoke", async ({ page }) => {
		const response = await page.goto(UNKNOWN_PATH);

		expect(response?.status()).toBe(404);
	});

	test("the feed is served as XML @smoke", async ({ request }) => {
		const response = await request.get("/rss.xml");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("xml");
	});

	test("the sitemap index robots.txt points at is served @smoke", async ({ request }) => {
		const response = await request.get("/sitemap-index.xml");

		expect(response.status()).toBe(200);
		expect(await response.text()).toContain("<sitemapindex");
	});

	test("robots.txt is served @smoke", async ({ request }) => {
		const response = await request.get("/robots.txt");

		expect(response.status()).toBe(200);
		expect(await response.text()).toContain("Sitemap:");
	});
});
