export const ANALYTICS_CATEGORY = "analytics";
export const NECESSARY_CATEGORY = "necessary";
export const CONSENT_COOKIE_NAME = "cc_cookie";
export const CONSENT_REVISION = 1;
export const CONSENT_UPDATE_WAIT = 500;
export const BETTER_STACK_SERVICE = "betterstack";
export const BETTER_STACK_COOKIES = /^bs_/;

export const CONSENT_STATUS = {
	GRANTED: "granted",
	DENIED: "denied",
} as const;

const GOOGLE_TAG_ORIGIN = "https://www.googletagmanager.com";

export interface GoogleTagIds {
	analyticsId: string;
	tagManagerId: string;
}

const literal = (value: string): string => JSON.stringify(value);

export const consentBootstrapScript = ({ analyticsId, tagManagerId }: GoogleTagIds): string => `
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
(() => {
	const start = () => {
		gtag('js', new Date());
		gtag('config', ${literal(analyticsId)});
		for (const src of [${literal(`${GOOGLE_TAG_ORIGIN}/gtag/js?id=${analyticsId}`)}, ${literal(`${GOOGLE_TAG_ORIGIN}/gtm.js?id=${tagManagerId}`)}]) {
			const script = document.createElement('script');
			script.async = true;
			script.src = src;
			document.head.append(script);
		}
	};
	if (document.prerendering) document.addEventListener('prerenderingchange', start, { once: true });
	else start();
})();
`;
