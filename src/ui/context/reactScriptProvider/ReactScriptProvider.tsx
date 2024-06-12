import { useEffect } from "react";
import { toggleMenu } from "@components/organisms/header/utils/toggleMenu";
import { initializeParallax } from "@components/molecules/welcome/utils/initializeParallax";
import { backgroundObserver } from "@components/organisms/header/utils/backgroundObserver";
import { initializeThemeSetter } from "@components/atoms/themeToggle/utils/themeSetter";
import { mailTo } from "@shared/ui/utils/mailTo";

const ReactScriptProvider = () => {
	useEffect(() => {
		toggleMenu();
		initializeParallax();
		backgroundObserver();
		mailTo();
		initializeThemeSetter();
	}, []);

	return null;
};

export default ReactScriptProvider;
