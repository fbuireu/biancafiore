import { run } from 'vanilla-cookieconsent';
import { cookieConsentConfig } from '../../cookieConsent.config';
import { getInitialTheme, ThemeType } from '@components/atoms/themeToggle/utils/themeSetter';

export const initCookieConsent = async () => {
  const theme = getInitialTheme()
  document.body.classList.toggle('cc--elegant-black', theme === ThemeType.DARK);

  await run(cookieConsentConfig);
}