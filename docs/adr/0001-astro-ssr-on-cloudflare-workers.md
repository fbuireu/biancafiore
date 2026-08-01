# 1. Astro SSR deployed to Cloudflare Workers

Date: 2026-07-26

## Status

Accepted.

## Context

The site is CMS-driven, so pages have to be rendered rather than committed. The realistic hosts were a fully static prerender, a Node host such as Vercel, or an edge runtime. What the project wanted from a host was global low-latency SSR, image resizing that did not need a third service, and no cost while idle.

## Decision

Astro runs with `output: "server"` on the `@astrojs/cloudflare` adapter and ships to Cloudflare Workers (`wrangler deploy`), with `imageService: "cloudflare"` in production. The price accepted for it is that the code is bound to web-standard APIs instead of Node.

## Consequences

- No Node built-ins at runtime: the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`, and `node:async_hooks` / `contentful` are externalized in `vite.ssr.external`.
- Deploy, secrets, and env are Wrangler/Cloudflare-shaped; moving hosts means re-solving image handling and the runtime, so this is expensive to reverse.
- Rendering is edge-shaped but not per-request by default: content pages opt back into prerendering ([ADR 0011](./0011-hybrid-rendering-prerender-content-ssr-dynamic.md)).
