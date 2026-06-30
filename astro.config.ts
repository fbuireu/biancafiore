import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField, fontProviders, memoryCache } from "astro/config";
import { Features } from "lightningcss";
import { IMAGE_CDN } from "./src/const/imageCdn";

const isProductionBuild = process.env.CLOUDFLARE_ENV === "production";
const imageCdn = isProductionBuild ? IMAGE_CDN.CLOUDFLARE : IMAGE_CDN.CONTENTFUL;

export default defineConfig({
	experimental: {
		contentIntellisense: true,
	},
	cache: {
		provider: memoryCache(),
	},
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
		domains: ["images.ctfassets.net"],
	},
	trailingSlash: "never",
	site: "https://biancafiore.me",
	prefetch: {
		prefetchAll: true,
	},
	output: "server",
	vite: {
		define: {
			"import.meta.env.IMAGE_CDN": JSON.stringify(imageCdn),
		},
		build: {
			target: "esnext",
		},
		css: {
			transformer: "lightningcss",
			lightningcss: {
				exclude: Features.LightDark,
			},
		},
		resolve: {
			dedupe: ["react", "react-dom"],
		},
		ssr: {
			external: ["node:async_hooks", "contentful"],
		},
	},
	integrations: [
		react(),
		sitemap({
			filter: (page) => {
				const SITEMAP_ALLOWED_SEGMENTS = ["articles", "tags"];
				const { pathname } = new URL(page);
				const [, segment, slug] = pathname.split("/");

				return SITEMAP_ALLOWED_SEGMENTS.includes(segment) && Boolean(slug);
			},
			customPages: ["https://biancafiore.me/tags"],
		}),
	],
	adapter: cloudflare({ imageService: isProductionBuild ? "cloudflare" : "passthrough" }),
	env: {
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
