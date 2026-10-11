import {
	THEME_ATTRIBUTE,
	THEME_STORAGE_KEY,
	THEME_TOGGLE_CLASS,
	THEME_TOGGLE_INPUT_CLASS,
	THEME_TOGGLE_TOGGLED_CLASS,
	Theme,
} from "@modules/core/components/themeToggle/const";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const TOGGLE = `.${THEME_TOGGLE_CLASS}`;
const TOGGLE_INPUT = `.${THEME_TOGGLE_INPUT_CLASS}`;

const storedTheme = (page: Page) => page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY);

interface ChooseThemeParams {
	page: Page;
	theme: Theme;
}

const chooseTheme = ({ page, theme }: ChooseThemeParams) =>
	page.evaluate(([key, value]) => localStorage.setItem(key, value), [THEME_STORAGE_KEY, theme]);

interface SettleParams {
	page: Page;
	theme: Theme;
}

const settle = async ({ page, theme }: SettleParams) => {
	await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, theme);
	await expect(page.locator(TOGGLE_INPUT)).toBeChecked({ checked: theme === Theme.DARK });
};

test.describe("theme toggle", () => {
	test.describe("with a dark operating system", () => {
		test.use({ colorScheme: "dark" });

		test("opens light, without storing a choice, whatever the operating system prefers", async ({ page }) => {
			await page.goto("/");

			await settle({ page, theme: Theme.LIGHT });
			await expect(page.locator(TOGGLE)).not.toHaveClass(new RegExp(THEME_TOGGLE_TOGGLED_CLASS));
			expect(await storedTheme(page)).toBeNull();
		});
	});

	test.describe("with a light operating system", () => {
		test.use({ colorScheme: "light" });

		test("switches the document theme and persists the choice", async ({ page }) => {
			await page.goto("/");
			await settle({ page, theme: Theme.LIGHT });

			await page.locator(TOGGLE).click();

			await settle({ page, theme: Theme.DARK });
			expect(await storedTheme(page)).toBe(Theme.DARK);
		});

		test("keeps the chosen theme across a reload", async ({ page }) => {
			await page.goto("/");
			await settle({ page, theme: Theme.LIGHT });

			await page.locator(TOGGLE).click();
			await settle({ page, theme: Theme.DARK });

			await page.reload();

			await settle({ page, theme: Theme.DARK });
			expect(await storedTheme(page)).toBe(Theme.DARK);
		});

		test("keeps a chosen light theme when the operating system turns dark", async ({ page }) => {
			await page.goto("/");
			await page.locator(TOGGLE).click();
			await settle({ page, theme: Theme.DARK });
			await page.locator(TOGGLE).click();
			await settle({ page, theme: Theme.LIGHT });

			await page.emulateMedia({ colorScheme: "dark" });
			await page.reload();

			await settle({ page, theme: Theme.LIGHT });
			expect(await storedTheme(page)).toBe(Theme.LIGHT);
		});

		test("applies the stored theme before the page renders, so there is no flash", async ({ page }) => {
			await page.goto("/");
			await chooseTheme({ page, theme: Theme.DARK });
			await page.addInitScript((attribute) => {
				new MutationObserver((_, observer) => {
					if (!document.body) return;

					document.documentElement.dataset.themeAtFirstParse = document.documentElement.getAttribute(attribute) ?? "";
					observer.disconnect();
				}).observe(document, { childList: true, subtree: true });
			}, THEME_ATTRIBUTE);

			await page.goto("/");

			await expect(page.locator("html")).toHaveAttribute("data-theme-at-first-parse", Theme.DARK);
		});
	});
});
