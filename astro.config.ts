import cloudflare from '@astrojs/cloudflare';
import db from '@astrojs/db';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  experimental: {
    contentIntellisense: true,
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      display: 'swap',
      cssVariable: '--font-sans-serif',
    },
    {
      provider: fontProviders.google(),
      name: 'Playfair Display',
      display: 'swap',
      cssVariable: '--font-serif',
    },
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
    service: {
      entrypoint: './src/imageService.ts',
    },
  },
  trailingSlash: 'never',
  site: 'https://biancafiore.me',
  prefetch: {
    prefetchAll: true,
  },
  output: 'server',
  vite: {
    build: {
      target: 'esnext',
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'node-fetch': fileURLToPath(new URL('./src/shims/node-fetch.ts', import.meta.url)),
        'cross-fetch': fileURLToPath(new URL('./src/shims/node-fetch.ts', import.meta.url)),
      },
    },
    ssr: {
      external: ['node:async_hooks', 'contentful'],
    },
  },
  integrations: [
    db(),
    mdx(),
    react(),
    sitemap({
      filter: (page) => {
        const SITEMAP_ALLOWED_SEGMENTS = ['articles', 'tags'];
        const { pathname } = new URL(page);
        const [, segment, slug] = pathname.split('/');

        return SITEMAP_ALLOWED_SEGMENTS.includes(segment) && Boolean(slug);
      },
      customPages: ['https://biancafiore.me/tags'],
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  adapter: cloudflare(),
  env: {
    schema: {
      SITE_URL: envField.string({
        access: 'public',
        context: 'client',
        default: import.meta.env.SITE_URL,
      }),
      BIANCA_EMAIL: envField.string({
        access: 'public',
        context: 'client',
        default: import.meta.env.BIANCA_EMAIL,
      }),
      TWITTER_HANDLE: envField.string({
        access: 'public',
        context: 'client',
        default: import.meta.env.TWITTER_HANDLE,
      }),
      GOOGLE_ANALYTICS_ID: envField.string({
        access: 'public',
        context: 'client',
      }),
      GOOGLE_TAG_MANAGER_ID: envField.string({
        access: 'public',
        context: 'client',
      }),
      GOOGLE_RECAPTCHA_SITE_KEY: envField.string({
        access: 'public',
        context: 'client',
      }),
      GOOGLE_RECAPTCHA_SECRET_KEY: envField.string({
        access: 'public',
        context: 'client',
      }),
      RESEND_API_KEY: envField.string({
        access: 'secret',
        context: 'server',
      }),
      CONTENTFUL_SPACE_ID: envField.string({
        access: 'secret',
        context: 'server',
      }),
      CONTENTFUL_DELIVERY_TOKEN: envField.string({
        access: 'secret',
        context: 'server',
      }),
      CONTENTFUL_PREVIEW_TOKEN: envField.string({
        access: 'secret',
        context: 'server',
      }),
      CONTENTFUL_SIGNIN_TOKEN: envField.string({
        access: 'secret',
        context: 'server',
      }),
      ASTRO_DB_REMOTE_URL: envField.string({
        access: 'secret',
        context: 'server',
      }),
      ASTRO_DB_APP_TOKEN: envField.string({
        access: 'secret',
        context: 'server',
      }),
      HIDE_CHROME: envField.boolean({
        context: 'client',
        access: 'public',
        default: false,
      }),
    },
  },
});
