# 4. Effect for CMS, DB and email clients

Date: 2026-07-26

## Status

Accepted.

## Context

Error handling across the CMS, database and email calls was ad-hoc `try/catch` with thrown errors, which types nothing and composes badly — the contact flow alone chains validation, reCAPTCHA, a duplicate check, an email send and an insert, each of which fails differently and needs a different answer to the user.

## Decision

Effect was adopted to turn those thrown errors into typed, composable failure channels (`Data.TaggedError`), and grew into full dependency injection (`Context.Tag` + `Layer.effect`) across the three clients, with the contact action composing them in an `Effect.gen` pipeline. A deliberately heavy choice for a portfolio site, it earns its keep on the one non-trivial flow (validate → recaptcha → dedupe → send → persist).

## Consequences

- Two runtime shapes: read paths use a long-lived `ManagedRuntime` (`runCms`) while the contact action provides a per-request `ContactLayer` (DB + email merged).
- The Effect world is sealed at the action edge: `Cause` is mapped to Astro's `ActionError` (`toActionError`), so tagged failures like `ValidationError`/`DuplicateContactError` become client-facing codes and everything else collapses to a generic 500.
- DTOs are intentionally left plain (no Effect types) so UI and content code never depend on Effect.
- Anyone touching `src/infrastructure` has to know Effect, which is the standing cost of this decision.
