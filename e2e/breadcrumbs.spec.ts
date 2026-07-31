import { expect, type Page, test } from "@playwright/test";

const ARTICLE_LINK = 'a.article-card__link[href^="/articles/"]';
const CRUMB = ".breadcrumb__item";
const CRUMB_LINK = ".breadcrumb__item a";
const CURRENT_CRUMB = ".breadcrumb__item strong.current-page";
const WORD_START = /\b\w/g;
const NAVIGATION_TIMEOUT = 30_000;

const humanize = (segment: string): string =>
	segment.replaceAll("-", " ").replace(WORD_START, (match) => match.toUpperCase());

const firstArticlePath = async (page: Page): Promise<string | null> => {
	await page.goto("/articles");
	const links = page.locator(ARTICLE_LINK);

	if ((await links.count()) === 0) {
		return null;
	}

	return links.first().getAttribute("href");
};

test.describe("breadcrumbs on a nested page", () => {
	test("names one crumb per path segment, starting at Home", async ({ page }) => {
		const path = await firstArticlePath(page);
		test.skip(!path, "the articles index published no article in this environment");
		if (!path) return;

		await page.goto(path);

		const segments = path.split("/").filter(Boolean);
		await expect(page.locator(CRUMB)).toHaveCount(segments.length + 1);
		await expect(page.locator(CRUMB_LINK).first()).toHaveText("Home");
		await expect(page.locator(CRUMB_LINK).first()).toHaveAttribute("href", "/");
		await expect(page.locator(CRUMB_LINK)).toHaveText(["Home", ...segments.slice(0, -1).map(humanize)]);
	});

	test("leaves the page being viewed as plain text rather than a link", async ({ page }) => {
		const path = await firstArticlePath(page);
		test.skip(!path, "the articles index published no article in this environment");
		if (!path) return;

		await page.goto(path);

		const segments = path.split("/").filter(Boolean);
		await expect(page.locator(CURRENT_CRUMB)).toHaveText(humanize(segments[segments.length - 1] ?? ""));
		await expect(page.locator(`${CRUMB}:last-child a`)).toHaveCount(0);
	});

	test("walks back up the trail through an intermediate crumb", async ({ page }) => {
		const path = await firstArticlePath(page);
		test.skip(!path, "the articles index published no article in this environment");
		if (!path) return;

		await page.goto(path);

		await page.locator(CRUMB_LINK).nth(1).click();

		await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Blog", { timeout: NAVIGATION_TIMEOUT });
		expect(new URL(page.url()).pathname).toBe("/articles");
	});
});
