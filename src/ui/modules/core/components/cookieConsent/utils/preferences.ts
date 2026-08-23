import {
	ANALYTICS_CATEGORY,
	CONSENT_STATUS,
	CONSENT_UPDATE_WAIT,
} from "@modules/core/components/cookieConsent/utils/consentGate";
import { acceptedCategory } from "vanilla-cookieconsent";

export function updatePreferences(): void {
	function gtag() {
		// biome-ignore lint/complexity/noArguments: GA integration
		window.dataLayer.push(arguments);
	}

	// @ts-expect-error: gtag uses arguments internally, TS can't infer the call signature
	gtag("consent", "update", {
		analytics_storage: acceptedCategory(ANALYTICS_CATEGORY) ? CONSENT_STATUS.GRANTED : CONSENT_STATUS.DENIED,
		wait_for_update: CONSENT_UPDATE_WAIT,
	});
}
