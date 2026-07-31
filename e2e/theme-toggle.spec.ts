import { expect, type Page, test } from "@playwright/test";

const TOGGLE = ".theme-toggle";
const TOGGLE_INPUT = ".theme-toggle__input";
const TOGGLED_MODIFIER = "theme-toggle--toggled";

const storedTheme = (page: Page) => page.evaluate(() => localStorage.getItem("theme"));

const settle = async (page: Page, theme: "dark" | "light") => {
	await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
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
			expect(await storedTheme(page)).toBe("dark");
		});

		test("keeps the chosen theme across a reload", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.locator(TOGGLE).click();
			await settle(page, "dark");

			await page.reload();

			await settle(page, "dark");
			expect(await storedTheme(page)).toBe("dark");
		});

		test("lets a stored preference win over the operating system", async ({ page }) => {
			await page.goto("/");
			await page.evaluate(() => localStorage.setItem("theme", "dark"));

			await page.reload();

			await settle(page, "dark");
		});

		test("applies the stored theme before the page renders, so there is no flash", async ({ page }) => {
			await page.goto("/");
			await page.evaluate(() => localStorage.setItem("theme", "dark"));

			await page.goto("/", { waitUntil: "commit" });

			await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		});

		test("returns to light when toggled back", async ({ page }) => {
			await page.goto("/");
			await settle(page, "light");

			await page.locator(TOGGLE).click();
			await settle(page, "dark");

			await page.locator(TOGGLE).click();

			await settle(page, "light");
			expect(await storedTheme(page)).toBe("light");
		});
	});
});
