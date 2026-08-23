import { ARTICLE_COLUMNS_STORAGE_KEY } from "@modules/article/components/columnsToggle/const";
import {
	ARTICLE_COLUMNS_ACTIVE_CLASS,
	applyColumns,
	initializeColumnsToggle,
	isColumnsEnabled,
} from "@modules/article/components/columnsToggle/utils/layout";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const MARKUP = '<div class="article-wrapper"></div><button class="columns-toggle__button"></button>';

const memoryStorage = () => {
	const values = new Map<string, string>();

	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
		clear: () => values.clear(),
	};
};

const article = () => document.querySelector(".article-wrapper") as HTMLElement;
const toggle = () => document.querySelector(".columns-toggle__button") as HTMLButtonElement;
const isTwoColumn = () => article().classList.contains(ARTICLE_COLUMNS_ACTIVE_CLASS);

beforeEach(() => {
	vi.stubGlobal("localStorage", memoryStorage());
	document.body.innerHTML = MARKUP;
});

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.innerHTML = "";
});

describe("isColumnsEnabled", () => {
	it("reads one column for a reader who has never chosen", () => {
		expect(isColumnsEnabled()).toBe(false);
	});

	it("reads two only for the exact value the toggle writes", () => {
		localStorage.setItem(ARTICLE_COLUMNS_STORAGE_KEY, "true");
		expect(isColumnsEnabled()).toBe(true);

		localStorage.setItem(ARTICLE_COLUMNS_STORAGE_KEY, "TRUE");
		expect(isColumnsEnabled()).toBe(false);
	});
});

describe("applyColumns", () => {
	it("paints the article and tells assistive technology which way the toggle sits", () => {
		applyColumns({ enabled: true, document });

		expect(isTwoColumn()).toBe(true);
		expect(toggle().getAttribute("aria-pressed")).toBe("true");
	});

	it("leaves a document carrying neither element alone rather than throwing", () => {
		document.body.innerHTML = "";

		expect(() => applyColumns({ enabled: true, document })).not.toThrow();
	});
});

describe("initializeColumnsToggle", () => {
	it("restores the reader's stored choice before they touch anything", () => {
		localStorage.setItem(ARTICLE_COLUMNS_STORAGE_KEY, "true");

		initializeColumnsToggle();

		expect(isTwoColumn()).toBe(true);
	});

	it("writes the choice on a click, so it survives the next article", () => {
		initializeColumnsToggle();
		toggle().click();

		expect(localStorage.getItem(ARTICLE_COLUMNS_STORAGE_KEY)).toBe("true");
		expect(isTwoColumn()).toBe(true);
	});

	it("turns the choice back off on a second click", () => {
		initializeColumnsToggle();
		toggle().click();
		toggle().click();

		expect(localStorage.getItem(ARTICLE_COLUMNS_STORAGE_KEY)).toBe("false");
		expect(isTwoColumn()).toBe(false);
	});

	it("follows a choice another tab made, which is the only reason it listens to storage", () => {
		initializeColumnsToggle();

		globalThis.dispatchEvent(new StorageEvent("storage", { key: ARTICLE_COLUMNS_STORAGE_KEY, newValue: "true" }));

		expect(isTwoColumn()).toBe(true);
	});

	it("ignores another tab writing some unrelated key", () => {
		initializeColumnsToggle();

		globalThis.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "true" }));

		expect(isTwoColumn()).toBe(false);
	});

	it("paints the incoming page before the router swaps it in, so the choice never flashes off", () => {
		localStorage.setItem(ARTICLE_COLUMNS_STORAGE_KEY, "true");
		initializeColumnsToggle();

		const newDocument = document.implementation.createHTMLDocument();
		newDocument.body.innerHTML = MARKUP;

		const event = new Event("astro:before-swap");
		Object.defineProperty(event, "newDocument", { value: newDocument });
		document.dispatchEvent(event);

		expect(newDocument.querySelector(".article-wrapper")?.classList.contains(ARTICLE_COLUMNS_ACTIVE_CLASS)).toBe(true);
	});

	it("leaves a page with no toggle alone rather than throwing", () => {
		document.body.innerHTML = '<div class="article-wrapper"></div>';

		expect(() => initializeColumnsToggle()).not.toThrow();
	});
});
