# 11. Hybrid rendering: prerender content pages, SSR only for dynamic

Date: 2026-07-26

## Status

Accepted.

## Context

The adapter runs `output: "server"` ([ADR 0001](./0001-astro-ssr-on-cloudflare-workers.md)), but almost every page on the site is the same for every visitor and changes only when its Contentful entry does. Paying per-request SSR for those pages buys nothing; going fully static to avoid it would give up server actions, which the contact form needs.

## Decision

Every content page opts into static prerendering with `export const prerender = true`, so the site ships as prerendered HTML served from the edge, and the Workers SSR runtime is only invoked for genuinely dynamic paths: the contact server action, `/contact` itself, and on-demand 404/500.

**Amended:** `/contact` was prerendered and is no longer. Two things it has to do are request-time work. An Astro action can only be posted to from an on-demand page, so under prerendering the form could not submit without JavaScript, and the page served no `<form>` at all because its island was `client:only`. And the `?tab=` deep link the tabs module publishes is read from `Astro.url.searchParams`, which a prerendered page does not have, so the server always rendered the email tab and the client flipped it after hydration. It is the one page on the site whose content depends on the request.

## Consequences

- Prerendered pages are identical for every visitor, so per-user state cannot be server-rendered: the theme is applied by a client bootstrap before first paint ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)).
- Content changes need a build, not a request. Publishing in Contentful fires a webhook that dispatches `publish-article.yml`, which redeploys production. The rebuild is automatic, but an entry edited without that webhook firing stays invisible until the next deploy.
- A page that starts needing request-time data has to drop its `prerender` flag deliberately; forgetting the flag is what silently makes it dynamic.
- `/contact` now costs a Worker invocation per view rather than being served from the edge. It is one route, and it buys a form that works before JavaScript arrives.
