import { DARK_SCHEME_QUERY, THEME_ATTRIBUTE, THEME_STORAGE_KEY, Theme, ThemePreference } from "../const";

const PREFERENCES = new Set<string>(Object.values(ThemePreference));

const literal = (value: string) => JSON.stringify(value);

const CHOSEN_THEMES = Object.values(Theme).map(literal).join(", ");
const MIRRORED_THEME = `prefersDark ? ${literal(Theme.DARK)} : ${literal(Theme.LIGHT)}`;

export const readPreference = (store: Pick<Storage, "getItem">): ThemePreference => {
	const stored = store.getItem(THEME_STORAGE_KEY);

	return PREFERENCES.has(stored ?? "") ? (stored as ThemePreference) : ThemePreference.SYSTEM;
};

export const writePreference = ({
	store,
	preference,
}: {
	store: Pick<Storage, "setItem">;
	preference: ThemePreference;
}): void => store.setItem(THEME_STORAGE_KEY, preference);

export const resolveTheme = ({
	preference,
	prefersDark,
}: {
	preference: ThemePreference;
	prefersDark: boolean;
}): Theme => (preference === ThemePreference.SYSTEM ? (prefersDark ? Theme.DARK : Theme.LIGHT) : preference);

export const THEME_BOOTSTRAP_SCRIPT = `(() => {
	try {
		const stored = localStorage.getItem(${literal(THEME_STORAGE_KEY)});
		const prefersDark = window.matchMedia(${literal(DARK_SCHEME_QUERY)}).matches;
		const theme = [${CHOSEN_THEMES}].includes(stored) ? stored : ${MIRRORED_THEME};
		const root = document.documentElement;
		root.setAttribute(${literal(THEME_ATTRIBUTE)}, theme);
		root.style.colorScheme = theme;
	} catch {}
})();`;
