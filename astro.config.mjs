import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import million from "million/compiler";

export default defineConfig({
	experimental: {
		actions: true,
	},
	site: "https://biancafiore.me",
	vite: {
		ssr: {
			external: ["firebase-admin", "node:async_hooks"],
		},
	},
	integrations: [
		mdx(),
		sitemap(),
		react({ compat: true }),
		million.vite({ mode: "react", server: true, auto: true }),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
	],
	output: "server",
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
