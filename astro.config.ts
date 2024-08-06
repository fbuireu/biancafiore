import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import MillionLint from "@million/lint";
import { defineConfig } from "astro/config";

const isProd = import.meta.env.PROD;

export default defineConfig({
	experimental: {
		actions: true,
	},
	site: "https://biancafiore.me",
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
	output: "hybrid",
	adapter: cloudflare({
		platformProxy: {
			enabled: isProd,
		},
	}),
});
