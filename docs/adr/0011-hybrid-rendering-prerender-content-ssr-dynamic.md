# 11. Hybrid rendering: prerender content pages, SSR only for dynamic

Date: 2026-07-26

## Status

Superseded by [ADR 0022](./0022-content-renders-per-request-behind-the-workers-cache.md): with the content in the Worker's own D1 database ([ADR 0021](./0021-emdash-self-hosted-cms.md)) a build has nothing to prerender, so content pages render per request behind the Workers cache. Only the legal pages still prerender.

## Context

The adapter runs `output: "server"` ([ADR 0001](./0001-astro-ssr-on-cloudflare-workers.md)), but almost every page on the site is the same for every visitor and changes only when its CMS entry does. Paying per-request SSR for those pages buys nothing; going fully static to avoid it would give up server actions, which the contact form needs.

## Decision

Every content page opts into static prerendering with `export const prerender = true`, so the site ships as prerendered HTML served from the edge, and the Workers SSR runtime is only invoked for genuinely dynamic paths: the contact page and its server action, and on-demand 404/500.

## Consequences

- Prerendered pages are identical for every visitor, so per-user state cannot be server-rendered: the theme is applied by a client bootstrap before first paint ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)).
- Content changes need a build, not a request. Publishing in Contentful fired a webhook that dispatched `publish-article.yml`, which redeployed production, so the rebuild was automatic, but an entry edited without that webhook firing stayed invisible until the next deploy.
- A page that starts needing request-time data has to drop its `prerender` flag deliberately; forgetting the flag is what silently makes it dynamic.
