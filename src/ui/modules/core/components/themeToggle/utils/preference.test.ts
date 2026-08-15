import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, Theme, ThemePreference } from "../const";
import { readPreference, resolveTheme, THEME_BOOTSTRAP_SCRIPT, writePreference } from "./preference";

const STORED_VALUES = [null, "dark", "light", "system", "sepia", ""];

const storeHolding = (stored: string | null) => ({
	getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null),
	setItem: vi.fn(),
});

const boot = ({ stored, prefersDark }: { stored: string | null; prefersDark: boolean }) => {
	const store = storeHolding(stored);
	const documentElement = { setAttribute: vi.fn(), style: {} as { colorScheme?: string } };

	runInNewContext(THEME_BOOTSTRAP_SCRIPT, {
		localStorage: store,
		window: { matchMedia: () => ({ matches: prefersDark }) },
		document: { documentElement },
	});

	return { documentElement, store };
};

describe("readPreference", () => {
	it("answers system when the reader has chosen nothing", () => {
		expect(readPreference(storeHolding(null))).toBe(ThemePreference.SYSTEM);
	});

	it("answers system for a stored value that is not a preference", () => {
		expect(readPreference(storeHolding("sepia"))).toBe(ThemePreference.SYSTEM);
	});

	it("answers the preference the reader chose", () => {
		expect(readPreference(storeHolding(Theme.DARK))).toBe(ThemePreference.DARK);
		expect(readPreference(storeHolding(Theme.LIGHT))).toBe(ThemePreference.LIGHT);
	});

	it("writes nothing while reading, so a visit cannot invent a preference", () => {
		const store = storeHolding(null);

		readPreference(store);

		expect(store.setItem).not.toHaveBeenCalled();
	});
});

describe("resolveTheme", () => {
	it("mirrors the operating system while the preference is system", () => {
		expect(resolveTheme({ preference: ThemePreference.SYSTEM, prefersDark: true })).toBe(Theme.DARK);
		expect(resolveTheme({ preference: ThemePreference.SYSTEM, prefersDark: false })).toBe(Theme.LIGHT);
	});

	it("keeps a chosen theme whatever the operating system says", () => {
		expect(resolveTheme({ preference: ThemePreference.LIGHT, prefersDark: true })).toBe(Theme.LIGHT);
		expect(resolveTheme({ preference: ThemePreference.DARK, prefersDark: false })).toBe(Theme.DARK);
	});
});

describe("writePreference", () => {
	it("stores the choice under the key the bootstrap reads", () => {
		const store = storeHolding(null);

		writePreference({ store, preference: ThemePreference.DARK });

		expect(store.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, ThemePreference.DARK);
	});
});

describe("THEME_BOOTSTRAP_SCRIPT", () => {
	it("paints what the module would resolve, for every stored value and both schemes", () => {
		for (const stored of STORED_VALUES) {
			for (const prefersDark of [true, false]) {
				const expected = resolveTheme({ preference: readPreference(storeHolding(stored)), prefersDark });
				const { documentElement } = boot({ stored, prefersDark });

				expect(documentElement.setAttribute).toHaveBeenCalledWith(THEME_ATTRIBUTE, expected);
				expect(documentElement.style.colorScheme).toBe(expected);
			}
		}
	});

	it("persists nothing, so the theme it mirrored is not mistaken for a choice", () => {
		for (const stored of STORED_VALUES) {
			for (const prefersDark of [true, false]) {
				expect(boot({ stored, prefersDark }).store.setItem).not.toHaveBeenCalled();
			}
		}
	});
});
