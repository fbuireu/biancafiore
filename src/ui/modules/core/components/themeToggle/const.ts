export const THEME_STORAGE_KEY = "theme" as const;
export const THEME_ATTRIBUTE = `data-${THEME_STORAGE_KEY}` as const;
export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)" as const;
export const THEME_TOGGLE_CLASS = "theme-toggle" as const;
export const THEME_TOGGLE_INPUT_CLASS = `${THEME_TOGGLE_CLASS}__input` as const;
export const THEME_TOGGLE_TOGGLED_CLASS = `${THEME_TOGGLE_CLASS}--toggled` as const;

export const Theme = {
	DARK: "dark",
	LIGHT: "light",
} as const;

export type Theme = (typeof Theme)[keyof typeof Theme];

export const ThemePreference = {
	...Theme,
	SYSTEM: "system",
} as const;

export type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference];
