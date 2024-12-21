import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import MillionLint from "@million/lint";
// @ts-ignore:next-line
import { defineConfig, envField } from "astro/config";

import db from "@astrojs/db";

const isProd = import.meta.env.PROD;

export default defineConfig({
	experimental: {
		responsiveImages: true,
		svg: true,
	},
	image: {
		experimentalLayout: "responsive",
	},
	site: "https://biancafiore.me",
	prefetch: true,
	output: "server",
	vite: {
		ssr: {
			external: ["node:async_hooks", "contentful"],
		},
	},
	integrations: [
		mdx(),
		sitemap(),
		react(),
		MillionLint.astro({ lite: true, telemetry: false }),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
		db(),
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: isProd,
		},
	}),
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
			ASTRO_DB_REMOTE_URL: envField.string({
				access: "secret",
				context: "server",
			}),
			ASTRO_DB_APP_TOKEN: envField.string({
				access: "secret",
				context: "server",
			}),
		},
	},
});
