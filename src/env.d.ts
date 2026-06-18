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
	readonly EMDASH_TURSO_URL: string;
	readonly EMDASH_TURSO_AUTH_TOKEN: string;
	readonly EMDASH_R2_ENDPOINT: string;
	readonly EMDASH_R2_BUCKET: string;
	readonly EMDASH_R2_ACCESS_KEY_ID: string;
	readonly EMDASH_R2_SECRET_ACCESS_KEY: string;
	readonly EMDASH_R2_PUBLIC_URL: string;
	readonly EMDASH_API_URL: string;
	readonly EMDASH_API_TOKEN: string;
	readonly MIGRATION_CONTENTFUL_SPACE_ID: string;
	readonly MIGRATION_CONTENTFUL_DELIVERY_TOKEN: string;
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
}

export {};
