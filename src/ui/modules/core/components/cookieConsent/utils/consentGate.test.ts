import {
	ANALYTICS_CATEGORY,
	analyticsConsentIn,
	CONSENT_COOKIE_NAME,
	CONSENT_STATUS,
	consentBootstrapScript,
} from "@modules/core/components/cookieConsent/utils/consentGate";
import { describe, expect, it } from "vitest";

const stored = (value: unknown) => `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}`;

describe("analyticsConsentIn", () => {
	it("grants only when the visitor accepted the analytics category by name", () => {
		expect(analyticsConsentIn(stored({ categories: [ANALYTICS_CATEGORY] }))).toBe(CONSENT_STATUS.GRANTED);
	});

	it("denies when the visitor accepted some other category, however many", () => {
		expect(analyticsConsentIn(stored({ categories: ["necessary", "functional"] }))).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when the visitor accepted nothing at all", () => {
		expect(analyticsConsentIn(stored({ categories: [] }))).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when no consent cookie has been written yet, which is the first visit", () => {
		expect(analyticsConsentIn("")).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when the cookie exists but holds nothing readable", () => {
		expect(analyticsConsentIn(`${CONSENT_COOKIE_NAME}=not-json`)).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when the cookie carries no categories array at all", () => {
		expect(analyticsConsentIn(stored({}))).toBe(CONSENT_STATUS.DENIED);
	});

	it("reads its own cookie rather than one whose name merely ends the same way", () => {
		expect(
			analyticsConsentIn(`other_${CONSENT_COOKIE_NAME}=${encodeURIComponent('{"categories":["analytics"]}')}`),
		).toBe(CONSENT_STATUS.DENIED);
	});

	it("finds its cookie among others, whatever position it sits in", () => {
		expect(analyticsConsentIn(`theme=dark; ${stored({ categories: [ANALYTICS_CATEGORY] })}; other=1`)).toBe(
			CONSENT_STATUS.GRANTED,
		);
	});
});

describe("consentBootstrapScript", () => {
	const script = consentBootstrapScript("G-TEST");

	it("sets the consent default before it configures analytics, which is the whole point of it", () => {
		expect(script.indexOf("gtag('consent', 'default'")).toBeLessThan(script.indexOf("gtag('config'"));
	});

	it("carries the cookie name and the category as the module declares them, not as fresh literals", () => {
		expect(script).toContain(JSON.stringify(CONSENT_COOKIE_NAME));
		expect(script).toContain(JSON.stringify(ANALYTICS_CATEGORY));
	});

	it("answers denied on the path where nothing is stored", () => {
		expect(script).toContain(`return ${JSON.stringify(CONSENT_STATUS.DENIED)}`);
	});

	it("configures the analytics id it was handed, so no template restates it", () => {
		expect(script).toContain(`gtag('config', "G-TEST")`);
	});
});
