enum ThemeType {
  DARK = "dark",
  LIGHT = "light",
}

export const initializeThemeSetter = () => {
  document.addEventListener('DOMContentLoaded', () => {
      const toggleSwitch = document.querySelector<HTMLInputElement>('.theme-switch input[type="checkbox"]');
      const currentTheme = localStorage.getItem('theme') ;
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const setTheme = (theme: ThemeType) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (!toggleSwitch) return

        toggleSwitch.checked = theme === ThemeType.DARK;
      };

      if (!toggleSwitch) return

      const initialTheme = currentTheme as ThemeType || (prefersDarkScheme ? ThemeType.DARK : ThemeType.LIGHT);
      setTheme(initialTheme);

      toggleSwitch.addEventListener('change', () => {
        const newTheme = toggleSwitch.checked ? ThemeType.DARK : ThemeType.LIGHT;
        setTheme(newTheme);
      });
    });
}