export const ANALYTICS_CATEGORY = "analytics";
export const CONSENT_COOKIE_NAME = "cc_cookie";
export const CONSENT_UPDATE_WAIT = 500;

export const CONSENT_STATUS = {
	GRANTED: "granted",
	DENIED: "denied",
} as const;

export type ConsentStatus = (typeof CONSENT_STATUS)[keyof typeof CONSENT_STATUS];

const literal = (value: string) => JSON.stringify(value);

const consentCookiePattern = (): RegExp => new RegExp(`(^| )${CONSENT_COOKIE_NAME}=([^;]+)`);

export function analyticsConsentIn(rawCookies: string): ConsentStatus {
	const stored = rawCookies.match(consentCookiePattern())?.[2];

	if (!stored) return CONSENT_STATUS.DENIED;

	try {
		const { categories } = JSON.parse(decodeURIComponent(stored));

		return Array.isArray(categories) && categories.includes(ANALYTICS_CATEGORY)
			? CONSENT_STATUS.GRANTED
			: CONSENT_STATUS.DENIED;
	} catch {
		return CONSENT_STATUS.DENIED;
	}
}

export const consentBootstrapScript = (analyticsId: string): string => `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { analytics_storage: (() => {
	try {
		const stored = document.cookie.match(new RegExp("(^| )" + ${literal(CONSENT_COOKIE_NAME)} + "=([^;]+)"))?.[2];
		if (!stored) return ${literal(CONSENT_STATUS.DENIED)};
		const { categories } = JSON.parse(decodeURIComponent(stored));
		if (Array.isArray(categories) && categories.includes(${literal(ANALYTICS_CATEGORY)})) return ${literal(CONSENT_STATUS.GRANTED)};
	} catch {}
	return ${literal(CONSENT_STATUS.DENIED)};
})() });
gtag('js', new Date());
gtag('config', ${literal(analyticsId)});
`;
