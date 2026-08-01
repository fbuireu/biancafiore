# src/actions

One Astro server action, `server.contact`, split across two files. `contact.ts` holds `submitContact`, the
Effect program that orchestrates the submission; `index.ts` holds the Astro binding — `defineAction`,
`accept: "form"`, `contactFormSchema` (`@domain/contact/schema`) validating the payload before the handler body
runs, `ContactLayer`, and the error mapping. Every step is imported from `@infrastructure/utils/*` — all
Effects except `normalizeEmail`, a plain function called inline — so nothing here talks to the database, Resend
or reCAPTCHA directly. ADR 0004 records why the Effect world is sealed at this edge and nowhere deeper.

**The split is what makes the action testable.** `contact.ts` imports nothing from `astro:*`, so
`submitContact` runs in a unit test against stub `Database` and `EmailClient` layers — see `contact.test.ts`
and the doubles in `testing/doubles/`. The one `astro:*` module the program still reaches is `astro:env/server`,
lazily imported inside `verifyRecaptcha`, and `vitest.config.ts` maps it onto a double. Keep `astro:actions` out
of `contact.ts`: the moment it imports `ActionError`, the program stops resolving under vitest.

## Invariants & rules

- **`ContactLayer` is provided here, per request** — `Effect.provide(ContactLayer)` inside the handler, never
  at module scope. Contact writes are per-request; the long-lived `ManagedRuntime` in
  `@infrastructure/runtime` is for CMS reads only. Don't collapse the two.
- **`toActionError` is the only place a tagged error becomes HTTP.** Exactly two are mapped:
  `ValidationError` → `BAD_REQUEST` and `DuplicateContactError` → `UNAUTHORIZED`. Everything else —
  `EmailError`, `DatabaseError`, and any defect — logs `Cause.pretty(cause)` through `Effect.logError` and
  collapses into one generic `INTERNAL_SERVER_ERROR` message. **Adding a tagged error in
  `@infrastructure/errors` without adding a case here silently degrades it to that generic message**, which is
  the failure mode to watch for.
- **`UNAUTHORIZED` is the status the form reacts to, which is why it is not a conflict code.** `ContactForm.tsx`
  keys `FormStatus.UNAUTHORIZED` off `error.status === 401`, and that state disables every input and the submit
  button — the visitor is locked out rather than invited to retry. Answering `409` instead would leave the form
  live and the mapping silent, so this pair only makes sense read together.
- **Only `checkDuplicatedEntries` raises `DuplicateContactError` anywhere the visitor can see it.** The unique
  constraint on `contact.email` produces one too, from `saveContact`, when two submissions for the same
  address race past that check — but by then both mails are away, and the catch-all below takes every failure
  of that step, this one included. So the race ends like this: both visitors are answered `ok`, Bianca
  receives two mails, and one row is missing, the loser's insert having been logged rather than raised. That
  is the intended answer, not an oversight to tighten later — the loser's message *was* delivered, so
  answering "you already contacted" would be false as well as confusing. The catch-all stays broad, and the
  `UNAUTHORIZED` path is therefore unreachable from `saveContact`. `isUniqueConstraintViolation` unwrapping
  drizzle's error still earns its keep, but over the log line and `saveContact`'s declared failure type rather
  than over anything the visitor sees; `src/infrastructure/CLAUDE.md` carries that reasoning.
- **The error is converted inside the Effect and thrown outside it.** `Effect.matchCauseEffect` folds both
  outcomes into an Effect of a plain `{ success, value | error }` union, `Effect.runPromise` resolves it, and
  only then does the handler `throw result.error`. It has to be the `Effect` variant of the combinator, not
  `Effect.matchCause`: `toActionError` logs, so the failure branch must return an Effect for that log to be
  part of the program. Never throw an `ActionError` from inside the program — it would arrive as a defect,
  `Cause.failureOption` would find no failure, and the mapping would be lost.
- **Step order is load-bearing**: validate → verify reCAPTCHA → normalize → duplicate check → send email →
  save. The reCAPTCHA check runs *after* schema validation, so a malformed payload is rejected without
  spending a verification call. The email goes out **before** the row is written because the row stores the
  Resend `emailId`, so that order cannot simply be swapped.
- **A failed `saveContact` is logged, not raised.** Once the mail is away the visitor's message has reached
  Bianca; the row is bookkeeping for duplicate detection, not the deliverable. Failing the request there
  would show a 500 for work that actually succeeded and invite a retry that passes the duplicate check —
  because no row exists — and mails Bianca a second time. So `Effect.catchAll` takes every failure of that
  step, logs it with the `emailId` through `Effect.logError`, and the action still answers `ok`. The cost is
  accepted and narrow: a dropped row means that address can contact again without being told it already did.
- **Nothing here calls `console`.** Both log sites go through Effect's `Logger`. Biome's `noConsole` runs with
  no allowlist, so a `console.error` added back fails the lint rather than review.
- **The payload is validated twice, on purpose.** `defineAction`'s `input` validates at the edge, and
  `validateContact` re-runs the same schema — minus `recaptcha` — inside the program, which is what makes
  `submitContact` self-sufficient enough to unit-test. The two are not interchangeable: `submitContact`
  destructures `recaptcha` out before validating, so the edge schema is the only thing rejecting an empty
  token, and dropping `input` from `defineAction` would send it to Google instead.
- **The email field trims before it validates** — `z.string().trim().pipe(z.email())`, not `z.email().trim()`.
  Zod applies `.trim()` in chain order, so validating first rejects any address pasted with a surrounding
  space and leaves the trim dead. Reordering those calls reintroduces that bug without failing a type check.
- **Two forms of the address are in flight on purpose.** `normalizeEmail` trims, lowercases and strips the
  `+alias` segment; the normalized form is what `checkDuplicatedEntries` and `saveContact` use, so
  `a+anything@d.com` and `a@d.com` are treated as the same person. `sendEmail` is handed the **validated**
  data, so the reply goes to the address as it was typed — alias and capitalisation intact, surrounding
  whitespace aside. Passing `normalizedData` to `sendEmail` would break alias delivery; passing `data` to
  `saveContact` would break duplicate detection.
- The generic copy lives in one module-level constant — but only that one. The copy for the two mapped tags is
  written where each error is raised: the `ValidationError` text in the zod messages of
  `@domain/contact/schema`, joined by `validateContact`, and in `guards.ts` for the reCAPTCHA rejection; the
  `DuplicateContactError` text in `persistence.ts`. `toActionError` forwards `failure.value.message` verbatim,
  so those strings reach the visitor unchanged. The layers below stay tagged; they are not language-free.
