import { PAGES_ROUTES } from "@const/index";
import {
	ANALYTICS_CATEGORY,
	CONSENT_COOKIE_NAME,
	NECESSARY_CATEGORY,
} from "@modules/core/components/cookieConsent/utils/consentGate";
import type { CookieConsentConfig } from "vanilla-cookieconsent";
import { updatePreferences } from "./utils/preferences";

export const config: CookieConsentConfig = {
	onFirstConsent: () => updatePreferences(),
	onChange: () => updatePreferences(),
	guiOptions: {
		consentModal: {
			layout: "box inline",
			position: "bottom left",
		},
		preferencesModal: {
			layout: "box",
			position: "right",
		},
	},
	cookie: {
		name: CONSENT_COOKIE_NAME,
	},
	categories: {
		[NECESSARY_CATEGORY]: {
			enabled: true,
		},
		[ANALYTICS_CATEGORY]: {
			autoClear: {
				cookies: [
					{
						name: /^(_ga|_gid)/,
					},
				],
			},
			services: {
				ga4: {
					label:
						'<a href="https://marketingplatform.google.com/about/analytics/terms/us/" target="_blank">Google Analytics 4</a>',
					cookies: [
						{
							name: /^(_ga|_gid)/,
						},
					],
				},
			},
		},
	},
	language: {
		default: "en",
		translations: {
			en: {
				consentModal: {
					title: "We use cookies",
					description:
						"We use cookies to ensure the basic functionalities of the website and to enhance your online experience.",
					acceptAllBtn: "Accept all",
					acceptNecessaryBtn: "Reject all",
					showPreferencesBtn: "Manage Individual preferences",
				},
				preferencesModal: {
					title: "Manage cookie preferences",
					acceptAllBtn: "Accept all",
					acceptNecessaryBtn: "Reject all",
					savePreferencesBtn: "Save preferences",
					closeIconLabel: "Close modal",
					sections: [
						{
							title: "Cookie usage",
							description:
								"We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can opt-out at anytime",
						},
						{
							title: "Performance and Analytics cookies",
							description: "These cookies allow the website to remember the choices you have made in the past.",
							linkedCategory: ANALYTICS_CATEGORY,
							cookieTable: {
								headers: {
									name: "Name",
									domain: "Service",
									description: "Description",
									expiration: "Expiration",
								},
								body: [
									{
										name: "_ga",
										domain: "Google Analytics",
										description:
											'Cookie set by <a href="https://policies.google.com/technologies/cookies?hl=en-US" target="_blank" rel="external">Google Analytics</a>',
										expiration: "Expires after 12 days",
									},
									{
										name: "_gid",
										domain: "Google Analytics",
										description:
											'Cookie set by <a href="https://policies.google.com/technologies/cookies?hl=en-US" target="_blank" rel="external">Google Analytics</a>',
										expiration: "Session",
									},
								],
							},
						},
						{
							title: "More information",
							description: `For any queries in relation to our policy on cookies and your choices, please <a href="${PAGES_ROUTES.CONTACT}">contact us</a>.`,
						},
					],
				},
			},
		},
	},
};
