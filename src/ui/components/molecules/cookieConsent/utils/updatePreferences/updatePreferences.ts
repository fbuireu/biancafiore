import type { CookieValue } from 'vanilla-cookieconsent';

type ConsentStatus = "granted" | "denied";

interface Preferences {
	analytics_storage: ConsentStatus;
	ad_storage: ConsentStatus;
	ad_user_data: ConsentStatus;
	ad_personalization: ConsentStatus;
}

const COOKIE_CATEGORY_MAP: { [key: string]: Partial<Preferences> } = {
	analytics: { analytics_storage: "granted" },
	advertising: {
		ad_storage: "granted",
		ad_user_data: "granted",
		ad_personalization: "granted",
	},
};

const DEFAULT_PREFERENCES: Preferences = {
	analytics_storage: "denied",
	ad_storage: "denied",
	ad_user_data: "denied",
	ad_personalization: "denied",
};

function gtag(...args: unknown[]) {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(args);
}

export function updatePreferences(cookie: CookieValue) {
	if (!cookie.categories || !Array.isArray(cookie.categories)) {
		console.error("Invalid cookie categories");
		return;
	}
	let preferences = { ...DEFAULT_PREFERENCES };

	cookie.categories.forEach((category) => {
		const updates = COOKIE_CATEGORY_MAP[category];
		if (!updates) return;

		preferences = { ...preferences, ...updates };
	});

	console.log("cookie", cookie);
	console.log("Updated preferences:", preferences);

	gtag("consent", "update", preferences);
	console.log(window.dataLayer);
}
