import { describe, expect, it } from "vitest";
import { socialNetworkUrls } from "./socialNetworks";

describe("socialNetworkUrls", () => {
	it("reads the url off each 'Name | URL' line, skipping blank lines", () => {
		expect(socialNetworkUrls("LinkedIn | https://linkedin.com/in/bianca\n\n X |https://x.com/bianca \n")).toEqual([
			"https://linkedin.com/in/bianca",
			"https://x.com/bianca",
		]);
	});

	it("takes a line holding only a url as that url", () => {
		expect(socialNetworkUrls("https://instagram.com/bianca")).toEqual(["https://instagram.com/bianca"]);
	});

	it("drops a line whose url is not http or https, so no script or mail link reaches sameAs", () => {
		expect(
			socialNetworkUrls(
				"Evil | javascript:alert(1)\nMail | mailto:bianca@example.com\nData | data:text/html,hi\nLinkedIn | https://linkedin.com/in/bianca",
			),
		).toEqual(["https://linkedin.com/in/bianca"]);
	});

	it("drops a line that holds no url at all", () => {
		expect(socialNetworkUrls("LinkedIn\nLinkedIn | linkedin.com/in/bianca")).toEqual([]);
	});

	it("answers none for a field that holds no text", () => {
		expect(socialNetworkUrls(undefined)).toEqual([]);
		expect(socialNetworkUrls(42)).toEqual([]);
	});
});
