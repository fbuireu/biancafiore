import { READING_PROGRESS_CLASS } from "@modules/article/components/readingProgress/const";
import { ARTICLE_BODY_CLASS } from "@modules/article/const";
import { ARTICLE_CARD_LINK_CLASS } from "@modules/core/components/articleCard/const";
import { COOKIE_CONSENT_BUTTON_CLASS } from "@modules/core/components/cookieConsent/const";
import {
	EMAIL_ADDRESS_PLACEHOLDER,
	EMAIL_BUTTON_SHOWS_ADDRESS,
	EMAIL_BUTTON_SHOWS_ATTRIBUTE,
} from "@modules/core/components/emailButton/const";
import { HEADER_MENU_BUTTON_CLASS, MENU_OPEN_CLASS } from "@modules/core/components/header/const";
import { RELATED_ARTICLES_SLIDER_CLASS } from "@modules/core/components/relatedArticles/const";
import { SLIDER_NEXT_CLASS, SLIDER_TRACK_CLASS } from "@modules/core/components/sliderShell/const";
import { THEME_ATTRIBUTE, THEME_TOGGLE_CLASS } from "@modules/core/components/themeToggle/const";
import { expect, type Page, test } from "@playwright/test";

const ARTICLE_BODY = `.${ARTICLE_BODY_CLASS}`;
const ARTICLE_CARD_LINK = `.${ARTICLE_CARD_LINK_CLASS}`;
const ARTICLE_URL = /\/articles\/.+/;
const COOKIE_BANNER = "We use cookies";
const COOKIE_CONSENT_BUTTON = `.${COOKIE_CONSENT_BUTTON_CLASS}`;
const COOKIE_PREFERENCES = "Manage cookie preferences";
const EMAIL_ADDRESS_BUTTON = `[${EMAIL_BUTTON_SHOWS_ATTRIBUTE}="${EMAIL_BUTTON_SHOWS_ADDRESS}"]`;
const MENU_BUTTON = `.${HEADER_MENU_BUTTON_CLASS}`;
const READING_PROGRESS = `.${READING_PROGRESS_CLASS}`;
const RELATED_ARTICLES_SLIDER = `.${RELATED_ARTICLES_SLIDER_CLASS}`;
const SLIDER_NEXT = `${RELATED_ARTICLES_SLIDER} .${SLIDER_NEXT_CLASS}`;
const SLIDER_TRACK = `${RELATED_ARTICLES_SLIDER} .${SLIDER_TRACK_CLASS}`;
const THEME_TOGGLE = `.${THEME_TOGGLE_CLASS}`;

const paintedTheme = (page: Page) => page.locator("html").getAttribute(THEME_ATTRIBUTE);

const presentAsAHumanVisitor = (page: Page) =>
	page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));

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

interface ClickArticleCardParams {
	page: Page;
	index: number;
}

const clickArticleCard = async ({ page, index }: ClickArticleCardParams) => {
	const link = page.locator(ARTICLE_CARD_LINK).nth(index);

	await link.scrollIntoViewIfNeeded();
	await link.click();
	await page.waitForURL(ARTICLE_URL);
	await expect(page.locator(ARTICLE_BODY)).toBeAttached();
};

interface OpenAnArticleParams {
	page: Page;
	index: number;
}

const openAnArticle = async ({ page, index }: OpenAnArticleParams) => {
	await visit({ page, path: "/articles" });
	await expect(page.locator("[data-astro-exec]").first()).toBeAttached();

	await clickArticleCard({ page, index });
};

interface OpenAnotherArticleParams {
	page: Page;
	index: number;
}

const openAnotherArticle = async ({ page, index }: OpenAnotherArticleParams) => {
	await page.goBack();
	await page.waitForURL("**/articles");
	await expect(page.locator(ARTICLE_BODY)).toHaveCount(0);

	await clickArticleCard({ page, index });
};

interface FollowFooterLinkParams {
	page: Page;
	path: string;
}

const followFooterLink = async ({ page, path }: FollowFooterLinkParams) => {
	await page.locator(`footer a[href="${path}"]`).first().click();
	await page.waitForURL(`**${path}`);
};

test.describe("wiring survives a ClientRouter swap", () => {
	test("swaps the document without re-running the bundled scripts", async ({ page }) => {
		await openAnArticle({ page, index: 0 });

		const executed = await page.locator("[data-astro-exec]").count();
		const firstArticle = page.url();

		await openAnotherArticle({ page, index: 1 });

		expect(page.url()).not.toBe(firstArticle);
		expect(await page.locator("[data-astro-exec]").count()).toBe(executed);
	});

	test("keeps the theme toggle repainting after two swaps", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await openAnotherArticle({ page, index: 1 });

		const before = await paintedTheme(page);

		await page.locator(THEME_TOGGLE).click();

		await expect(page.locator("html")).not.toHaveAttribute(THEME_ATTRIBUTE, String(before));
	});

	test("keeps the reading progress bar following the reader after two swaps", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await openAnotherArticle({ page, index: 1 });

		await page.mouse.wheel(0, 2000);

		await expect.poll(() => page.locator(READING_PROGRESS).evaluate((bar) => bar.style.width)).not.toBe("");
	});

	test("keeps the related-articles slider moving after two swaps", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await openAnotherArticle({ page, index: 1 });

		const next = page.locator(SLIDER_NEXT);

		test.skip((await next.count()) === 0, "this Article has no Related Articles");

		const track = page.locator(SLIDER_TRACK);

		test.skip(
			!(await track.evaluate((element) => element.scrollWidth > element.clientWidth)),
			"this Article's Related Articles fit the track, so there is nothing to scroll to",
		);

		const before = await track.evaluate((element) => element.scrollLeft);

		await next.click();

		await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
	});

	test("closes the menu on the first Escape, however many pages the reader has visited", async ({ page }) => {
		await openAnArticle({ page, index: 0 });
		await openAnotherArticle({ page, index: 1 });

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
		await followFooterLink({ page, path: "/terms-and-conditions" });
		await followFooterLink({ page, path: "/privacy-policy" });

		const address = page.locator(EMAIL_ADDRESS_BUTTON).first();

		test.skip((await address.count()) === 0, "this route serves no address button");

		await expect(address).not.toHaveText(EMAIL_ADDRESS_PLACEHOLDER);
		await expect(address).toContainText("@");
	});

	test("shows the unanswered cookie banner once after two swaps", async ({ page }) => {
		await presentAsAHumanVisitor(page);
		await visit({ page, path: "/articles" });
		await followFooterLink({ page, path: "/terms-and-conditions" });
		await followFooterLink({ page, path: "/privacy-policy" });

		await expect(page.getByRole("dialog", { name: COOKIE_BANNER })).toHaveCount(1);
		await expect(page.getByRole("dialog", { name: COOKIE_BANNER })).toBeVisible();
	});

	test("keeps the cookie preferences opening after two swaps", async ({ page }) => {
		await presentAsAHumanVisitor(page);
		await visit({ page, path: "/articles" });
		await followFooterLink({ page, path: "/terms-and-conditions" });
		await followFooterLink({ page, path: "/privacy-policy" });

		await page.locator(COOKIE_CONSENT_BUTTON).click();

		await expect(page.getByRole("dialog", { name: COOKIE_PREFERENCES })).toHaveCount(1);
		await expect(page.getByRole("dialog", { name: COOKIE_PREFERENCES })).toBeVisible();
	});
});
