enum ThemeType {
	DARK = "dark",
	LIGHT = "light",
}

const THEME_STORAGE_KEY = "theme";

const getInitialTheme = (): ThemeType => {
	const cachedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
	const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
	return cachedTheme ?? (prefersDarkScheme ? ThemeType.DARK : ThemeType.LIGHT);
};

const applyTheme = (theme: ThemeType) => {
	document.documentElement.setAttribute(`data-${THEME_STORAGE_KEY}`, theme);
	localStorage.setItem(THEME_STORAGE_KEY, theme);
	const themeToggle = document.querySelector<HTMLInputElement>(".theme-toggle");

	if (!themeToggle) return;

	if (theme === ThemeType.DARK) {
		themeToggle.classList.add("dark", "--toggled");
		themeToggle.classList.remove("--untoggled");
	} else {
		themeToggle.classList.add("--untoggled");
		themeToggle.classList.remove("dark", "--toggled");
	}
};

const syncToggleSwitch = (toggleSwitch: HTMLInputElement, theme: ThemeType) => {
	toggleSwitch.checked = theme === ThemeType.DARK;
};

const handleThemeChange = (toggleSwitch: HTMLInputElement) => {
	const newTheme = toggleSwitch.checked ? ThemeType.DARK : ThemeType.LIGHT;
	applyTheme(newTheme);
};

export const initializeThemeSetter = () => {
	const toggleSwitch = document.querySelector<HTMLInputElement>('.theme-toggle input[type="checkbox"]');
	const initialTheme = getInitialTheme();

	applyTheme(initialTheme);

	if (!toggleSwitch) return;

	syncToggleSwitch(toggleSwitch, initialTheme);
	toggleSwitch.addEventListener("change", () => handleThemeChange(toggleSwitch));

	window.addEventListener("storage", (event) => {
		if (event.key === THEME_STORAGE_KEY && event.newValue) {
			const newTheme = event.newValue as ThemeType;
			applyTheme(newTheme);

			if (!toggleSwitch) return;

			syncToggleSwitch(toggleSwitch, newTheme);
		}
	});
};
