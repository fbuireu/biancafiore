import CookieConsent from "@modules/core/components/cookieConsent/CookieConsent";
import { cleanup, render, screen } from "@testing-library/react";
import { eraseCookies, getCookie } from "vanilla-cookieconsent";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const COOKIE_NAME = "cc_cookie";
const ANALYTICS_TOGGLE = "Performance and Analytics cookies";

const analyticsConsentUpdates = (): string[] =>
	(window.dataLayer as [string, string, Record<string, string>][])
		.filter((entry) => entry[0] === "consent" && entry[1] === "update")
		.map((entry) => entry[2].analytics_storage);

const acceptedCategories = (): string[] => getCookie("categories") ?? [];

const showBanner = async (): Promise<void> => {
	render(<CookieConsent />);
	await screen.findByRole("dialog", { name: "We use cookies" });
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
	cleanup();
	eraseCookies(COOKIE_NAME);
});

describe("CookieConsent", () => {
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
});
