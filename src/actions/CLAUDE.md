# src/actions

One Astro server action, `server.contact`, and nothing else. `accept: "form"`, with `contactFormSchema`
(`@domain/contact/schema`) validating the input before the handler body runs. The handler is pure
orchestration: every step is an Effect program from `@infrastructure/utils/*`, so nothing here talks to the
database, Resend or reCAPTCHA directly. See ADR 0012 for why the layer boundary sits where it does.

## Invariants & rules

- **`ContactLayer` is provided here, per request** — `Effect.provide(ContactLayer)` inside the handler, never
  at module scope. Contact writes are per-request; the long-lived `ManagedRuntime` in
  `@infrastructure/runtime` is for CMS reads only. Don't collapse the two.
- **`toActionError` is the only place a tagged error becomes HTTP.** Exactly two are mapped:
  `ValidationError` → `BAD_REQUEST` and `DuplicateContactError` → `UNAUTHORIZED`. Everything else —
  `EmailError`, `DatabaseError`, and any defect — logs `Cause.pretty(cause)` via `Effect.logError` and collapses into one generic
  `INTERNAL_SERVER_ERROR` message. **Adding a tagged error in `@infrastructure/errors` without adding a case
  here silently degrades it to that generic message**, which is the failure mode to watch for.
- `DuplicateContactError` answering `UNAUTHORIZED` rather than a conflict status is deliberate: the form must
  not confirm to a stranger that an address is already on file.
- **The error is converted inside the Effect and thrown outside it.** `Effect.matchCause` turns both outcomes
  into a plain `{ success, value | error }` union, and only then does the handler `throw result.error`. Never
  throw an `ActionError` from inside the program — it would arrive as a defect and lose its mapping.
- **Step order is load-bearing**: validate → verify reCAPTCHA → normalize → duplicate check → send email →
  save. The reCAPTCHA check runs *after* schema validation, so a malformed payload is rejected without
  spending a verification call. The email goes out **before** the row is written because the row stores the
  Resend `emailId`, so that order cannot simply be swapped.
- **A failed `saveContact` is logged, not raised.** Once the mail is away the visitor's message has reached
  Bianca; the row is bookkeeping for duplicate detection, not the deliverable. Failing the request there
  would show a 500 for work that actually succeeded and invite a retry that passes the duplicate check —
  because no row exists — and mails Bianca a second time. So it is caught, logged with the `emailId` through
  `Effect.logError`, and the action still answers `ok`. The cost is accepted and narrow: a dropped row means
  that address can contact again without being told it already did.
- **Nothing here calls `console`.** Both log sites go through Effect's `Logger`, which is why the mapping runs
  under `Effect.matchCauseEffect` rather than `Effect.matchCause` — the handler has to return an Effect for
  the log to be part of the program. Biome's `noConsole` runs with no allowlist, so a `console.error` added
  back fails the lint rather than review.
- **Two forms of the address are in flight on purpose.** `normalizeEmail` trims, lowercases and strips the
  `+alias` segment; the normalized form is what `checkDuplicatedEntries` and `saveContact` use, so
  `a+anything@d.com` and `a@d.com` are treated as the same person. `sendEmail` is handed the **raw** validated
  data, so the reply reaches the address exactly as it was typed. Passing `normalizedData` to `sendEmail`
  would break alias delivery; passing `data` to `saveContact` would break duplicate detection.
- The generic copy lives in one module-level constant — but only that one. The messages for the two mapped
  tags are written where the error is raised, in `@infrastructure/utils`, and `toActionError` forwards
  `failure.value.message` verbatim, so those strings reach the visitor unchanged. The layers below stay
  tagged; they are not language-free.
