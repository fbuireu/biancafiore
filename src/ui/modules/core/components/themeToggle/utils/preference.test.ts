import { runInNewContext } from "node:vm";
import { describe, expect, it, type Mock, vi } from "vitest";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, Theme } from "../const";
import { readTheme, THEME_BOOTSTRAP_SCRIPT, writeTheme } from "./preference";

const STORED_VALUES = [null, "dark", "light", "system", "sepia", ""];

const storeHolding = (stored: string | null): Pick<Storage, "getItem" | "setItem"> => ({
	getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null),
	setItem: vi.fn(),
});

interface BootedPage {
	documentElement: { setAttribute: Mock; style: { colorScheme?: string } };
	store: Pick<Storage, "getItem" | "setItem">;
}

const boot = (stored: string | null): BootedPage => {
	const store = storeHolding(stored);
	const documentElement = { setAttribute: vi.fn(), style: {} as { colorScheme?: string } };

	runInNewContext(THEME_BOOTSTRAP_SCRIPT, {
		localStorage: store,
		window: { matchMedia: () => ({ matches: true }) },
		document: { documentElement },
	});

	return { documentElement, store };
};

describe("readTheme", () => {
	it("answers light when the reader has chosen nothing, whatever the operating system prefers", () => {
		expect(readTheme(storeHolding(null))).toBe(Theme.LIGHT);
	});

	it("answers light for a stored value that is not a theme", () => {
		expect(readTheme(storeHolding("sepia"))).toBe(Theme.LIGHT);
		expect(readTheme(storeHolding("system"))).toBe(Theme.LIGHT);
	});

	it("answers the theme the reader chose", () => {
		expect(readTheme(storeHolding(Theme.DARK))).toBe(Theme.DARK);
		expect(readTheme(storeHolding(Theme.LIGHT))).toBe(Theme.LIGHT);
	});

	it("writes nothing while reading, so a visit cannot invent a choice", () => {
		const store = storeHolding(null);

		readTheme(store);

		expect(store.setItem).not.toHaveBeenCalled();
	});
});

describe("writeTheme", () => {
	it("stores the choice under the key the bootstrap reads", () => {
		const store = storeHolding(null);

		writeTheme({ store, theme: Theme.DARK });

		expect(store.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, Theme.DARK);
	});
});

describe("THEME_BOOTSTRAP_SCRIPT", () => {
	it("paints what the module would read, for every stored value, under an operating system that prefers dark", () => {
		for (const stored of STORED_VALUES) {
			const expected = readTheme(storeHolding(stored));
			const { documentElement } = boot(stored);

			expect(documentElement.setAttribute).toHaveBeenCalledWith(THEME_ATTRIBUTE, expected);
			expect(documentElement.style.colorScheme).toBe(expected);
		}
	});

	it("persists nothing, so the light default is not mistaken for a choice", () => {
		for (const stored of STORED_VALUES) {
			expect(boot(stored).store.setItem).not.toHaveBeenCalled();
		}
	});
});
