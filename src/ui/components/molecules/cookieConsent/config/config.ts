import type { CookieConsentConfig } from 'vanilla-cookieconsent';
import { updatePreferences } from '@components/molecules/cookieConsent/utils/updatePreferences';

export const config: CookieConsentConfig = {
	onFirstConsent: ({ cookie }) => updatePreferences(cookie),
	onChange: ({ cookie }) => updatePreferences(cookie),
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
	categories: {
		analytics: {
			services: {
				ga4: {
					label:
						'<a href="https://marketingplatform.google.com/about/analytics/terms/us/" target="_blank">Google Analytics 4</a>',
					cookies: [
						{
							name: /^_ga/,
						},
					],
				},
			},
		},
	},
	language: {
		default: "en",
		autoDetect: "browser",
		translations: {
			// en: '/assets/translations/en.json',
			en: {
				consentModal: {
					title: "Hello traveller, it's cookie time!",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
					acceptAllBtn: "Accept all",
					acceptNecessaryBtn: "Reject all",
					showPreferencesBtn: "Manage preferences",
					footer:
						'<a href="/privacy-policy">Privacy Policy</a>\n<a href="/terms-and-conditions">Terms and conditions</a>',
				},
				preferencesModal: {
					title: "Consent Preferences Center",
					acceptAllBtn: "Accept all",
					acceptNecessaryBtn: "Reject all",
					savePreferencesBtn: "Save preferences",
					closeIconLabel: "Close modal",
					serviceCounterLabel: "Service|Services",
					sections: [
						{
							title: "Cookie Usage",
							description:
								"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
						},
						{
							title: "Analytics Cookies",
							description:
								"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
							linkedCategory: "analytics",
						},
						{
							title: "More information",
							description:
								'For any query in relation to my policy on cookies and your choices, please <a class="cc__link" href="/contact">contact me</a>.',
						},
					],
				},
			},
		},
	},
};
