import cloudflare from "@astrojs/cloudflare";
import db from "@astrojs/db";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
// @ts-ignore:next-line
import { defineConfig, envField, fontProviders } from "astro/config";

const isProd = import.meta.env.PROD;

export default defineConfig({
	experimental: {
		contentIntellisense: true,
		fonts: [
			{
				provider: fontProviders.google(),
				name: "Nunito Sans",
				cssVariable: "--font-nunito-sans",
			},
			{
				provider: fontProviders.google(),
				name: "Baskervville",
				cssVariable: "--font-baskervville",
			},
		],
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	trailingSlash: "never",
	site: "https://biancafiore.me",
	prefetch: {
		prefetchAll: true,
	},
	output: "server",
	vite: {
		build: {
			target: "esnext",
		},
		ssr: {
			external: ["node:async_hooks", "contentful"],
		},
	},
	integrations: [
		db(),
		mdx(),
		react(),
		sitemap(),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
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
				default: import.meta.env.SITE_URL,
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
