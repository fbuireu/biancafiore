import { DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY, Theme } from "../const";

const THEMES = new Set<string>(Object.values(Theme));

const literal = (value: string): string => JSON.stringify(value);

const CHOSEN_THEMES = Object.values(Theme).map(literal).join(", ");

export const readTheme = (store: Pick<Storage, "getItem">): Theme => {
	const stored = store.getItem(THEME_STORAGE_KEY);

	return THEMES.has(stored ?? "") ? (stored as Theme) : DEFAULT_THEME;
};

interface WriteThemeParams {
	store: Pick<Storage, "setItem">;
	theme: Theme;
}

export const writeTheme = ({ store, theme }: WriteThemeParams): void => store.setItem(THEME_STORAGE_KEY, theme);

export const THEME_BOOTSTRAP_SCRIPT = `(() => {
	try {
		const stored = localStorage.getItem(${literal(THEME_STORAGE_KEY)});
		const theme = [${CHOSEN_THEMES}].includes(stored) ? stored : ${literal(DEFAULT_THEME)};
		const root = document.documentElement;
		root.setAttribute(${literal(THEME_ATTRIBUTE)}, theme);
		root.style.colorScheme = theme;
	} catch {}
})();`;
