# 18. HIDE_CHROME serves an under-construction placeholder in place of most of the site

Date: 2026-08-22

## Status

Accepted.

## Context

The site went live before its non-editorial pages were ready. The Blog, the Tag Index and the legal pages were finished; the home page, About, Contact and Projects were not, and shipping them half-built to a client's own domain was not acceptable.

The cheapest way to express that would have been a per-page flag, or simply not deploying those routes. Neither survives contact with the requirement: the pages have to exist so the header can link to them, and the set that is ready changes over time.

## Decision

One public boolean env var, `HIDE_CHROME`, is read in exactly one module, `siteChrome` in `@modules/core/utils/siteChrome.ts`, which answers four questions about a URL: `showsHeader`, `showsBreadcrumbs`, `showsTableOfContents` and `servesRealContent`. No component reads the variable, and no call site is conditional: `BaseLayout` always asks whether to render the `Header` and whether to serve the `<slot />` or the placeholder, `Breadcrumbs` always asks about itself, and the Article route always asks about the Table of Contents.

**It is deny-by-default.** A route serves real content only if it sits within one of the `PUBLISHED_ROUTES` `siteChrome` names, `/articles`, `/tags`, `/terms-and-conditions`, `/privacy-policy`, `/404`, `/500`, so a page added tomorrow inherits the placeholder rather than the exemption. "Within" is whole path segments (`isWithin` in `@modules/core/utils/pathname`), shared with `getPage`, so `/tags-manifesto` is not under `/tags`.

The name understates it by a wide margin: this does not hide chrome, it **replaces the page body** on every route outside that list.

## Consequences

- **A preview deployment is not a faithful target.** `_deploy.yml` passes `HIDE_CHROME: ${{ vars.HIDE_CHROME || 'false' }}`, so what a preview shows depends on a GitHub environment variable rather than on anything in this repository. Where it is on, `/`, `/about`, `/contact` and `/projects` serve no real content, and the end-to-end suite can only cover what survives that, which is why there are two specs and why the contact flow is not among them ([ADR 0016](./0016-vitest-resolves-astro-modules-itself.md) records the same limit from the unit side).
- **The variable is public**, because the decision has to be made during a prerender and read by the client bootstrap alike. It is not a security control: the routes are still built and still served, they simply render a placeholder.
- **Nothing in the code makes the requirement visible**, which is why it is a Gotchas bullet in `CLAUDE.md` as well as here. A well-meaning change that reads `HIDE_CHROME` in a second module, or that adds a route to `PUBLISHED_ROUTES` to "unblock" a preview, publishes an unfinished page to a client's domain without breaking anything observable.
- **Removing it is a deletion, not a migration.** When every page is ready, `siteChrome` collapses to nothing and the four questions go with it. Until then, adding a page to `PUBLISHED_ROUTES` is the act of publishing it, and should be reviewed as such.
