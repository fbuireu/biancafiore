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
  `EmailError`, `DatabaseError`, and any defect — logs `Cause.pretty(cause)` and collapses into one generic
  `INTERNAL_SERVER_ERROR` message. **Adding a tagged error in `@infrastructure/errors` without adding a case
  here silently degrades it to that generic message**, which is the failure mode to watch for.
- `DuplicateContactError` answering `UNAUTHORIZED` rather than a conflict status is deliberate: the form must
  not confirm to a stranger that an address is already on file.
- **The error is converted inside the Effect and thrown outside it.** `Effect.matchCause` turns both outcomes
  into a plain `{ success, value | error }` union, and only then does the handler `throw result.error`. Never
  throw an `ActionError` from inside the program — it would arrive as a defect and lose its mapping.
- **Step order is load-bearing**: validate → verify reCAPTCHA → normalize → duplicate check → send email →
  save. Two consequences worth knowing before reordering it. The reCAPTCHA check runs *after* schema
  validation, so a malformed payload is rejected without spending a verification call. And the email goes out
  **before** the row is written, so a `saveContact` failure leaves a visitor who has already had a reply with
  nothing persisted — the generic 500 they see is accurate but the mail is not recallable.
- **Two forms of the address are in flight on purpose.** `normalizeEmail` trims, lowercases and strips the
  `+alias` segment; the normalized form is what `checkDuplicatedEntries` and `saveContact` use, so
  `a+anything@d.com` and `a@d.com` are treated as the same person. `sendEmail` is handed the **raw** validated
  data, so the reply reaches the address exactly as it was typed. Passing `normalizedData` to `sendEmail`
  would break alias delivery; passing `data` to `saveContact` would break duplicate detection.
- The generic copy lives in one module-level constant. Keep user-facing failure text here, not in
  `@infrastructure` — the layers below stay tagged and language-free.
