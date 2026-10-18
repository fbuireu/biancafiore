import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, THEME_TOGGLE_CLASS, THEME_TOGGLE_TOGGLED_CLASS, Theme } from "../const";
import { readTheme, writeTheme } from "./preference";

const SELECTORS = {
	THEME_INPUT: `.${THEME_TOGGLE_CLASS} input[type="checkbox"]`,
	TOGGLE: `.${THEME_TOGGLE_CLASS}`,
};

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
	TOGGLE.classList.toggle(THEME_TOGGLE_TOGGLED_CLASS, isDarkMode);
};

function applyOnOtherTabWrite({ key }: StorageEvent): void {
	if (key === THEME_STORAGE_KEY) applyTheme({ theme: readTheme(localStorage), document });
}

export function initializeThemeSetter(): void {
	window.addEventListener("storage", applyOnOtherTabWrite);

	applyTheme({ theme: readTheme(localStorage), document });

	const THEME_INPUT = document.querySelector<HTMLInputElement>(SELECTORS.THEME_INPUT);

	if (!THEME_INPUT) return;

	THEME_INPUT.addEventListener("change", () => {
		const theme = THEME_INPUT.checked ? Theme.DARK : Theme.LIGHT;

		writeTheme({ store: localStorage, theme });
		applyTheme({ theme, document });
	});
}
