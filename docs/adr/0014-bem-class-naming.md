# 14. BEM class naming

Date: 2026-07-26

## Status

Accepted. Supersedes the standalone-modifier convention used until this point.

## Context

Component CSS is a plain stylesheet loaded next to its component — Astro does not scope it — so class names are the only isolation there is. Blocks and elements already followed BEM (`.blog__inner`, `.article-card__byline`), but modifiers did not: state and variants were standalone double-dash classes (`.--is-active`, `.--is-loading`, `.--inverted-color-scheme`) applied alongside the block, with only a handful of `.block--modifier` outliers.

That split had three costs. The `is-`/`has-` prefixes are SMACSS vocabulary, so the codebase spoke two methodologies at once. A bare `.--is-current-page` declared in one component's stylesheet silently applied site-wide. And because a modifier belonged to no block, the same class name was toggled onto seven unrelated elements to express one piece of state.

## Decision

Modifiers are fused onto their owner: `block--modifier` or `block__element--modifier`, with the `is-`/`has-` prefix dropped. `.contact-tab--active`, `.contact-form__submit--loading`, `.theme-toggle--toggled`.

Three consequences follow, and they are the parts worth recording:

**Cross-block utilities become blocks, used as a BEM mix.** `underline-on-hover`, `clickable`, `inverted-color-scheme` and `current-page` are used by unrelated blocks, so under strict BEM they would have to be duplicated as a modifier on each one — twelve synchronised copies of `underline-on-hover` alone. Instead they are blocks in their own right, mixed in: `class="navigation__menu__link underline-on-hover clickable"`. BEM sanctions the mix; the honest caveat is that a block is meant to be a UI entity and these are behavioural utilities, so this is the seam where BEM and utility CSS blur.

**Page-wide state hangs off a `page` block on `<html>`.** `<main>` becomes `page__main`. The block carries both the route (`page--about`) and state that restyles several unrelated blocks at once (`page--menu-open`), consumed by descent: `.page--menu-open .reading-progress { … }`. `<html>` is the only ancestor common to `body`, the header and the reading progress bar, so it is the only element that can own this.

**Fusing changes specificity.** `.reveal.--fade` was two classes; `.reveal--fade` is one. Modifiers that previously outranked their base rule now merely follow it, so they must stay after it in source order.

## Consequences

Menu state went from seven `classList.toggle` calls to one, which let five selector constants and five `querySelector` calls go.

**An element that is a mix needs a modifier per block.** The contact tabs are `class="contact-tab underline-on-hover"`, and the single old `--is-active` class served both rules at once: the bold weight from `.contact-tab`, and the persistent underline (plus the hover suppression) from `.underline-on-hover`. Splitting it into `contact-tab--active` alone silently dropped the underline. `tabs.ts` now toggles `contact-tab--active` and `underline-on-hover--active` together. Any shared modifier being split needs this check.

Classes that exist purely as JS state and style nothing are `data-` attributes, not classes: the re-entrancy guard in `flyPlane` is now `button.dataset.flying`.

The rename exposed dead code that the old naming had hidden: a theme-toggle branch whose CSS expected `.--is-dark` while the JS wrote `dark` (six selectors that never matched), an article-card variant map producing classes no stylesheet defined, a `--is-hidden` toggle nothing styled, and a `:not(…) svg` rule that could never match its own DOM. All removed.

There is no `page--tag`. `getPage` resolves `/tags/<slug>` to `tags` because `PAGES_ROUTES.TAGS` is declared before `TAG` and the lookup uses `includes`, so tag detail pages share the `tags-page` container. Left as-is: reordering the routes would change which rules apply to those pages.

The repo has no test suite, so this refactor was verified by building `HEAD` and the refactored tree and diffing the classes in the emitted HTML against the selectors in the emitted CSS, requiring every orphan on either side to be accounted for.
