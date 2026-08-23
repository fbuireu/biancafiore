import {
	ANALYTICS_CATEGORY,
	CONSENT_COOKIE_NAME,
	CONSENT_STATUS,
	consentBootstrapScript,
} from "@modules/core/components/cookieConsent/utils/consentGate";
import { describe, expect, it } from "vitest";

const stored = (value: unknown) => `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}`;

const runBootstrap = (cookie: string): { command: string; payload: Record<string, string> } => {
	const dataLayer: unknown[] = [];
	const scope = { document: { cookie }, dataLayer, window: {} as Record<string, unknown> };

	new Function("document", "dataLayer", "window", consentBootstrapScript("G-TEST"))(
		scope.document,
		dataLayer,
		scope.window,
	);

	const [command, , payload] = dataLayer[0] as unknown as [string, string, Record<string, string>];

	return { command, payload };
};

const analyticsStorage = (cookie: string) => runBootstrap(cookie).payload.analytics_storage;

describe("the script that actually ships", () => {
	it("grants only when the visitor accepted the analytics category by name", () => {
		expect(analyticsStorage(stored({ categories: [ANALYTICS_CATEGORY] }))).toBe(CONSENT_STATUS.GRANTED);
	});

	it("denies when the visitor accepted some other category, however many", () => {
		expect(analyticsStorage(stored({ categories: ["necessary", "functional"] }))).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when the visitor accepted nothing at all", () => {
		expect(analyticsStorage(stored({ categories: [] }))).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies on a first visit, when no consent cookie has been written yet", () => {
		expect(analyticsStorage("")).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when the cookie exists but holds nothing readable", () => {
		expect(analyticsStorage(`${CONSENT_COOKIE_NAME}=not-json`)).toBe(CONSENT_STATUS.DENIED);
	});

	it("denies when the cookie carries no categories array at all", () => {
		expect(analyticsStorage(stored({}))).toBe(CONSENT_STATUS.DENIED);
	});

	it("reads its own cookie rather than one whose name merely ends the same way", () => {
		expect(analyticsStorage(`other_${CONSENT_COOKIE_NAME}=${encodeURIComponent('{"categories":["analytics"]}')}`)).toBe(
			CONSENT_STATUS.DENIED,
		);
	});

	it("finds its cookie among others, whatever position it sits in", () => {
		expect(analyticsStorage(`theme=dark; ${stored({ categories: [ANALYTICS_CATEGORY] })}; other=1`)).toBe(
			CONSENT_STATUS.GRANTED,
		);
	});

	it("sets the consent default first, before anything that could read it", () => {
		expect(runBootstrap("").command).toBe("consent");
	});

	it("configures the analytics id it was handed, so no template restates it", () => {
		expect(consentBootstrapScript("G-TEST")).toContain(`gtag('config', "G-TEST")`);
	});
});
