import { useEffect } from "react";
import { toggleMenu } from "@components/organisms/header/utils/toggleMenu";
import { initializeParallax } from "@components/molecules/welcome/utils/initializeParallax";
import { backgroundObserver } from "@components/organisms/header/utils/backgroundObserver";
import { mailTo } from "@shared/utils/mailTo";

const ReactScriptProvider = () => {
	useEffect(() => {
		toggleMenu();
		initializeParallax();
		backgroundObserver();
		mailTo();
	}, []);

	return null;
};

export default ReactScriptProvider;
