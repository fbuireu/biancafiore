# 13. Analytics gated behind cookie consent

Date: 2026-07-26

## Status

Accepted.

## Context

The site serves EU visitors and loads Google Analytics / Tag Manager. Consent Mode's default, if nothing intervenes, is to collect first and ask later, which is simpler and non-compliant. The requirement is legal rather than technical, so nothing in the code makes it visible: a well-meaning change that moves the GA snippet earlier, or drops the inline script as dead weight, breaks compliance without breaking anything observable.

## Decision

Analytics load with consent denied by default. An inline script in `<head>` reads the `cc_cookie` written by vanilla-cookieconsent and calls `gtag('consent', 'default', { analytics_storage })`, set to `granted` only if the visitor accepted the `analytics` category, before GA/GTM initialise.

## Consequences

- The ordering is load-bearing: the consent default has to be set before GA/GTM initialise, so this script stays inline and stays first (ADR 0005 puts the theme bootstrap in the same position for the same reason).
- Analytics under-report by design; visitors who never accept are invisible.
- The banner itself is one of the few React islands the project allows (ADR 0009); the consent default it depends on is plain inline script, and has to stay that way to run early enough.
