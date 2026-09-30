import { motionTimeScale, prefersReducedMotion, scrollBehavior, successDelay } from "@modules/core/utils/motion";
import { afterEach, describe, expect, it, vi } from "vitest";

const preference = (matches: boolean) => {
	const matchMedia = vi.fn().mockReturnValue({ matches });

	vi.stubGlobal("matchMedia", matchMedia as unknown as typeof window.matchMedia);

	return matchMedia;
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("prefersReducedMotion", () => {
	it("reports the preference the reader set on their operating system", () => {
		const matchMedia = preference(true);

		expect(prefersReducedMotion()).toBe(true);
		expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
	});

	it("reports no preference when the reader has asked for nothing", () => {
		preference(false);

		expect(prefersReducedMotion()).toBe(false);
	});
});

describe("scrollBehavior", () => {
	it("jumps rather than glides for a reader who asked for less motion", () => {
		preference(true);

		expect(scrollBehavior()).toBe("auto");
	});

	it("glides otherwise, which is what the sliders were written for", () => {
		preference(false);

		expect(scrollBehavior()).toBe("smooth");
	});
});

describe("motionTimeScale", () => {
	it("collapses a timeline for a reader who asked for less motion", () => {
		preference(true);

		expect(motionTimeScale()).toBeGreaterThan(1);
	});

	it("leaves it at real time otherwise", () => {
		preference(false);

		expect(motionTimeScale()).toBe(1);
	});
});

describe("successDelay", () => {
	it("waits for no animation that was collapsed to nothing", () => {
		preference(true);

		expect(successDelay(2000)).toBe(0);
	});

	it("waits for the animation the reader is actually watching", () => {
		preference(false);

		expect(successDelay(2000)).toBe(2000);
	});
});

describe("prefersReducedMotion without a window", () => {
	it("answers no rather than throwing, because the contact form renders on the server", () => {
		vi.stubGlobal("window", undefined);

		expect(prefersReducedMotion()).toBe(false);
	});
});
