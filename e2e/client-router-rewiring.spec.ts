import { EMAIL_ADDRESS_PLACEHOLDER, EMAIL_BUTTON_ADDRESS_CLASS } from "@modules/core/components/emailButton/const";
import { THEME_ATTRIBUTE } from "@modules/core/components/themeToggle/const";
import { expect, type Page, test } from "@playwright/test";

const ARTICLE_CARD_LINK = ".article-card__link";
const ARTICLE_URL = /\/articles\/.+/;
const EMAIL_ADDRESS_BUTTON = `.${EMAIL_BUTTON_ADDRESS_CLASS}`;
const MENU_BUTTON = ".header__menu-button";
const MENU_OPEN_CLASS = "page--menu-open";
const READING_PROGRESS = ".reading-progress";
const SLIDER_NEXT = ".related-articles__slider .slider__btn--next";
const THEME_TOGGLE = ".theme-toggle";

const paintedTheme = (page: Page) => page.locator("html").getAttribute(THEME_ATTRIBUTE);

interface VisitParams {
	page: Page;
	path: string;
}

const SUPERSEDED = "interrupted by another navigation";

const visit = async ({ page, path }: VisitParams) => {
	await page.goto(path).catch((error: Error) => {
		if (!error.message.includes(SUPERSEDED)) throw error;
	});

	await page.waitForURL(`**${path}`);
	await page.waitForLoadState("domcontentloaded");
};

interface OpenAnArticleParams {
	page: Page;
	index: number;
}

const openAnArticle = async ({ page, index }: OpenAnArticleParams) => {
	await visit({ page, path: "/articles" });
	await expect(page.locator("[data-astro-exec]").first()).toBeAttached();

	const link = page.locator(ARTICLE_CARD_LINK).nth(index);

	await link.scrollIntoViewIfNeeded();
	await link.click();
	await page.waitForURL(ARTICLE_URL);
};

test.describe("wiring survives a ClientRouter swap", () => {
	test("swaps the document without re-running the bundled scripts", async ({ page }) => {
		await openAnArticle({ page, index: 0 });

		const executed = await page.locator("[data-astro-exec]").count();
		const firstArticle = page.url();

		await page.goBack();
		await openAnArticle({ page, index: 1 });

		expect(page.url()).not.toBe(firstArticle);
		expect(await page.locator("[data-astro-exec]").count()).toBe(executed);
	});

	test("keeps the theme toggle repainting after two swaps", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await page.goBack();
		await openAnArticle({ page, index: 1 });

		const before = await paintedTheme(page);

		await page.locator(THEME_TOGGLE).click();

		await expect(page.locator("html")).not.toHaveAttribute(THEME_ATTRIBUTE, String(before));
	});

	test("keeps the reading progress bar following the reader after two swaps", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await page.goBack();
		await openAnArticle({ page, index: 1 });

		await page.mouse.wheel(0, 2000);

		await expect.poll(() => page.locator(READING_PROGRESS).evaluate((bar) => bar.style.width)).not.toBe("");
	});

	test("keeps the related-articles slider moving after two swaps", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await page.goBack();
		await openAnArticle({ page, index: 1 });

		const next = page.locator(SLIDER_NEXT);

		test.skip((await next.count()) === 0, "this article suggests too few Articles to scroll");

		const track = page.locator(".related-articles__slider .slider__track");
		const before = await track.evaluate((element) => element.scrollLeft);

		await next.click();

		await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
	});

	test("closes the menu on the first Escape, however many pages the reader has visited", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await page.goBack();
		await openAnArticle({ page, index: 1 });

		const menuButton = page.locator(MENU_BUTTON);

		test.skip((await menuButton.count()) === 0, "HIDE_CHROME serves this route without a header");

		await menuButton.click();
		await expect(page.locator("html")).toHaveClass(new RegExp(MENU_OPEN_CLASS));

		await page.keyboard.press("Escape");

		await expect(page.locator("html")).not.toHaveClass(new RegExp(MENU_OPEN_CLASS));

		await menuButton.click();

		await expect(page.locator("html")).toHaveClass(new RegExp(MENU_OPEN_CLASS));
	});

	test("keeps decoding the email address after two swaps", async ({ page }) => {
		await visit({ page, path: "/articles" });
		await visit({ page, path: "/terms-and-conditions" });
		await visit({ page, path: "/privacy-policy" });

		const address = page.locator(EMAIL_ADDRESS_BUTTON).first();

		test.skip((await address.count()) === 0, "this route serves no address button");

		await expect(address).not.toHaveText(EMAIL_ADDRESS_PLACEHOLDER);
		await expect(address).toContainText("@");
	});
});
