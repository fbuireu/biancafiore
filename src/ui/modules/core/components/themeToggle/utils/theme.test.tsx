import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	THEME_ATTRIBUTE,
	THEME_STORAGE_KEY,
	THEME_TOGGLE_CLASS,
	THEME_TOGGLE_INPUT_CLASS,
	THEME_TOGGLE_TOGGLED_CLASS,
	Theme,
} from "../const";

const TOGGLE = `.${THEME_TOGGLE_CLASS}`;

const renderToggle = (): HTMLInputElement => {
	document.body.innerHTML = `<label class="${THEME_TOGGLE_CLASS}"><input type="checkbox" class="${THEME_TOGGLE_INPUT_CLASS}" /></label>`;

	const input = document.querySelector<HTMLInputElement>(`${TOGGLE} input[type="checkbox"]`);

	if (!input) throw new Error("the theme toggle did not render");

	return input;
};

const visit = async (): Promise<void> => {
	vi.resetModules();

	const { initializeThemeSetter } = await import("./theme");

	initializeThemeSetter();
};

interface ChooseParams {
	input: HTMLInputElement;
	theme: Theme;
}

const choose = ({ input, theme }: ChooseParams): void => {
	input.checked = theme === Theme.DARK;
	input.dispatchEvent(new Event("change"));
};

const memoryStorage = (): Pick<Storage, "getItem" | "setItem"> => {
	const values = new Map<string, string>();

	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
	};
};

const paintedTheme = (): string | null => document.documentElement.getAttribute(THEME_ATTRIBUTE);
const storedTheme = (): string | null => localStorage.getItem(THEME_STORAGE_KEY);
const toggledClass = (): boolean | undefined =>
	document.querySelector(TOGGLE)?.classList.contains(THEME_TOGGLE_TOGGLED_CLASS);

beforeEach(() => {
	vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn() }));
	vi.stubGlobal("localStorage", memoryStorage());
	vi.spyOn(window, "addEventListener");
	vi.spyOn(document, "addEventListener");
});

afterEach(() => {
	for (const [type, listener] of vi.mocked(window.addEventListener).mock.calls) {
		window.removeEventListener(type, listener);
	}
	for (const [type, listener] of vi.mocked(document.addEventListener).mock.calls) {
		document.removeEventListener(type, listener);
	}
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	document.documentElement.style.colorScheme = "";
	document.body.innerHTML = "";
});

describe("the theme runtime", () => {
	it("opens in the light theme without storing a choice, even under an operating system that prefers dark", async () => {
		renderToggle();

		await visit();

		expect(paintedTheme()).toBe(Theme.LIGHT);
		expect(document.documentElement.style.colorScheme).toBe(Theme.LIGHT);
		expect(storedTheme()).toBeNull();
		expect(toggledClass()).toBe(false);
	});

	it("persists the reader's choice and dresses the toggle for it", async () => {
		const input = renderToggle();
		await visit();

		choose({ input, theme: Theme.DARK });

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(storedTheme()).toBe(Theme.DARK);
		expect(input.checked).toBe(true);
		expect(toggledClass()).toBe(true);

		choose({ input, theme: Theme.LIGHT });

		expect(paintedTheme()).toBe(Theme.LIGHT);
		expect(storedTheme()).toBe(Theme.LIGHT);
		expect(input.checked).toBe(false);
		expect(toggledClass()).toBe(false);
	});

	it("keeps the chosen theme across a later visit", async () => {
		const input = renderToggle();
		await visit();

		choose({ input, theme: Theme.DARK });

		renderToggle();
		await visit();

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(toggledClass()).toBe(true);
	});

	it("repaints when another tab changes the theme", async () => {
		renderToggle();
		await visit();

		localStorage.setItem(THEME_STORAGE_KEY, Theme.DARK);
		window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: Theme.DARK }));

		expect(paintedTheme()).toBe(Theme.DARK);
	});

	it("ignores a storage write under another key", async () => {
		renderToggle();
		await visit();

		localStorage.setItem(THEME_STORAGE_KEY, Theme.DARK);
		window.dispatchEvent(new StorageEvent("storage", { key: "something-else", newValue: Theme.DARK }));

		expect(paintedTheme()).toBe(Theme.LIGHT);
	});
});

describe("the theme runtime on a page without the toggle", () => {
	it("still paints the document, since every page carries the colour scheme", async () => {
		localStorage.setItem(THEME_STORAGE_KEY, Theme.DARK);
		document.body.innerHTML = "";

		await visit();

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(document.documentElement.style.colorScheme).toBe(Theme.DARK);
	});

	it("paints the document but leaves a toggle with no input undressed, rather than throwing", async () => {
		localStorage.setItem(THEME_STORAGE_KEY, Theme.DARK);
		document.body.innerHTML = `<label class="${THEME_TOGGLE_CLASS}"></label>`;

		await visit();

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(toggledClass()).toBe(false);
	});
});
