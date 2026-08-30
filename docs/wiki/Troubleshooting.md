# Troubleshooting

Failures that have actually happened here, and what they turned out to be. The full list, including the ones only an agent editing the tree would hit, is in the repository's own guide.

---

## `astro dev` hangs, SSR returns 500s, or the globe renders blank

Almost always Vite dependency-cache thrash, from running `astro check` or a second `astro dev` beside a live dev server. It orphans the optimised dependency chunks: the Effect chunk going missing gives a 500, the globe libraries going missing give a blank globe.

**Fix:** stop every dev process, delete `node_modules/.vite`, restart.

---

## Safari or WebKit loads nothing in dev

The page renders inert, with no JavaScript at all, and Chromium is fine.

The CSP carries `upgrade-insecure-requests` and WebKit obeys it on `localhost`, so every module script, font and dev-client request is rewritten to `https://localhost:4321`, which the dev server does not speak. Chromium exempts localhost, which is why this is invisible there and shows only in Safari and Playwright's `webkit` project.

The middleware strips that one directive in development. Production keeps it, so do not fold it back into the header constant unconditionally.

---

## The theme toggle does not repaint a section in production

Production only, dev fine. lightningcss downlevels `light-dark()` into an inherited-variable polyfill that breaks nested `color-scheme` inversion. The feature is excluded from the transformer for that reason; removing the exclusion to tidy the config reintroduces it. See [Styling](Styling).

---

## The preview deploy shows an under-construction page

Expected. `HIDE_CHROME` is `true` in the `development` environment, and it replaces the page body on every route outside the articles, tags, legal and error allowlist. `/`, `/about`, `/contact` and `/projects` serve no real content on a preview. See [Rendering and Routing](Rendering-and-Routing).

---

## The feed or the sitemap answers 403

From a datacenter address, not from a browser. Nothing in the tree returns 403, so the answer comes from the edge rather than from the Worker; a browser gets both, checked against production.

It is worth more than a CI curiosity: a feed reader is also an automated client on a datacenter address, so the rule that fails the test may be refusing subscribers. Cloudflare's Security Events log names the rule that blocked a given request, and the fix is a Cloudflare setting rather than a change in the repository.

---

## The build fails on one bad CMS entry

Deliberate. A malformed publish date, an unresolved author link, or an Original Source without the Republished flag is refused where it is mapped, and one entry takes the build down rather than one page rendering wrong. The error names the entry. Fix it in Contentful.

---

## A deploy dies after a clean build and upload

If the error is `Received a malformed response from the API`, look at the commit message length before anything else. wrangler sends it verbatim as a deployment annotation, and a merge commit carrying a long pull request body is enough to exceed what the API accepts. See [CI/CD](CI-CD).

---

## The docs test fails and I did not touch the docs

A test reads the project's documents and asserts every checkable claim against the repository: scripts, aliases, the folder tree, the route list, env vars, cited paths, links, ADR numbering. A failure means the documents and the code disagree, so fix whichever is wrong. It parses the markdown shape of those documents, which means reformatting one can fail the build on its own.

**Never delete an assertion to make it pass.** When the honest answer is that a document leaves something out on purpose, that goes in the allowlist at the top of the test.
