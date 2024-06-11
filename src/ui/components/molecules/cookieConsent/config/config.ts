import type { CookieConsentConfig } from "vanilla-cookieconsent";
import { updatePreferences } from "../utils/updatePreferences";

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
		necessary: {
			enabled: true,
		},
		analytics: {
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
						"Cookie modal description Cookie modal description Cookie modal description Cookie modal description",
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
								"We use cookies to ensure the basic functionalities of the website and to enhance your online experience...",
						},
						{
							title: "Performance and Analytics cookies",
							description: "These cookies allow the website to remember the choices you have made in the past",
							linkedCategory: "analytics",
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
										description: 'Cookie set by <a href="#das">Google Analytics</a>',
										expiration: "Expires after 12 days",
									},
									{
										name: "_gid",
										domain: "Google Analytics",
										description: 'Cookie set by <a href="#das">Google Analytics</a>',
										expiration: "Session",
									},
								],
							},
						},
						{
							title: "Targeting and Advertising",
							description:
								"These cookies are used to make advertising messages more relevant to you and your interests. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.",
							linkedCategory: "targeting",
						},
						{
							title: "More information",
							description:
								'For any queries in relation to my policy on cookies and your choices, please <a href="/contact">contact us</a>',
						},
					],
				},
			},
		},
	},
};
