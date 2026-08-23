import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import { DARK_SCHEME_QUERY, THEME_ATTRIBUTE, THEME_STORAGE_KEY, Theme, ThemePreference } from "../const";
import { readPreference, resolveTheme, writePreference } from "./preference";

const SELECTORS = {
	THEME_INPUT: '.theme-toggle input[type="checkbox"]',
	TOGGLE: ".theme-toggle",
};
const TOGGLED_MODIFIER = "theme-toggle--toggled";

let darkScheme: MediaQueryList | undefined;

const prefersDarkScheme = (): MediaQueryList => {
	darkScheme ??= window.matchMedia(DARK_SCHEME_QUERY);

	return darkScheme;
};

const effectiveTheme = (): Theme =>
	resolveTheme({ preference: readPreference(localStorage), prefersDark: prefersDarkScheme().matches });

interface ApplyThemeParams {
	theme: Theme;
	document: Document;
}

const applyTheme = ({ theme, document }: ApplyThemeParams): void => {
	document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
	document.documentElement.style.colorScheme = theme;

	const TOGGLE = document.querySelector<HTMLElement>(SELECTORS.TOGGLE);
	const THEME_INPUT = document.querySelector<HTMLInputElement>(SELECTORS.THEME_INPUT);

	if (!TOGGLE || !THEME_INPUT) return;

	const isDarkMode = theme === Theme.DARK;

	THEME_INPUT.checked = isDarkMode;
	TOGGLE.classList.toggle(TOGGLED_MODIFIER, isDarkMode);
};

function applyOnOtherTabWrite({ key }: StorageEvent): void {
	if (key === THEME_STORAGE_KEY) applyTheme({ theme: effectiveTheme(), document });
}

function applyOnSchemeChange({ matches }: MediaQueryListEvent): void {
	const preference = readPreference(localStorage);

	if (preference !== ThemePreference.SYSTEM) return;

	applyTheme({ theme: resolveTheme({ preference, prefersDark: matches }), document });
}

function applyBeforeSwap({ newDocument }: TransitionBeforeSwapEvent): void {
	applyTheme({ theme: effectiveTheme(), document: newDocument });
}

export function initializeThemeSetter(): void {
	window.addEventListener("storage", applyOnOtherTabWrite);
	prefersDarkScheme().addEventListener("change", applyOnSchemeChange);
	document.addEventListener("astro:before-swap", applyBeforeSwap);

	applyTheme({ theme: effectiveTheme(), document });

	const THEME_INPUT = document.querySelector<HTMLInputElement>(SELECTORS.THEME_INPUT);

	if (!THEME_INPUT) return;

	THEME_INPUT.addEventListener("change", () => {
		const preference = THEME_INPUT.checked ? ThemePreference.DARK : ThemePreference.LIGHT;

		writePreference({ store: localStorage, preference });
		applyTheme({ theme: preference, document });
	});
}
