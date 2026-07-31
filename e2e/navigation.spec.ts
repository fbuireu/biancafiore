import { expect, type Page, test } from "@playwright/test";

const ARTICLES_LINK = "a.blog__title__link";
const ARTICLE_CARD = ".articles__grid__item";
const ARTICLE_CARD_LINK = "a.article-card__link";
const ARTICLE_CARD_TITLE = ".article-card__title";
const ARTICLE_TITLE = "h1.article-details__title";
const THEME_TOGGLE = ".theme-toggle";
const THEME_TOGGLE_INPUT = ".theme-toggle__input";
const SWAP_PROBE_KEY = "e2e-theme-at-swap";
const NAVIGATION_TIMEOUT = 30_000;

const openArticlesIndex = async (page: Page) => {
	await page.goto("/");

	await page.locator(ARTICLES_LINK).click();

	await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Blog", { timeout: NAVIGATION_TIMEOUT });
	expect(new URL(page.url()).pathname).toBe("/articles");
};

const recordThemeAtSwap = (page: Page) =>
	page.evaluate((key) => {
		localStorage.removeItem(key);
		document.addEventListener("astro:after-swap", () => {
			localStorage.setItem(key, document.documentElement.getAttribute("data-theme") ?? "none");
		});
	}, SWAP_PROBE_KEY);

const themeRecordedAtSwap = (page: Page) => page.evaluate((key) => localStorage.getItem(key), SWAP_PROBE_KEY);

test.describe("navigating from the home page into an article", () => {
	test.use({ colorScheme: "light" });

	test("reaches the articles index from the home page", async ({ page }) => {
		await openArticlesIndex(page);
	});

	test("opens the article the index links to", async ({ page }) => {
		await openArticlesIndex(page);

		const cards = page.locator(ARTICLE_CARD);
		const published = await cards.count();
		test.skip(published === 0, "the articles index rendered no article card in this environment");

		const firstCard = cards.first();
		const expectedTitle = (await firstCard.locator(ARTICLE_CARD_TITLE).innerText()).trim();
		const href = await firstCard.locator(ARTICLE_CARD_LINK).getAttribute("href");

		await firstCard.locator(ARTICLE_CARD_LINK).click();

		await expect(page.locator(ARTICLE_TITLE)).toHaveText(expectedTitle, { timeout: NAVIGATION_TIMEOUT });
		expect(new URL(page.url()).pathname).toBe(href);
	});

	test("keeps the chosen theme while the view transition swaps the document", async ({ page }) => {
		await page.goto("/");
		await page.locator(THEME_TOGGLE).click();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		await recordThemeAtSwap(page);

		await page.locator(ARTICLES_LINK).click();

		await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Blog", { timeout: NAVIGATION_TIMEOUT });
		expect(await themeRecordedAtSwap(page)).toBe("dark");
		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		await expect(page.locator(THEME_TOGGLE_INPUT)).toBeChecked();
	});
});
