import { describe, expect, it } from "vitest";
import { growingPrefixes, TERMS_PER_REQUEST } from "./emdash.ts";

describe("growingPrefixes", () => {
	it("hands EmDash each request a list that adds at most one batch, since it inserts the new terms in one D1 query", () => {
		const termIds = Array.from({ length: TERMS_PER_REQUEST * 2 + 1 }, (_, index) => `term-${index}`);

		expect(growingPrefixes(termIds).map((prefix) => prefix.length)).toEqual([
			TERMS_PER_REQUEST,
			TERMS_PER_REQUEST * 2,
			TERMS_PER_REQUEST * 2 + 1,
		]);
	});

	it("sends a short list whole, in one request", () => {
		expect(growingPrefixes(["a", "b"])).toEqual([["a", "b"]]);
	});
});
