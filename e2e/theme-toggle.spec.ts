import {
	THEME_ATTRIBUTE,
	THEME_STORAGE_KEY,
	THEME_TOGGLE_CLASS,
	THEME_TOGGLE_INPUT_CLASS,
	THEME_TOGGLE_TOGGLED_CLASS,
	Theme,
	type ThemePreference,
} from "@modules/core/components/themeToggle/const";
import { expect, type Page, test } from "@playwright/test";

const TOGGLE = `.${THEME_TOGGLE_CLASS}`;
const TOGGLE_INPUT = `.${THEME_TOGGLE_INPUT_CLASS}`;

const storedPreference = (page: Page) => page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY);

interface ChoosePreferenceParams {
	page: Page;
	preference: ThemePreference;
}

const choosePreference = ({ page, preference }: ChoosePreferenceParams) =>
	page.evaluate(([key, value]) => localStorage.setItem(key, value), [THEME_STORAGE_KEY, preference]);

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

		test("follows the operating system when it prefers dark", async ({ page }) => {
			await page.goto("/");

			await settle({ page, theme: "dark" });
			await expect(page.locator(TOGGLE)).toHaveClass(new RegExp(THEME_TOGGLE_TOGGLED_CLASS));
		});
	});

	test.describe("with a light operating system", () => {
		test.use({ colorScheme: "light" });

		test("follows the operating system when it prefers light", async ({ page }) => {
			await page.goto("/");

			await settle({ page, theme: "light" });
			await expect(page.locator(TOGGLE)).not.toHaveClass(new RegExp(THEME_TOGGLE_TOGGLED_CLASS));
		});

		test("switches the document theme and persists the choice", async ({ page }) => {
			await page.goto("/");
			await settle({ page, theme: "light" });

			await page.locator(TOGGLE).click();

			await settle({ page, theme: "dark" });
			expect(await storedPreference(page)).toBe("dark");
		});

		test("stores nothing while it is only mirroring the operating system", async ({ page }) => {
			await page.goto("/");

			await settle({ page, theme: "light" });
			expect(await storedPreference(page)).toBeNull();
		});

		test("still follows the operating system on a later visit", async ({ page }) => {
			await page.goto("/");
			await settle({ page, theme: "light" });

			await page.emulateMedia({ colorScheme: "dark" });
			await page.reload();

			await settle({ page, theme: "dark" });
			expect(await storedPreference(page)).toBeNull();
		});

		test("leaves an explicit choice alone when the operating system changes under it", async ({ page }) => {
			await page.goto("/");
			await settle({ page, theme: "light" });

			await page.locator(TOGGLE).click();
			await settle({ page, theme: "dark" });
			await page.locator(TOGGLE).click();
			await settle({ page, theme: "light" });

			await page.emulateMedia({ colorScheme: "dark" });

			await settle({ page, theme: "light" });
			expect(await storedPreference(page)).toBe("light");
		});

		test("keeps the chosen theme across a reload", async ({ page }) => {
			await page.goto("/");
			await settle({ page, theme: "light" });

			await page.locator(TOGGLE).click();
			await settle({ page, theme: "dark" });

			await page.reload();

			await settle({ page, theme: "dark" });
			expect(await storedPreference(page)).toBe("dark");
		});

		test("lets a stored preference win over the operating system", async ({ page }) => {
			await page.goto("/");
			await choosePreference({ page, preference: "dark" });

			await page.reload();

			await settle({ page, theme: "dark" });
		});

		test("applies the stored theme before the page renders, so there is no flash", async ({ page }) => {
			await page.goto("/");
			await choosePreference({ page, preference: "dark" });
			await page.addInitScript((attribute) => {
				new MutationObserver((_, observer) => {
					if (!document.body) return;

					document.documentElement.dataset.themeAtFirstParse = document.documentElement.getAttribute(attribute) ?? "";
					observer.disconnect();
				}).observe(document, { childList: true, subtree: true });
			}, THEME_ATTRIBUTE);

			await page.goto("/");

			await expect(page.locator("html")).toHaveAttribute("data-theme-at-first-parse", "dark");
		});
	});
});
