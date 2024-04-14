import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import partytown from "@astrojs/partytown";
import cloudflare from "@astrojs/cloudflare";
import million from "million/compiler";

export default defineConfig({
	site: "https://biancafiore.me",
	integrations: [
		mdx(),
		sitemap(),
		react(),
		million.vite({ mode: "react", server: true, auto: true }),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
	],
	output: "server",
	adapter: cloudflare({
		imageService: "cloudflare",
	}),
});
