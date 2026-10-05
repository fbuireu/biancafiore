import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CALENDLY, CALENDLY_MEETING_URL, CALENDLY_WIDGET_SCRIPT } from "./calendly";
import { securityHeaders } from "./securityHeaders";

const TABS_STYLESHEET = new URL("../ui/modules/contact/components/tabs/tabs.css", import.meta.url);
const TABS_TEMPLATE = new URL("../ui/modules/contact/components/tabs/Tabs.astro", import.meta.url);
const WIDGET_ELEMENT = /<div\s[^>]*?class=\{CALENDLY\.WIDGET_CLASS\}[^>]*>/;
const WIDGET_STARTING_HEIGHT = /\.calendly-inline-widget \{\s*height: 700px;/;
const FRAME_RULE = /\.calendly-inline-widget \{[^}]*?& iframe \{([^}]*)\}/;

const policy = securityHeaders({ isDevelopment: false, inlineScriptHashes: [] })["Content-Security-Policy"] as string;
const directive = (name: string) => policy.split("; ").find((entry) => entry.startsWith(`${name} `)) ?? "";

describe("the Calendly integration", () => {
	it("loads its widget from the origin the policy allows a script from", () => {
		expect(CALENDLY_WIDGET_SCRIPT.startsWith(CALENDLY.ASSETS_ORIGIN)).toBe(true);
		expect(directive("script-src")).toContain(CALENDLY.ASSETS_ORIGIN);
	});

	it("frames its booking page from the origin the policy allows a frame from", () => {
		expect(CALENDLY_MEETING_URL.startsWith(CALENDLY.BOOKING_ORIGIN)).toBe(true);
		expect(directive("frame-src")).toContain(CALENDLY.BOOKING_ORIGIN);
	});

	it("is allowed the stylesheet its widget brings with it", () => {
		expect(directive("style-src")).toContain(CALENDLY.ASSETS_ORIGIN);
	});

	it("asks for a meeting with the event details and the vendor banner hidden", () => {
		expect(CALENDLY_MEETING_URL).toContain("hide_event_type_details=1");
		expect(CALENDLY_MEETING_URL).toContain("hide_gdpr_banner=1");
	});

	it("addresses a real meeting rather than the booking origin's front page", () => {
		expect(CALENDLY_MEETING_URL).toContain("/fbuireu/45min-meeting?");
	});

	it("loads the vendor's own widget entry point", () => {
		expect(CALENDLY_WIDGET_SCRIPT).toBe("https://assets.calendly.com/assets/external/widget.js");
	});

	it("names the class the vendor mounts on, which the stylesheet also spells", () => {
		expect(CALENDLY.WIDGET_CLASS).toBe("calendly-inline-widget");
		expect(readFileSync(TABS_STYLESHEET, "utf8")).toContain(`.${CALENDLY.WIDGET_CLASS} {`);
	});

	it("asks the widget to follow the height of the booking page, starting from the height the stylesheet gives it", () => {
		const widget = readFileSync(TABS_TEMPLATE, "utf8").match(WIDGET_ELEMENT)?.[0] ?? "";

		expect(widget).toContain('data-resize="true"');
		expect(readFileSync(TABS_STYLESHEET, "utf8")).toMatch(WIDGET_STARTING_HEIGHT);
	});

	it("lets the frame follow its page once that page opts in, from a floor of the container's own height", () => {
		const rule = readFileSync(TABS_STYLESHEET, "utf8").match(FRAME_RULE)?.[1] ?? "";

		expect(rule).toContain("frame-sizing: content-height;");
		expect(rule).toContain("height: auto;");
		expect(rule).toContain("min-height: 100%;");
	});
});
