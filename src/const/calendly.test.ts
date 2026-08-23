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
	});
});
