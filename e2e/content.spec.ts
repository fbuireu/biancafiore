import { ARTICLE_BODY_CLASS } from "@modules/article/const";
import { expect, test } from "@playwright/test";

const LOCATION = /<loc>([^<]*)<\/loc>/g;
const FEED_LINK = /<link>([^<]*)<\/link>/g;
const ARTICLE_PATH = /^\/articles\/.+/;
const INDEXED_PAGES = ["/", "/about", "/articles", "/contact", "/projects", "/tags"];
const NOINDEX_PAGES = ["/privacy-policy", "/terms-and-conditions"];

interface PathsInParams {
	body: string;
	pattern: RegExp;
}

const pathsIn = ({ body, pattern }: PathsInParams): string[] =>
	[...body.matchAll(pattern)].map(([, url]) => new URL(url ?? "").pathname);

test.describe("content rendered on request", () => {
	test("lists every indexed page and every Article in the sitemap, and none of the pages robots.txt disallows", async ({
		request,
	}) => {
		const response = await request.get("/sitemap.xml");
		const listed = pathsIn({ body: await response.text(), pattern: LOCATION });

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("application/xml");
		expect(INDEXED_PAGES.filter((page) => !listed.includes(page))).toEqual([]);
		expect(listed.filter((page) => ARTICLE_PATH.test(page)).length).toBeGreaterThan(0);
		expect(listed.filter((page) => NOINDEX_PAGES.includes(page))).toEqual([]);
	});

	test("agrees between the feed and the sitemap about where an Article lives, trailing slash included", async ({
		request,
	}) => {
		const sitemap = pathsIn({ body: await (await request.get("/sitemap.xml")).text(), pattern: LOCATION });
		const feed = pathsIn({ body: await (await request.get("/rss.xml")).text(), pattern: FEED_LINK }).filter((path) =>
			ARTICLE_PATH.test(path),
		);

		expect(feed.length).toBeGreaterThan(0);
		expect(feed.filter((path) => path.endsWith("/"))).toEqual([]);
		expect(feed.filter((path) => !sitemap.includes(path))).toEqual([]);
	});

	test("keeps the rendered body of an Article, which set:html once replaced with nothing", async ({
		page,
		request,
	}) => {
		const [article] = pathsIn({ body: await (await request.get("/sitemap.xml")).text(), pattern: LOCATION }).filter(
			(path) => ARTICLE_PATH.test(path),
		);
		const response = await page.goto(article ?? "/articles");

		expect(response?.status()).toBe(200);
		await expect(page.locator(`.${ARTICLE_BODY_CLASS}`)).not.toBeEmpty();
	});

	test("answers 404 for an Article that does not exist, rather than a 500", async ({ page }) => {
		const response = await page.goto("/articles/this-article-does-not-exist");

		expect(response?.status()).toBe(404);
	});
});
