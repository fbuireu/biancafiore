import { describe, expect, it } from "vitest";
import { PREFETCH_IN_VIEWPORT } from "./prefetch";

describe("PREFETCH_IN_VIEWPORT", () => {
	it("asks Astro to prefetch a link as it enters the viewport, which a tap, a quick click or the keyboard reaches and a hover does not", () => {
		expect(PREFETCH_IN_VIEWPORT).toEqual({ "data-astro-prefetch": "viewport" });
	});
});
