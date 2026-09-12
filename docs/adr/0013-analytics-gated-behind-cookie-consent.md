# 13. Analytics gated behind cookie consent

Date: 2026-07-26

## Status

Accepted. Amended 2026-09-12: Better Stack's browser tag joined Google Analytics behind the same category, and it is gated a *different* way, for the reason the Decision now records.

## Context

The site serves EU visitors and loads Google Analytics / Tag Manager. Consent Mode's default, if nothing intervenes, is to collect first and ask later, which is simpler and non-compliant. The requirement is legal rather than technical, so nothing in the code makes it visible: a well-meaning change that moves the GA snippet earlier, or drops the inline script as dead weight, breaks compliance without breaking anything observable.

## Decision

Analytics load with consent denied by default. An inline script in `<head>` reads the `cc_cookie` written by vanilla-cookieconsent and calls `gtag('consent', 'default', { analytics_storage })`, set to `granted` only if the visitor accepted the `analytics` category, before GA/GTM initialise.

**What that script is, and what "the analytics category" means, is one module**: `cookieConsent/utils/consentGate.ts` declares `ANALYTICS_CATEGORY`, `CONSENT_COOKIE_NAME` and `CONSENT_STATUS`, and `consentBootstrapScript` builds the render-blocking script from those same constants rather than from literals, exactly as `THEME_BOOTSTRAP_SCRIPT` does for the theme ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)). It used to be a scatter of literals in different shapes across several files, one of them the vendor's private storage format written out longhand in an Astro template. And `updatePreferences` asked whether the *first* accepted category was accepted, which is true for any non-empty list: it answered correctly only because the preferences modal happens to give `necessary` no section, so nothing but `analytics` can ever reach that array. It asks about `ANALYTICS_CATEGORY` by name now.

**Better Stack's tag has no consent mode, so it is gated by not existing.** Google's snippet loads on every page and is told what it may store; the Better Stack tag is appended to `<head>` only once `acceptedService("betterstack", "analytics")` answers true, from `updatePreferences`, which `config.ts` calls on `onConsent` and `onChange`. **`onConsent` replaced `onFirstConsent`**, and that is the load-bearing half: `onFirstConsent` fires the one time the answer is first given, so a returning visitor who had already accepted would get no tag at all. `onConsent` fires on that first answer *and* on every later page load that finds a stored one, which is why dropping `onFirstConsent` loses nothing and keeping both would have run the gtag update twice per load. `getTelemetry()` loads it at most once per page whatever fires. The token is public by construction, since it ships in the browser bundle, and it is **not** the credential the log export uses: that one lives on the Cloudflare destination and never enters this tree ([ADR 0020](./0020-logs-and-traces-leave-through-cloudflares-export.md)).

## Consequences

- The ordering is load-bearing: the consent default has to be set before GA/GTM initialise, so this script stays inline and stays first ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md) puts the theme bootstrap in the same position for the same reason).
- Analytics under-report by design; visitors who never accept are invisible.
- **Adding a service to a category is a `revision` bump, or returning visitors never see it.** vanilla-cookieconsent
  stores the accepted *services* in `cc_cookie` and defaults `revision` to `0`. A visitor who accepted before a
  service existed carries a cookie that does not list it, so `acceptedService` answers false for that visitor
  forever and the banner never asks again: the tag simply never loads, with nothing anywhere saying why. Introducing
  `betterstack` is what made this concrete, and `CONSENT_REVISION` in `consentGate.ts` is now the one place that
  number lives. **Bump it in the same commit that adds or removes a service**, which re-prompts everyone once.
- **One Better Stack source serves both stages, and the `environment` attribute is what keeps them apart.**
  `BETTER_STACK_TRACKING_TOKEN` is a **repository** variable rather than an environment one, so preview and
  production send to the same source; `loadBetterStack` passes `init` an `environment` derived from the hostname
  (`localhost`, `127.0.0.1` and anything under `.workers.dev` are `development`). Delete that argument and preview
  traffic merges into the live numbers with nothing to separate it, which is why `telemetry.test.ts` pins both the
  attribute and the hostname rule. This deliberately differs from the log and trace export, which splits by
  *destination* per stage ([ADR 0020](./0020-logs-and-traces-leave-through-cloudflares-export.md)): that one has no
  attribute to split on, since a Worker cannot tell the export which stage it is.
- **Cloudflare Web Analytics is the stated exception, and it is outside this decision's reach.** The zone injects
  `static.cloudflareinsights.com/beacon.min.js` into the HTML at the edge, before anything in this tree runs, so no
  banner can gate it: the only switch is the Cloudflare dashboard. It is kept deliberately. It sets no cookies and
  identifies nobody, the privacy policy names it and says why the banner does not cover it, and `securityHeaders.ts`
  has to allow its origin or the browser blocks it with a console error and nothing else. Anything that *can* be
  gated still is.
- **Two mechanisms for two vendors is the cost, and it is not avoidable.** Consent Mode exists because Google built it; a vendor without it can only be gated by withholding its script. Do not "unify" them by moving GA behind the same switch: that would delete the consent default whose ordering the first consequence calls load-bearing.
- The `betterstack` service and its `bs_` cookies are declared in the same `analytics` category, so rejecting the category clears them and the preferences modal lists both vendors by name.
- The banner itself is one of the few React islands the project allows ([ADR 0009](./0009-css-first-javascript-only-when-necessary.md)); the consent default it depends on is plain inline script, and has to stay that way to run early enough.
