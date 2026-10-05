import { reset, run, showPreferences } from "vanilla-cookieconsent";
import { config } from "../config";
import { COOKIE_CONSENT_BUTTON_CLASS } from "../const";

export function initCookieConsent(): Promise<void> {
	reset();

	for (const button of document.querySelectorAll(`.${COOKIE_CONSENT_BUTTON_CLASS}`)) {
		button.addEventListener("click", showPreferences);
	}

	return run(config);
}
