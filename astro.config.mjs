import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://biancafiore.me',
  integrations: [
    mdx(),
    sitemap(),
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  output: 'hybrid',
  adapter: netlify(),
  vite: {
    define: {
      'import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID': process.env.PUBLIC_GOOGLE_ANALYTICS_ID,
    },
  },
});
