import { useEffect } from "react";
import { toggleMenu } from "@components/organisms/header/utils/toggleMenu";
import { initializeParallax } from "@components/molecules/welcome/utils/initializeParallax";
import { backgroundObserver } from "@components/organisms/header/utils/backgroundObserver";
import { initializeThemeSetter } from "@components/atoms/themeToggle/utils/themeSetter";
import { initCookieConsent } from "@components/molecules/cookieConsent/utils/initCookieConsent";
import { mailTo } from "@shared/utils/mailTo";

const ReactScriptProvider = () => {
	useEffect(() => {
		toggleMenu();
		initializeParallax();
		backgroundObserver();
		mailTo();
		initializeThemeSetter();
		initCookieConsent();
	}, []);

	return null;
};

export default ReactScriptProvider;
