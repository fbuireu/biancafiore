import { afterEach, describe, expect, it, vi } from "vitest";
import { onceActivated } from "./prerender";

const prerender = (): void => {
	Object.defineProperty(document, "prerendering", { configurable: true, value: true });
};

afterEach(() => {
	Reflect.deleteProperty(document, "prerendering");
});

describe("onceActivated", () => {
	it("starts at once on a page the reader opened", () => {
		const start = vi.fn();

		onceActivated(start);

		expect(start).toHaveBeenCalledOnce();
	});

	it("waits on a prerendered page until the reader is shown it, and then starts once", () => {
		const start = vi.fn();
		prerender();

		onceActivated(start);

		expect(start).not.toHaveBeenCalled();

		document.dispatchEvent(new Event("prerenderingchange"));
		document.dispatchEvent(new Event("prerenderingchange"));

		expect(start).toHaveBeenCalledOnce();
	});
});
