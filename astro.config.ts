import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import db from "@astrojs/db";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField, fontProviders } from "astro/config";
import emdash, { local, s3 } from "emdash/astro";
import { libsql, sqlite } from "emdash/db";

/**
 * EmDash runs in-process. NOTE: as of emdash@0.19.0 the published package only
 * ships `sqlite | libsql | postgres` database adapters and `local | s3` storage
 * adapters — there is no `d1()`/`r2()` factory yet (despite the docs). On
 * Cloudflare Workers we therefore use Turso (libSQL over HTTP) for the database
 * and R2 through its S3-compatible API for media. Local dev uses a SQLite file
 * and on-disk uploads.
 */
const emdashIntegration =
	process.env.NODE_ENV === "production"
		? emdash({
				database: libsql({
					url: process.env.EMDASH_TURSO_URL as string,
					authToken: process.env.EMDASH_TURSO_AUTH_TOKEN,
				}),
				storage: s3({
					endpoint: process.env.EMDASH_R2_ENDPOINT as string,
					bucket: process.env.EMDASH_R2_BUCKET as string,
					accessKeyId: process.env.EMDASH_R2_ACCESS_KEY_ID,
					secretAccessKey: process.env.EMDASH_R2_SECRET_ACCESS_KEY,
					region: "auto",
					publicUrl: process.env.EMDASH_R2_PUBLIC_URL,
				}),
			})
		: emdash({
				database: sqlite({ url: "file:./.emdash/data.db" }),
				storage: local({
					directory: "./.emdash/uploads",
					baseUrl: "/_emdash/api/media/file",
				}),
			});

export default defineConfig({
	experimental: {
		contentIntellisense: true,
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
		service: {
			entrypoint: "./src/imageService.ts",
		},
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
		resolve: {
			dedupe: ["react", "react-dom"],
			alias: {
				"node-fetch": fileURLToPath(new URL("./src/shims/node-fetch.ts", import.meta.url)),
				"cross-fetch": fileURLToPath(new URL("./src/shims/node-fetch.ts", import.meta.url)),
			},
		},
		ssr: {
			external: ["node:async_hooks"],
		},
	},
	integrations: [
		db(),
		emdashIntegration,
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
	adapter: cloudflare(),
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
			// Runtime: EmDash database (Turso/libSQL) + media storage (R2 via S3 API).
			EMDASH_TURSO_URL: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_TURSO_AUTH_TOKEN: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_R2_ENDPOINT: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_R2_BUCKET: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_R2_ACCESS_KEY_ID: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_R2_SECRET_ACCESS_KEY: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_R2_PUBLIC_URL: envField.string({ access: "secret", context: "server", optional: true }),
			// CLI (`pnpm cms:types`) + migration script (`pnpm cms:migrate`) only.
			EMDASH_API_URL: envField.string({ access: "secret", context: "server", optional: true }),
			EMDASH_API_TOKEN: envField.string({ access: "secret", context: "server", optional: true }),
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
