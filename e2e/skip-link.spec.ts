import { HEADER_MENU_BUTTON_CLASS } from "@modules/core/components/header/const";
import { MAIN_CONTENT_ID, SKIP_LINK_CLASS } from "@modules/core/components/skipLink/const";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const MENU_BUTTON = `.${HEADER_MENU_BUTTON_CLASS}`;
const SKIP_LINK = `.${SKIP_LINK_CLASS}`;
const MAIN = `#${MAIN_CONTENT_ID}`;

const openArticles = async (page: Page): Promise<void> => {
	await page.goto("/articles");

	test.skip((await page.locator(SKIP_LINK).count()) === 0, "HIDE_CHROME serves this route without a header");
};

test.describe("the skip link", () => {
	test("takes the first Tab and shows itself, above the header", async ({ page }) => {
		await openArticles(page);
		await page.keyboard.press("Tab");

		const link = page.locator(SKIP_LINK);

		await expect(link).toBeFocused();
		await expect(link).toBeInViewport({ ratio: 1 });
		expect(await link.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(1);
	});

	test("stays out of sight until it is focused", async ({ page }) => {
		await openArticles(page);

		const box = await page.locator(SKIP_LINK).evaluate((element) => element.getBoundingClientRect().toJSON());

		expect(box.width).toBeLessThanOrEqual(1);
		expect(box.height).toBeLessThanOrEqual(1);
	});

	test("moves keyboard focus into the main content, so the next Tab lands past the header", async ({ page }) => {
		await openArticles(page);
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");

		await expect(page.locator(MAIN)).toBeFocused();
		await expect(page.locator(MAIN)).toHaveCSS("outline-style", "none");

		await page.keyboard.press("Tab");

		expect(
			await page.evaluate((selector) => document.querySelector(selector)?.contains(document.activeElement), MAIN),
		).toBe(true);
	});

	test("is taken out of the tab order while the menu is open, since the page behind it is inert", async ({ page }) => {
		await openArticles(page);
		await page.locator(MENU_BUTTON).click();

		await expect(page.locator(SKIP_LINK)).toHaveJSProperty("inert", true);

		await page.keyboard.press("Escape");

		await expect(page.locator(SKIP_LINK)).toHaveJSProperty("inert", false);
	});
});
