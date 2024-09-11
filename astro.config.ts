import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import MillionLint from "@million/lint";
import { defineConfig, envField } from "astro/config";

const isProd = import.meta.env.PROD;

export default defineConfig({
	experimental: {
		contentLayer: true,
		contentCollectionCache: true,
		env: {
			validateSecrets: true,
			schema: {
				SITE_URL: envField.string({
					access: "public",
					context: "client",
					default: "https://biancafiore.me",
				}),
				BIANCA_EMAIL: envField.string({
					access: "public",
					context: "client",
					default: import.meta.env.BIANCA_EMAIL,
				}),
				TWITTER_HANDLE: envField.string({
					access: "public",
					context: "client",
					default: import.meta.env.TWITTER_HANDLE,
				}),
				GOOGLE_ANALYTICS_ID: envField.string({
					access: "public",
					context: "client",
				}),
				GOOGLE_TAG_MANAGER_ID: envField.string({
					access: "public",
					context: "client",
				}),
				GOOGLE_RECAPTCHA_SITE_KEY: envField.string({
					access: "public",
					context: "client",
				}),
				GOOGLE_RECAPTCHA_SECRET_KEY: envField.string({
					access: "public",
					context: "client",
				}),
				FIREBASE_PRIVATE_KEY_ID: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_PRIVATE_KEY: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_PROJECT_ID: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_CLIENT_EMAIL: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_CLIENT_ID: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_AUTH_URI: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_TOKEN_URI: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_AUTH_CERT_URL: envField.string({
					access: "secret",
					context: "server",
				}),
				FIREBASE_CLIENT_CERT_URL: envField.string({
					access: "secret",
					context: "server",
				}),
				RESEND_API_KEY: envField.string({
					access: "secret",
					context: "server",
				}),
				CONTENTFUL_SPACE_ID: envField.string({
					access: "secret",
					context: "server",
				}),
				CONTENTFUL_DELIVERY_TOKEN: envField.string({
					access: "secret",
					context: "server",
				}),
				CONTENTFUL_PREVIEW_TOKEN: envField.string({
					access: "secret",
					context: "server",
				}),
				CONTENTFUL_SIGNIN_TOKEN: envField.string({
					access: "secret",
					context: "server",
				}),
				ALGOLIA_API_KEY: envField.string({
					access: "secret",
					context: "server",
				}),
				ALGOLIA_APP_ID: envField.string({
					access: "secret",
					context: "server",
				}),
			},
		},
	},
	site: "https://biancafiore.me",
    prefetch: true,
	vite: {
		ssr: {
			external: ["firebase-admin", "node:async_hooks", "contentful"],
		},
	},
	integrations: [
		mdx(),
		sitemap(),
		react(),
		MillionLint.astro({ lite: true }),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
	],
	redirects: {
		"/home": {
			status: 301,
			destination: "/",
		},
	},
	output: "hybrid",
	adapter: cloudflare({
		platformProxy: {
			enabled: isProd,
		},
	}),
});
