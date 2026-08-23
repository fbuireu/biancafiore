import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@modules/core/components/themeToggle/const";
import { expect, type Page, test } from "@playwright/test";

const TOGGLE = ".theme-toggle";
const TOGGLE_INPUT = ".theme-toggle__input";
const TOGGLED_MODIFIER = "theme-toggle--toggled";

const storedPreference = (page: Page) => page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY);

interface ChoosePreferenceParams {
	page: Page;
	preference: string;
}

const choosePreference = ({ page, preference }: ChoosePreferenceParams) =>
	page.evaluate(([key, value]) => localStorage.setItem(key, value), [THEME_STORAGE_KEY, preference]);

const settle = async (page: Page, theme: "dark" | "light") => {
	await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, theme);
	await expect(page.locator(TOGGLE_INPUT)).toBeChecked({ checked: theme === "dark" });
};

test.describe("theme toggle", () => {
	test.describe("with no stored preference", () => {
		test.use({ colorScheme: "dark" });

		test("follows the operating system when it prefers dark", async ({ page }) => {
			await page.goto("/");

			await settle(page, "dark");
			await expect(page.locator(TOGGLE)).toHaveClass(new RegExp(TOGGLED_MODIFIER));
		});
	});

	test.describe("with a light operating system", () => {
		test.use({ colorScheme: "light" });

		test("follows the operating system when it prefers light", async ({ page }) => {
			await page.goto("/");

			await settle(page, "light");
			await expect(page.locator(TOGGLE)).not.toHaveClass(new RegExp(TOGGLED_MODIFIER));
		});

		test("switches the document theme and persists the choice", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.locator(TOGGLE).click();

			await settle(page, "dark");
			expect(await storedPreference(page)).toBe("dark");
		});

		test("stores nothing while it is only mirroring the operating system", async ({ page }) => {
			await page.goto("/");

			await settle(page, "light");
			expect(await storedPreference(page)).toBeNull();
		});

		test("still follows the operating system on a later visit", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.emulateMedia({ colorScheme: "dark" });
			await page.reload();

			await settle(page, "dark");
			expect(await storedPreference(page)).toBeNull();
		});

		test("leaves an explicit choice alone when the operating system changes under it", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.locator(TOGGLE).click();
			await settle(page, "dark");
			await page.locator(TOGGLE).click();
			await settle(page, "light");

			await page.emulateMedia({ colorScheme: "dark" });

			await settle(page, "light");
			expect(await storedPreference(page)).toBe("light");
		});

		test("keeps the chosen theme across a reload", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.locator(TOGGLE).click();
			await settle(page, "dark");

			await page.reload();

			await settle(page, "dark");
			expect(await storedPreference(page)).toBe("dark");
		});

		test("lets a stored preference win over the operating system", async ({ page }) => {
			await page.goto("/");
			await choosePreference({ page, preference: "dark" });

			await page.reload();

			await settle(page, "dark");
		});

		test("applies the stored theme before the page renders, so there is no flash", async ({ page }) => {
			await page.goto("/");
			await choosePreference({ page, preference: "dark" });

			await page.goto("/", { waitUntil: "commit" });

			await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "dark");
		});

		test("returns to light when toggled back", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.locator(TOGGLE).click();
			await settle(page, "dark");

			await page.locator(TOGGLE).click();

			await settle(page, "light");
			expect(await storedPreference(page)).toBe("light");
		});
	});
});
