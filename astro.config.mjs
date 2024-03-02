import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';
import million from 'million/compiler';
import MillionCompiler from '@million/lint';

export default defineConfig({
  site: 'https://biancafiore.me',
  integrations: [
    mdx(),
    sitemap(),
    react(),
    million.vite({mode: 'react', server: true, auto: true}),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  vite: {
    plugins: [MillionCompiler.vite()],
    define: {
      'import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID': process.env.PUBLIC_GOOGLE_ANALYTICS_ID,
      'import.meta.env.PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY': process.env.PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY,
      'import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY': process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
    },
  },
  output: 'hybrid',
  adapter: netlify(),
});
