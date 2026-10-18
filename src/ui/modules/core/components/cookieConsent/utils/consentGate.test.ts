import { describe, expect, it } from "vitest";
import { ANALYTICS_CATEGORY, CONSENT_COOKIE_NAME, CONSENT_STATUS, consentBootstrapScript } from "./consentGate";

const stored = (value: unknown): string => `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}`;

const GOOGLE_TAG_IDS = { analyticsId: "G-TEST", tagManagerId: "GTM-TEST" };

interface AppendedScript {
	src: string;
}

interface BootedPage {
	commands: () => string[];
	scripts: string[];
	activate: () => void;
}

const bootPage = (prerendering: boolean): BootedPage => {
	const dataLayer: unknown[] = [];
	const scripts: string[] = [];
	const page = new EventTarget();
	const document = Object.assign(page, {
		cookie: "",
		prerendering,
		createElement: () => ({ async: false, src: "" }),
		head: { append: (script: AppendedScript) => scripts.push(script.src) },
	});

	new Function("document", "dataLayer", "window", consentBootstrapScript(GOOGLE_TAG_IDS))(document, dataLayer, {});

	return {
		commands: () => dataLayer.map((entry) => Array.from(entry as ArrayLike<string>)[0]),
		scripts,
		activate: () => page.dispatchEvent(new Event("prerenderingchange")),
	};
};

const runBootstrap = (cookie: string): { command: string; payload: Record<string, string> } => {
	const dataLayer: unknown[] = [];
	const document = { cookie, createElement: () => ({}), head: { append: () => {} } };

	new Function("document", "dataLayer", "window", consentBootstrapScript(GOOGLE_TAG_IDS))(document, dataLayer, {});

	const [command, , payload] = dataLayer[0] as unknown as [string, string, Record<string, string>];

	return { command, payload };
};

const analyticsStorage = (cookie: string): string => runBootstrap(cookie).payload.analytics_storage;

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
		expect(consentBootstrapScript(GOOGLE_TAG_IDS)).toContain(`gtag('config', "G-TEST")`);
	});

	it("loads Google's two scripts for the ids it was handed, after the consent default, on a page the reader opened", () => {
		const page = bootPage(false);

		expect(page.commands()).toEqual(["consent", "js", "config"]);
		expect(page.scripts).toEqual([
			"https://www.googletagmanager.com/gtag/js?id=G-TEST",
			"https://www.googletagmanager.com/gtm.js?id=GTM-TEST",
		]);
	});

	it("starts nothing on a prerendered page until the reader is shown it, so a page never opened counts no visit", () => {
		const page = bootPage(true);

		expect(page.commands()).toEqual(["consent"]);
		expect(page.scripts).toEqual([]);

		page.activate();

		expect(page.commands()).toEqual(["consent", "js", "config"]);
		expect(page.scripts).toHaveLength(2);
	});
});
