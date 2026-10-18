import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, envField, fontProviders } from "astro/config";
import emdash from "emdash/astro";
import { google } from "emdash/auth/providers/google";
import { Features } from "lightningcss";
import { loadEnv } from "vite";
import { CONTENT_CACHE, CONTENT_ROUTES } from "./src/const/contentCache";
import { securityHeaders } from "./src/const/securityHeaders";
import { MEDIA_FILE_PATH } from "./src/infrastructure/cms/media";
import { bylineCache } from "./src/infrastructure/cms/plugins/bylineCache/descriptor";
import { editorialBlocks } from "./src/infrastructure/cms/plugins/editorialBlocks/descriptor";
import { emailDelivery } from "./src/infrastructure/cms/plugins/emailDelivery/descriptor";
import { generateStaticHeaders } from "./src/infrastructure/integrations/generateStaticHeaders";
import { inlineScriptHashes } from "./src/ui/modules/core/utils/inlineScripts";

const environment = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

export default defineConfig({
	experimental: {
		contentIntellisense: true,
	},
	cache: {
		provider: cacheCloudflare(),
	},
	routeRules: Object.fromEntries(CONTENT_ROUTES.map((route) => [route, CONTENT_CACHE])),
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Newsreader",
			display: "swap",
			cssVariable: "--font-serif",
			weights: ["300 600"],
			styles: ["normal", "italic"],
		},
		{
			provider: fontProviders.google(),
			name: "Libre Caslon Display",
			display: "swap",
			cssVariable: "--font-display",
			weights: [400],
			styles: ["normal"],
		},
		{
			provider: fontProviders.google(),
			name: "Arimo",
			display: "swap",
			cssVariable: "--font-sans-serif",
			weights: [400, 500, 600, 700],
			styles: ["normal"],
			fallbacks: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
		},
	],
	image: {
		layout: "constrained",
		responsiveStyles: true,
		...(environment.SITE_URL && {
			remotePatterns: [{ hostname: new URL(environment.SITE_URL).hostname, pathname: `${MEDIA_FILE_PATH}**` }],
		}),
	},
	redirects: {
		"/sitemap-index.xml": "/sitemap.xml",
	},
	trailingSlash: "never",
	site: environment.SITE_URL,
	prefetch: {
		prefetchAll: true,
	},
	output: "server",
	vite: {
		build: {
			target: "esnext",
			assetsInlineLimit: (file) => (file.endsWith(".js") ? false : undefined),
		},
		css: {
			transformer: "lightningcss",
			lightningcss: {
				exclude: Features.LightDark,
				errorRecovery: true,
			},
		},
		resolve: {
			dedupe: ["react", "react-dom"],
		},
		ssr: {
			external: ["node:async_hooks"],
		},
	},
	integrations: [
		generateStaticHeaders(
			securityHeaders({
				isDevelopment: false,
				inlineScriptHashes: inlineScriptHashes(environment.GOOGLE_ANALYTICS_ID),
			}),
		),
		react({ compiler: true }),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			fonts: false,
			admin: { siteName: "Bianca Fiore", locales: ["en"] },
			authProviders: [google()],
			plugins: [editorialBlocks(), emailDelivery(), bylineCache()],
		}),
	],
	adapter: cloudflare({ imageService: "cloudflare-binding" }),
	env: {
		schema: {
			SITE_URL: envField.string({
				access: "public",
				context: "client",
			}),
			BIANCA_EMAIL: envField.string({
				access: "public",
				context: "client",
			}),
			TWITTER_HANDLE: envField.string({
				access: "public",
				context: "client",
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
			BETTER_STACK_TRACKING_TOKEN: envField.string({
				access: "public",
				context: "client",
				optional: true,
			}),
			GOOGLE_RECAPTCHA_SECRET_KEY: envField.string({
				access: "secret",
				context: "server",
			}),
			RESEND_API_KEY: envField.string({
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
			HIDE_CHROME: envField.boolean({
				context: "client",
				access: "public",
				default: false,
			}),
		},
	},
});
