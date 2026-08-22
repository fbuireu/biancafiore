import { EMAIL_ADDRESS_PLACEHOLDER, EMAIL_BUTTON_ADDRESS_CLASS } from "@modules/core/components/emailButton/const";
import { THEME_ATTRIBUTE } from "@modules/core/components/themeToggle/const";
import { expect, type Page, test } from "@playwright/test";

const ARTICLE_CARD_LINK = ".article-card__link";
const EMAIL_ADDRESS_BUTTON = `.${EMAIL_BUTTON_ADDRESS_CLASS}`;
const MENU_BUTTON = ".header__menu-button";
const MENU_OPEN_CLASS = "page--menu-open";
const READING_PROGRESS = ".reading-progress";
const SLIDER_NEXT = ".related-articles__slider .slider__btn--next";
const THEME_TOGGLE = ".theme-toggle";

const paintedTheme = (page: Page) => page.locator("html").getAttribute(THEME_ATTRIBUTE);

const openAnArticle = async (page: Page, index: number) => {
	await page.goto("/articles");
	await page.locator(ARTICLE_CARD_LINK).nth(index).click();
	await expect(page).toHaveURL(/\/articles\/.+/);
};

/**
 * Every scripted component wires itself on `astro:page-load`, because ClientRouter runs a
 * bundled script once per session and swaps the body underneath it. Nothing else in the
 * project can see that: tsc, Biome, the unit suite, astro check and the build only ever
 * observe the first pageview. These specs are the only place a second one exists.
 */
test.describe("wiring survives a ClientRouter swap", () => {
	test("re-runs the initialisers rather than the scripts", async ({ page }) => {
		await openAnArticle(page, 0);
		await page.goBack();
		await openAnArticle(page, 1);

		await expect(page.locator("[data-astro-exec]").first()).toBeAttached();
	});

	test("keeps the theme toggle repainting after two swaps", async ({ page }) => {
		await openAnArticle(page, 0);
		await page.goBack();
		await openAnArticle(page, 1);

		const before = await paintedTheme(page);

		await page.locator(THEME_TOGGLE).click();

		await expect(page.locator("html")).not.toHaveAttribute(THEME_ATTRIBUTE, String(before));
	});

	test("keeps the reading progress bar following the reader after two swaps", async ({ page }) => {
		await openAnArticle(page, 0);
		await page.goBack();
		await openAnArticle(page, 1);

		await page.mouse.wheel(0, 2000);

		await expect.poll(() => page.locator(READING_PROGRESS).evaluate((bar) => bar.style.width)).not.toBe("");
	});

	test("keeps the related-articles slider moving after two swaps", async ({ page }) => {
		await openAnArticle(page, 0);
		await page.goBack();
		await openAnArticle(page, 1);

		const next = page.locator(SLIDER_NEXT);

		test.skip((await next.count()) === 0, "this article suggests too few Articles to scroll");

		const track = page.locator(".related-articles__slider .slider__track");
		const before = await track.evaluate((element) => element.scrollLeft);

		await next.click();

		await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
	});

	test("closes the menu on the first Escape, however many pages the reader has visited", async ({ page }) => {
		await openAnArticle(page, 0);
		await page.goBack();
		await openAnArticle(page, 1);

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
		await page.goto("/articles");
		await page.goto("/terms-and-conditions");
		await page.goto("/privacy-policy");

		const address = page.locator(EMAIL_ADDRESS_BUTTON).first();

		test.skip((await address.count()) === 0, "this route serves no address button");

		await expect(address).not.toHaveText(EMAIL_ADDRESS_PLACEHOLDER);
		await expect(address).toContainText("@");
	});
});
