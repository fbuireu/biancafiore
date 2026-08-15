import { expect, type Page, test } from "@playwright/test";

const TAB = ".contact-tab";
const APPOINTMENT_TAB = '.contact-tab[data-target="appointment"]';
const APPOINTMENT_CONTENT = "#appointment";
const EMAIL_CONTENT = "#email";

const arriveAtContact = async (page: Page) => {
	await page.goto("/");
	await page.goto("/contact");

	const servesTabs = (await page.locator(TAB).count()) > 0;

	test.skip(!servesTabs, "HIDE_CHROME serves /contact as the under-construction placeholder");
};

test.describe("contact tabs", () => {
	test("leaves the contact page on the first Back press", async ({ page }) => {
		await arriveAtContact(page);

		await expect(page.locator(EMAIL_CONTENT)).toBeVisible();

		await page.goBack();

		await expect(page).toHaveURL("/");
	});

	test("publishes a chosen tab without costing the reader a Back press", async ({ page }) => {
		await arriveAtContact(page);

		await page.locator(APPOINTMENT_TAB).click();

		await expect(page).toHaveURL("/contact?tab=appointment");
		await expect(page.locator(APPOINTMENT_CONTENT)).toBeVisible();

		await page.goBack();

		await expect(page).toHaveURL("/");
	});

	test("opens the tab a shared link names, and leaves the link alone", async ({ page }) => {
		await page.goto("/contact?tab=appointment");

		const servesTabs = (await page.locator(TAB).count()) > 0;

		test.skip(!servesTabs, "HIDE_CHROME serves /contact as the under-construction placeholder");

		await expect(page.locator(APPOINTMENT_CONTENT)).toBeVisible();
		await expect(page.locator(EMAIL_CONTENT)).toBeHidden();
		await expect(page).toHaveURL("/contact?tab=appointment");
	});
});
