import { Cookie } from "@assets/images/svg-components/cookie";
import { config } from "@shared/ui/components/cookieConsent/config";
import { useEffect } from "react";
import { reset, run, showPreferences } from "vanilla-cookieconsent";
import "./cookie-consent.css";

const CookieConsent = () => {
	useEffect(() => {
		run(config);

		return () => reset();
	}, []);

	return (
		<button type="button" className="cookies_consent_button flex justify-center clickable" onClick={showPreferences}>
			<Cookie classNames={"cookie_consent_icon"} />
		</button>
	);
};

export default CookieConsent;
