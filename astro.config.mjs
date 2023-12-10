import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from "@astrojs/react";
import partytown from "@astrojs/partytown";
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  site: 'https://biancafiore.me',
  integrations: [mdx(), sitemap(), react(), partytown()],
  output: "server",
  adapter: netlify(),
  vite: {
    server: {
      fs: {
        strict: false
      }
    }
  },
});
