import { screen } from "@testing-library/react";
import { eraseCookies, getCookie, reset } from "vanilla-cookieconsent";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COOKIE_CONSENT_BUTTON_CLASS } from "../const";
import { CONSENT_COOKIE_NAME } from "./consentGate";
import { initCookieConsent } from "./interactions";

const ANALYTICS_TOGGLE = "Performance and Analytics cookies";
const BANNER = "We use cookies";
const PREFERENCES = "Manage cookie preferences";

const analyticsConsentUpdates = (): string[] =>
	(window.dataLayer as [string, string, Record<string, string>][])
		.filter((entry) => entry[0] === "consent" && entry[1] === "update")
		.map((entry) => entry[2].analytics_storage);

const acceptedCategories = (): string[] => getCookie("categories") ?? [];

const footer = `<footer><button type="button" class="${COOKIE_CONSENT_BUTTON_CLASS}">Manage cookies</button></footer>`;

const visitAPage = async (): Promise<void> => {
	document.body.innerHTML = footer;
	await initCookieConsent();
};

const showBanner = async (): Promise<void> => {
	await visitAPage();
	await screen.findByRole("dialog", { name: BANNER });
};

const press = (name: string): void => screen.getByRole("button", { name }).click();

const analyticsToggle = async (): Promise<HTMLInputElement> =>
	(await screen.findByRole("checkbox", { name: ANALYTICS_TOGGLE })) as HTMLInputElement;

const presentAsAHumanVisitor = (): void => {
	Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
};

beforeEach(() => {
	presentAsAHumanVisitor();
	window.dataLayer = [];
});

afterEach(() => {
	reset();
	document.body.innerHTML = "";
	eraseCookies(CONSENT_COOKIE_NAME);
	Reflect.deleteProperty(window, "dataLayer");
	Reflect.deleteProperty(navigator, "webdriver");
});

describe("initCookieConsent", () => {
	it("sends no consent update until the visitor answers the banner", async () => {
		await showBanner();

		expect(analyticsConsentUpdates()).toEqual([]);
	});

	it("offers the analytics category switched off, so accepting it is a deliberate act", async () => {
		await showBanner();

		press("Manage Individual preferences");

		expect((await analyticsToggle()).checked).toBe(false);
	});

	it("keeps analytics denied when the visitor rejects the banner", async () => {
		await showBanner();

		press("Reject all");

		expect(acceptedCategories()).not.toContain("analytics");
		expect(analyticsConsentUpdates()).toEqual(["denied"]);
	});

	it("grants analytics only once the visitor accepts the analytics category", async () => {
		await showBanner();

		press("Accept all");

		expect(acceptedCategories()).toContain("analytics");
		expect(analyticsConsentUpdates()).toEqual(["granted"]);
	});

	it("denies analytics again when a visitor who had accepted withdraws consent", async () => {
		await showBanner();
		press("Accept all");

		press("Manage cookies");
		(await analyticsToggle()).click();
		press("Save preferences");

		expect(acceptedCategories()).not.toContain("analytics");
		expect(analyticsConsentUpdates()).toEqual(["granted", "denied"]);
	});

	it("opens the preferences from the footer button", async () => {
		await showBanner();
		press("Reject all");

		press("Manage cookies");

		expect(await screen.findByRole("dialog", { name: PREFERENCES })).toBeTruthy();
	});

	it("shows an unanswered banner again on the page that replaces the body, and only one", async () => {
		await showBanner();

		await visitAPage();

		expect(await screen.findAllByRole("dialog", { name: BANNER })).toHaveLength(1);
	});

	it("opens the preferences from the footer button of the page that replaces the body", async () => {
		await showBanner();
		press("Reject all");

		await visitAPage();
		press("Manage cookies");

		expect(await screen.findAllByRole("dialog", { name: PREFERENCES })).toHaveLength(1);
	});

	it("reports the answer once on every page a visitor who has answered loads", async () => {
		await showBanner();
		press("Accept all");

		await visitAPage();

		expect(analyticsConsentUpdates()).toEqual(["granted", "granted"]);

		await visitAPage();

		expect(analyticsConsentUpdates()).toEqual(["granted", "granted", "granted"]);
	});

	it("builds the banner once when the same page is initialised twice", async () => {
		await showBanner();

		await initCookieConsent();

		expect(await screen.findAllByRole("dialog", { name: BANNER })).toHaveLength(1);
	});

	it("leaves the page alone when it carries no footer button", async () => {
		document.body.innerHTML = "";

		await expect(initCookieConsent()).resolves.toBeUndefined();
		expect(await screen.findByRole("dialog", { name: BANNER })).toBeTruthy();
	});
});
