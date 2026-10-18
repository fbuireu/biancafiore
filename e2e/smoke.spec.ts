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
const ARTICLES_PATH = "/articles";
const RENDERED_BY_THIS_DEPLOY = "?smoke=";
const TRANSFORMED_BY_THIS_DEPLOY = "&smoke=";
const IMAGE_ENDPOINT = "/_image?";
const WEBP = "image/webp";
const NOT_RESIZED =
	"the Articles page renders no /_image source: Astro builds one only for a media URL image.remotePatterns allows. Its first images";
const NOT_TRANSFORMED =
	"EmDash's image endpoint did not answer the page a WebP: it answers 500 when the IMAGES binding refuses the transform, and the original when the Worker has no IMAGES binding";

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

	test("the Articles page's images are resized by the Images binding through EmDash's image endpoint @smoke", async ({
		page,
	}) => {
		const smokeRun = Date.now();
		const response = await page.goto(`${ARTICLES_PATH}${RENDERED_BY_THIS_DEPLOY}${smokeRun}`);

		expect(response?.status()).toBe(200);

		const sources = await page
			.locator("img")
			.evaluateAll((images) => images.map((image) => image.getAttribute("src") ?? ""));
		const resized = sources.find((source) => source.startsWith(IMAGE_ENDPOINT));

		expect(resized, `${NOT_RESIZED}: ${sources.slice(0, 3).join(" | ")}`).toBeDefined();

		const image = await page.evaluate(async (source) => {
			const response = await fetch(source);

			return { status: response.status, type: response.headers.get("content-type") };
		}, `${resized}${TRANSFORMED_BY_THIS_DEPLOY}${smokeRun}`);

		expect(image, NOT_TRANSFORMED).toEqual({ status: 200, type: WEBP });
	});
});
