import { config } from "@modules/core/components/cookieConsent/config";
import { useEffect } from "react";
import { reset, run, showPreferences } from "vanilla-cookieconsent";

const CookieConsent = () => {
	useEffect(() => {
		run(config);

		return () => reset();
	}, []);

	return (
		<button
			type="button"
			className="cookies_consent_button --is-clickable --underline-on-hover"
			onClick={showPreferences}
		>
			Manage cookies
		</button>
	);
};

export default CookieConsent;
