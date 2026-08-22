import { CALENDLY, CALENDLY_MEETING_URL, CALENDLY_WIDGET_SCRIPT } from "@const/calendly";
import { securityHeaders } from "@const/securityHeaders";
import { describe, expect, it } from "vitest";

const policy = securityHeaders()["Content-Security-Policy"] as string;
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
		expect(CALENDLY_MEETING_URL).toContain(CALENDLY.MEETING_OPTIONS);
	});
});
