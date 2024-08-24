/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly PUBLIC_SITE_URL: string;
	readonly BIANCA_EMAIL: string;
	readonly TWITTER_HANDLE: string;
	readonly GOOGLE_ANALYTICS_ID: string;
	readonly GOOGLE_TAG_MANAGER_ID: string;
	readonly GOOGLE_RECAPTCHA_SITE_KEY: string;
	readonly GOOGLE_RECAPTCHA_SECRET_KEY: string;
	readonly FIREBASE_PRIVATE_KEY_ID: string;
	readonly FIREBASE_PRIVATE_KEY: string;
	readonly FIREBASE_PROJECT_ID: string;
	readonly FIREBASE_CLIENT_EMAIL: string;
	readonly FIREBASE_CLIENT_ID: string;
	readonly FIREBASE_AUTH_URI: string;
	readonly FIREBASE_TOKEN_URI: string;
	readonly FIREBASE_AUTH_CERT_URL: string;
	readonly FIREBASE_CLIENT_CERT_URL: string;
	readonly RESEND_API_KEY: string;
	readonly CONTENTFUL_SPACE_ID: string;
	readonly CONTENTFUL_DELIVERY_TOKEN: string;
	readonly CONTENTFUL_PREVIEW_TOKEN: string;
	readonly CONTENTFUL_SIGNIN_TOKEN: string;
	readonly ALGOLIA_API_KEY: string;
	readonly ALGOLIA_APP_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	interface Window {
		dataLayer: any[];
	}
	interface ProtoImage {
		format: "svg" | "png" | "jpg" | "jpeg" | "webp";
		src: string;
		width: number;
		height: number;
	}
}

export {};
