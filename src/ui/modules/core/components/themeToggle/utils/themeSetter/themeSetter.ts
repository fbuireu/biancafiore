import { THEME_STORAGE_KEY } from "@const/index";

export enum ThemeType {
	DARK = "dark",
	LIGHT = "light",
}

const SELECTORS = {
	THEME_INPUT: '.theme-toggle input[type="checkbox"]',
	TOGGLE: ".theme-toggle",
};

const PREFERS_DARK_SCHEME = window.matchMedia("(prefers-color-scheme: dark)");

export const getCurrentTheme = () => localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;

function getInitialTheme() {
	const cachedTheme = getCurrentTheme();
	const prefersDarkScheme = PREFERS_DARK_SCHEME.matches;

	return cachedTheme ?? (prefersDarkScheme ? ThemeType.DARK : ThemeType.LIGHT);
}

export function initializeThemeSetter() {
	const { THEME_INPUT: THEME_INPUT_SELECTOR, TOGGLE: TOGGLE_SELECTOR } = SELECTORS;
	const THEME_INPUT = document.querySelector<HTMLInputElement>(THEME_INPUT_SELECTOR);
	const TOGGLE = document.querySelector<HTMLInputElement>(TOGGLE_SELECTOR);

	const initialTheme = getInitialTheme();

	const handleThemeChange = (toggleSwitch: HTMLInputElement) => {
		const newTheme = toggleSwitch.checked ? ThemeType.DARK : ThemeType.LIGHT;
		applyTheme({ theme: newTheme, document });
	};

	const applyTheme = ({ theme, document }: { theme: ThemeType; document: Document }) => {
		document.documentElement.setAttribute(`data-${THEME_STORAGE_KEY}`, theme);
		localStorage.setItem(THEME_STORAGE_KEY, theme);

		if (!TOGGLE || !THEME_INPUT) return;

		const isDarkMode = theme === ThemeType.DARK;

		THEME_INPUT.checked = isDarkMode;
		TOGGLE.classList.toggle("dark", isDarkMode);
		TOGGLE.classList.toggle("--is-toggled", isDarkMode);
		TOGGLE.classList.toggle("--is-untoggled", !isDarkMode);
	};

	applyTheme({ theme: initialTheme, document });

	if (!THEME_INPUT) return;

	THEME_INPUT.addEventListener("change", () => handleThemeChange(THEME_INPUT));

	window.addEventListener("storage", ({ key, newValue }) => {
		if (key === THEME_STORAGE_KEY && newValue) {
			const newTheme = newValue as ThemeType;
			const currentTheme = getCurrentTheme();
			if (newTheme !== currentTheme) applyTheme({ theme: newTheme, document });
		}
	});

	PREFERS_DARK_SCHEME.addEventListener("change", ({ matches }) => {
		const newTheme = matches ? ThemeType.DARK : ThemeType.LIGHT;
		const currentTheme = getCurrentTheme();

		if (newTheme !== currentTheme) applyTheme({ theme: newTheme, document });
	});
	document.addEventListener("astro:before-swap", ({ newDocument }) => {
		const initialTheme = getInitialTheme();
		const currentTheme = getCurrentTheme();
		const theme = currentTheme ?? initialTheme;

		applyTheme({ theme, document: newDocument });
	});
}
