import { TAB_CLASS, TabId } from "@modules/contact/components/tabs/const";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const TAB = `.${TAB_CLASS}`;
const APPOINTMENT_TAB = `${TAB}[data-target="${TabId.APPOINTMENT}"]`;
const APPOINTMENT_CONTENT = `#${TabId.APPOINTMENT}`;
const EMAIL_CONTENT = `#${TabId.EMAIL}`;

const skipWithoutTabs = async (page: Page) => {
	const servesTabs = (await page.locator(TAB).count()) > 0;

	test.skip(!servesTabs, "HIDE_CHROME serves /contact as the under-construction placeholder");
};

const arriveAtContact = async (page: Page) => {
	await page.goto("/");
	await page.goto("/contact");
	await skipWithoutTabs(page);
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
		await skipWithoutTabs(page);

		await expect(page.locator(APPOINTMENT_CONTENT)).toBeVisible();
		await expect(page.locator(EMAIL_CONTENT)).toBeHidden();
		await expect(page).toHaveURL("/contact?tab=appointment");
	});
});
