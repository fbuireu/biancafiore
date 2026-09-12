import { LOG_LEVEL, LOG_SERVICE, stripQuery } from "@infrastructure/logging/contract";
import { describe, expect, it } from "vitest";

describe("the log contract", () => {
	it("names this site the way its export destinations name it", () => {
		expect(LOG_SERVICE).toBe("biancafiore-web");
	});

	it("spells each level as the console method that carries it", () => {
		expect(Object.values(LOG_LEVEL)).toEqual(["info", "warn", "error"]);
	});
});

describe("stripQuery", () => {
	it("keeps the origin and the path and drops everything after them", () => {
		expect(stripQuery("https://biancafiore.me/contact?token=secret#anchor")).toBe("https://biancafiore.me/contact");
	});

	it("answers undefined for an absent url, so the field simply disappears", () => {
		expect(stripQuery(undefined)).toBeUndefined();
		expect(stripQuery("")).toBeUndefined();
	});

	it("answers undefined for something that is not a url rather than passing it through", () => {
		expect(stripQuery("/contact?token=secret")).toBeUndefined();
	});
});
