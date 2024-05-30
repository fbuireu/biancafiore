import { THEME_STORAGE_KEY } from "src/consts.ts";

export enum ThemeType {
	DARK = "dark",
	LIGHT = "light",
}

const PREFERS_DARK_SCHEME = window.matchMedia("(prefers-color-scheme: dark)");
const THEME_TOGGLE_INPUT = document.querySelector<HTMLInputElement>('.theme-toggle input[type="checkbox"]');
const THEME_TOGGLE = document.querySelector<HTMLInputElement>(".theme-toggle");

const getInitialTheme = (): ThemeType => {
	const cachedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
	const prefersDarkScheme = PREFERS_DARK_SCHEME.matches;

	return cachedTheme ?? (prefersDarkScheme ? ThemeType.DARK : ThemeType.LIGHT);
};

const applyTheme = (theme: ThemeType) => {
	document.documentElement.setAttribute(`data-${THEME_STORAGE_KEY}`, theme);
	localStorage.setItem(THEME_STORAGE_KEY, theme);

	if (!THEME_TOGGLE || !THEME_TOGGLE_INPUT) return;

	THEME_TOGGLE_INPUT.checked = theme === ThemeType.DARK;
	THEME_TOGGLE.classList.toggle("dark", theme === ThemeType.DARK);
	THEME_TOGGLE.classList.toggle("--toggled", theme === ThemeType.DARK);
	THEME_TOGGLE.classList.toggle("--untoggled", theme !== ThemeType.DARK);
};

const handleThemeChange = (toggleSwitch: HTMLInputElement) => {
	const newTheme = toggleSwitch.checked ? ThemeType.DARK : ThemeType.LIGHT;
	applyTheme(newTheme);
};

export const initializeThemeSetter = () => {
	const initialTheme = getInitialTheme();

	applyTheme(initialTheme);

	if (!THEME_TOGGLE_INPUT) return;

	THEME_TOGGLE_INPUT.addEventListener("change", () => handleThemeChange(THEME_TOGGLE_INPUT));

	window.addEventListener("storage", (event) => {
		if (event.key === THEME_STORAGE_KEY && event.newValue) {
			const newTheme = event.newValue as ThemeType;
			if (newTheme !== initialTheme) applyTheme(newTheme);
		}
	});

	PREFERS_DARK_SCHEME.addEventListener("change", (event) => {
		const newTheme = event.matches ? ThemeType.DARK : ThemeType.LIGHT;
		applyTheme(newTheme);
	});
};
