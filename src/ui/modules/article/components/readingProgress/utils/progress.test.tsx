import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ARTICLE_BODY_CLASS } from "../../../const";
import { READING_PROGRESS_CLASS } from "../const";
import { initReadingProgress } from "./progress";

const MARKUP = `<div class="${ARTICLE_BODY_CLASS}"></div><div class="${READING_PROGRESS_CLASS}"></div>`;

const bar = () => document.querySelector<HTMLElement>(`.${READING_PROGRESS_CLASS}`) as HTMLElement;

const article = (offsetHeight: number) => {
	const element = document.querySelector<HTMLElement>(`.${ARTICLE_BODY_CLASS}`) as HTMLElement;

	Object.defineProperty(element, "offsetHeight", { value: offsetHeight, configurable: true });
};

const scrollTo = (scrollY: number) => {
	vi.stubGlobal("scrollY", scrollY);
	window.dispatchEvent(new Event("scroll"));
};

beforeEach(() => {
	document.body.innerHTML = MARKUP;
	vi.stubGlobal("scrollY", 0);
});

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.innerHTML = "";
});

describe("initReadingProgress", () => {
	it("paints once on init, so a reader landing mid-article sees the right bar", () => {
		article(1000);
		vi.stubGlobal("scrollY", 250);

		initReadingProgress();

		expect(bar().style.width).toBe("25%");
	});

	it("follows the reader down the page", () => {
		article(1000);
		initReadingProgress();

		scrollTo(500);

		expect(bar().style.width).toBe("50%");
	});

	it("rounds up, so any progress at all shows as some progress", () => {
		article(1000);
		initReadingProgress();

		scrollTo(1);

		expect(bar().style.width).toBe("1%");
	});

	it("stops at full rather than running past it once the footer is in view", () => {
		article(1000);
		initReadingProgress();

		scrollTo(5000);

		expect(bar().style.width).toBe("100%");
	});

	it("leaves a page carrying no article alone rather than throwing", () => {
		document.body.innerHTML = '<div class="reading-progress"></div>';

		expect(() => initReadingProgress()).not.toThrow();
		expect(bar().style.width).toBe("");
	});

	it("leaves a page carrying no bar alone rather than throwing", () => {
		document.body.innerHTML = `<div class="${ARTICLE_BODY_CLASS}"></div>`;

		expect(() => initReadingProgress()).not.toThrow();
	});
});
