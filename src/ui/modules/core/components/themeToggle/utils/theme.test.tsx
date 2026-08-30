import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, Theme, ThemePreference } from "../const";

type SchemeListener = (event: { matches: boolean }) => void;

const TOGGLE = ".theme-toggle";
const TOGGLED_MODIFIER = "theme-toggle--toggled";

const operatingSystem = (prefersDark: boolean) => {
	const listeners: SchemeListener[] = [];
	const query = {
		matches: prefersDark,
		addEventListener: (_type: string, listener: SchemeListener) => {
			listeners.push(listener);
		},
	};

	vi.stubGlobal("matchMedia", () => query);

	return {
		flipTo: (matches: boolean) => {
			query.matches = matches;

			for (const listener of listeners) listener({ matches });
		},
	};
};

const renderToggle = (): HTMLInputElement => {
	document.body.innerHTML = `<label class="theme-toggle"><input type="checkbox" class="theme-toggle__input" /></label>`;

	const input = document.querySelector<HTMLInputElement>('.theme-toggle input[type="checkbox"]');

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

const memoryStorage = () => {
	const values = new Map<string, string>();

	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
	};
};

const paintedTheme = () => document.documentElement.getAttribute(THEME_ATTRIBUTE);
const storedPreference = () => localStorage.getItem(THEME_STORAGE_KEY);
const toggledClass = () => document.querySelector(TOGGLE)?.classList.contains(TOGGLED_MODIFIER);

beforeEach(() => {
	vi.stubGlobal("localStorage", memoryStorage());
	document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	document.body.innerHTML = "";
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("the theme runtime", () => {
	it("mirrors the operating system without storing a preference the reader never chose", async () => {
		operatingSystem(false);
		renderToggle();

		await visit();

		expect(paintedTheme()).toBe(Theme.LIGHT);
		expect(storedPreference()).toBeNull();
	});

	it("still follows the operating system on a later visit, after it changed between them", async () => {
		operatingSystem(false);
		renderToggle();
		await visit();

		operatingSystem(true);
		renderToggle();
		await visit();

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(storedPreference()).toBeNull();
	});

	it("follows an operating-system change while no preference is stored", async () => {
		const os = operatingSystem(false);
		renderToggle();
		await visit();

		os.flipTo(true);

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(storedPreference()).toBeNull();
	});

	it("persists the reader's choice and dresses the toggle for it", async () => {
		operatingSystem(true);
		const input = renderToggle();
		await visit();

		expect(toggledClass()).toBe(true);

		choose({ input: input, theme: Theme.LIGHT });

		expect(paintedTheme()).toBe(Theme.LIGHT);
		expect(storedPreference()).toBe(ThemePreference.LIGHT);
		expect(input.checked).toBe(false);
		expect(toggledClass()).toBe(false);
	});

	it("leaves an explicit choice alone when the operating system changes under it", async () => {
		const os = operatingSystem(true);
		const input = renderToggle();
		await visit();

		choose({ input: input, theme: Theme.LIGHT });

		os.flipTo(false);
		os.flipTo(true);

		expect(paintedTheme()).toBe(Theme.LIGHT);
		expect(storedPreference()).toBe(ThemePreference.LIGHT);
		expect(input.checked).toBe(false);
	});

	it("keeps the chosen preference across a later visit", async () => {
		operatingSystem(true);
		const input = renderToggle();
		await visit();

		choose({ input: input, theme: Theme.LIGHT });

		operatingSystem(true);
		renderToggle();
		await visit();

		expect(paintedTheme()).toBe(Theme.LIGHT);
	});

	it("repaints when another tab changes the preference", async () => {
		operatingSystem(false);
		renderToggle();
		await visit();

		localStorage.setItem(THEME_STORAGE_KEY, ThemePreference.DARK);
		window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: ThemePreference.DARK }));

		expect(paintedTheme()).toBe(Theme.DARK);
	});
});

describe("the theme runtime on a page without the toggle", () => {
	it("still paints the document, since every page carries the colour scheme", async () => {
		operatingSystem(true);
		document.body.innerHTML = "";

		await visit();

		expect(paintedTheme()).toBe(Theme.DARK);
		expect(document.documentElement.style.colorScheme).toBe(Theme.DARK);
	});

	it("wires no change listener there is no control to fire it", async () => {
		operatingSystem(false);
		document.body.innerHTML = `<label class="theme-toggle"></label>`;

		await visit();

		expect(storedPreference()).toBeNull();
		expect(toggledClass()).toBe(false);
	});
});

describe("a view transition", () => {
	it("paints the document being swapped in, which the toggle's own listeners cannot reach", async () => {
		operatingSystem(false);
		const input = renderToggle();
		await visit();
		choose({ input, theme: Theme.DARK });

		const newDocument = document.implementation.createHTMLDocument();
		document.dispatchEvent(Object.assign(new Event("astro:before-swap"), { newDocument }) as unknown as Event);

		expect(newDocument.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(Theme.DARK);
		expect(newDocument.documentElement.style.colorScheme).toBe(Theme.DARK);
	});
});
