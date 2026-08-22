# 13. Analytics gated behind cookie consent

Date: 2026-07-26

## Status

Accepted.

## Context

The site serves EU visitors and loads Google Analytics / Tag Manager. Consent Mode's default, if nothing intervenes, is to collect first and ask later, which is simpler and non-compliant. The requirement is legal rather than technical, so nothing in the code makes it visible: a well-meaning change that moves the GA snippet earlier, or drops the inline script as dead weight, breaks compliance without breaking anything observable.

## Decision

Analytics load with consent denied by default. An inline script in `<head>` reads the `cc_cookie` written by vanilla-cookieconsent and calls `gtag('consent', 'default', { analytics_storage })`, set to `granted` only if the visitor accepted the `analytics` category, before GA/GTM initialise.

**What that script is, and what "the analytics category" means, is one module**: `cookieConsent/utils/consentGate.ts` declares `ANALYTICS_CATEGORY`, `CONSENT_COOKIE_NAME` and `CONSENT_STATUS`, exports `analyticsConsentIn` for a test to drive, and builds the render-blocking script from the same constants, exactly as `THEME_BOOTSTRAP_SCRIPT` does for the theme ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)). It used to be four literals in three shapes across three files, one of them the vendor's private storage format written out longhand in an Astro template. And `updatePreferences` asked whether the *first* accepted category was accepted, which is true for any non-empty list: it answered correctly only because the preferences modal happens to give `necessary` no section, so nothing but `analytics` can ever reach that array. It asks about `ANALYTICS_CATEGORY` by name now.

## Consequences

- The ordering is load-bearing: the consent default has to be set before GA/GTM initialise, so this script stays inline and stays first ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md) puts the theme bootstrap in the same position for the same reason).
- Analytics under-report by design; visitors who never accept are invisible.
- The banner itself is one of the few React islands the project allows ([ADR 0009](./0009-css-first-javascript-only-when-necessary.md)); the consent default it depends on is plain inline script, and has to stay that way to run early enough.
