import { prefersReducedMotion, scrollBehavior } from "@modules/core/utils/motion";
import { beforeEach, describe, expect, it, vi } from "vitest";

const preference = (matches: boolean) =>
	vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia);

describe("prefersReducedMotion", () => {
	beforeEach(() => vi.unstubAllGlobals());

	it("reports the preference the reader set on their operating system", () => {
		preference(true);

		expect(prefersReducedMotion()).toBe(true);
	});

	it("reports no preference when the reader has asked for nothing", () => {
		preference(false);

		expect(prefersReducedMotion()).toBe(false);
	});
});

describe("scrollBehavior", () => {
	beforeEach(() => vi.unstubAllGlobals());

	it("jumps rather than glides for a reader who asked for less motion", () => {
		preference(true);

		expect(scrollBehavior()).toBe("auto");
	});

	it("glides otherwise, which is what the sliders were written for", () => {
		preference(false);

		expect(scrollBehavior()).toBe("smooth");
	});
});
