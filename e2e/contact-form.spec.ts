import { expect, type Page, test } from "@playwright/test";

const CONTACT_ACTION = /\/_actions\/contact$/;
const RECAPTCHA_SCRIPT = /recaptcha\/api\.js/;
const NAME_INPUT = 'input[name="name"]';
const EMAIL_INPUT = 'input[name="email"]';
const MESSAGE_INPUT = 'textarea[name="message"]';
const SUBMIT = ".contact-form__submit";
const FIELD_ERROR = ".contact-form__input__error-message";
const MESSAGE_ERROR = ".contact-form__textarea__error-message";
const GENERIC_ERROR = ".contact-form__generic-error-message";
const SUCCESS_MESSAGE = ".contact-form__success-message";

const DEVALUE_OK = '[{"ok":1},true]';
const RECAPTCHA_TOKEN = "e2e-recaptcha-token";
const SUBMIT_TIMEOUT = 30_000;
const REJECTED_MESSAGE = "That address already reached me";
const FAILED_MESSAGE = "Whoopsie! Something went wrong on my side.";

const VALID_SUBMISSION = {
	name: "Ada Lovelace",
	email: "ada@example.com",
	message: "I would like to talk about the analytical engine.",
};

interface ActionErrorOptions {
	code: string;
	message: string;
}

interface StubContactActionOptions {
	page: Page;
	status?: number;
	body?: string;
}

interface FillContactFormOptions {
	page: Page;
	name: string;
	email: string;
	message: string;
}

const actionError = ({ code, message }: ActionErrorOptions): string =>
	JSON.stringify({ type: "AstroActionError", code, message });

const stubRecaptcha = (page: Page) =>
	page.route(RECAPTCHA_SCRIPT, (route) =>
		route.fulfill({
			status: 200,
			contentType: "text/javascript",
			body: `window.grecaptcha={ready:(callback)=>callback(),execute:()=>Promise.resolve("${RECAPTCHA_TOKEN}")};`,
		}),
	);

const stubContactAction = async ({ page, status = 200, body = DEVALUE_OK }: StubContactActionOptions) => {
	const payloads: string[] = [];

	await page.route(CONTACT_ACTION, async (route) => {
		payloads.push(route.request().postData() ?? "");
		await route.fulfill({ status, contentType: "application/json", body });
	});

	return payloads;
};

const openContactForm = async (page: Page) => {
	await page.goto("/contact");
	await expect(page.locator(SUBMIT)).toBeVisible();
};

const fillContactForm = async ({ page, name, email, message }: FillContactFormOptions) => {
	await page.fill(NAME_INPUT, name);
	await page.fill(EMAIL_INPUT, email);
	await page.fill(MESSAGE_INPUT, message);
};

test.describe("contact form", () => {
	test.beforeEach(async ({ page }) => {
		await stubRecaptcha(page);
	});

	test("names every field the visitor left blank", async ({ page }) => {
		const payloads = await stubContactAction({ page });
		await openContactForm(page);

		await page.locator(SUBMIT).click();

		await expect(page.locator(FIELD_ERROR)).toHaveText(["Please insert your name", "Still not a valid email fella"]);
		await expect(page.locator(MESSAGE_ERROR)).toHaveText("Please insert a valid message");
		expect(payloads).toHaveLength(0);
	});

	test("marks the fields it rejected for a screen reader", async ({ page }) => {
		await stubContactAction({ page });
		await openContactForm(page);

		await page.locator(SUBMIT).click();

		await expect(page.locator(NAME_INPUT)).toHaveAttribute("aria-invalid", "true");
		await expect(page.locator(EMAIL_INPUT)).toHaveAttribute("aria-invalid", "true");
		await expect(page.locator(MESSAGE_INPUT)).toHaveAttribute("aria-invalid", "true");
	});

	test("rejects an address the browser accepts but the schema does not", async ({ page }) => {
		const payloads = await stubContactAction({ page });
		await openContactForm(page);
		await fillContactForm({ page, ...VALID_SUBMISSION, email: "ada@example" });

		await page.locator(SUBMIT).click();

		await expect(page.locator(FIELD_ERROR)).toHaveText(["Still not a valid email fella"]);
		await expect(page.locator(MESSAGE_ERROR)).toHaveCount(0);
		expect(payloads).toHaveLength(0);
	});

	test("sends what the visitor typed, together with the reCAPTCHA token", async ({ page }) => {
		const payloads = await stubContactAction({ page });
		await openContactForm(page);
		await fillContactForm({ page, ...VALID_SUBMISSION });

		await page.locator(SUBMIT).click();

		await expect.poll(() => payloads.length, { timeout: SUBMIT_TIMEOUT }).toBe(1);
		expect(payloads[0]).toContain(VALID_SUBMISSION.name);
		expect(payloads[0]).toContain(VALID_SUBMISSION.email);
		expect(payloads[0]).toContain(VALID_SUBMISSION.message);
		expect(payloads[0]).toContain(RECAPTCHA_TOKEN);
	});

	test("replaces the form with a confirmation once the action succeeds", async ({ page }) => {
		await stubContactAction({ page });
		await openContactForm(page);
		await fillContactForm({ page, ...VALID_SUBMISSION });

		await page.locator(SUBMIT).click();

		await expect(page.locator(SUCCESS_MESSAGE)).toContainText("Form sent correctly! Will be in touch soon", {
			timeout: SUBMIT_TIMEOUT,
		});
		await expect(page.locator(SUBMIT)).toHaveCount(0);
	});

	test("shows the reason the action gave when it rejects the submission", async ({ page }) => {
		await stubContactAction({
			page,
			status: 400,
			body: actionError({ code: "BAD_REQUEST", message: REJECTED_MESSAGE }),
		});
		await openContactForm(page);
		await fillContactForm({ page, ...VALID_SUBMISSION });

		await page.locator(SUBMIT).click();

		await expect(page.locator(GENERIC_ERROR)).toHaveText(REJECTED_MESSAGE, { timeout: SUBMIT_TIMEOUT });
		await expect(page.locator(SUCCESS_MESSAGE)).toHaveCount(0);
		await expect(page.locator(SUBMIT)).toBeEnabled();
	});

	test("shows the reason the action gave when the submission fails on the server", async ({ page }) => {
		await stubContactAction({
			page,
			status: 500,
			body: actionError({ code: "INTERNAL_SERVER_ERROR", message: FAILED_MESSAGE }),
		});
		await openContactForm(page);
		await fillContactForm({ page, ...VALID_SUBMISSION });

		await page.locator(SUBMIT).click();

		await expect(page.locator(GENERIC_ERROR)).toHaveText(FAILED_MESSAGE, { timeout: SUBMIT_TIMEOUT });
		await expect(page.locator(SUCCESS_MESSAGE)).toHaveCount(0);
		await expect(page.locator(SUBMIT)).toBeEnabled();
	});
});
