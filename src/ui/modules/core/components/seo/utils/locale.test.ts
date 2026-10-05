import { describe, expect, it } from "vitest";
import { openGraphLocale } from "./locale";

describe("openGraphLocale", () => {
	it("writes the language tag the way Open Graph spells a locale, with an underscore", () => {
		expect(openGraphLocale("en-GB")).toBe("en_GB");
		expect(openGraphLocale("pt-BR")).toBe("pt_BR");
	});

	it("leaves a tag with no region as it is", () => {
		expect(openGraphLocale("en")).toBe("en");
	});
});
