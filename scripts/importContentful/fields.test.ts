import { describe, expect, it } from "vitest";
import { socialNetworkName } from "./fields.ts";

describe("socialNetworkName", () => {
	it("names a network after its host, so the imported row starts with a name the editor can correct", () => {
		expect(socialNetworkName("https://www.linkedin.com/in/bianca")).toBe("Linkedin");
		expect(socialNetworkName("https://x.com/bianca")).toBe("X");
		expect(socialNetworkName("https://instagram.com/bianca")).toBe("Instagram");
	});
});
