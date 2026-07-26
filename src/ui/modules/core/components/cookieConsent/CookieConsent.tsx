import { config } from "@modules/core/components/cookieConsent/config";
import { useEffect } from "react";
import { reset, run, showPreferences } from "vanilla-cookieconsent";

const CookieConsent = () => {
	useEffect(() => {
		run(config);

		return () => reset();
	}, []);

	return (
		<button type="button" className="cookie-consent__button clickable underline-on-hover" onClick={showPreferences}>
			Manage cookies
		</button>
	);
};

export default CookieConsent;
