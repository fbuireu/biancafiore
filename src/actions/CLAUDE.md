# src/actions

One Astro server action, `server.contact`, split across three files. `contact.ts` holds `submitContact`, the
Effect program that orchestrates the submission; `errorResponse.ts` holds `contactErrorResponse`, which turns a
failed `Cause` into the `{ code, message }` the visitor gets; `index.ts` holds the Astro binding and nothing
else — `defineAction`, `accept: "form"`, `contactFormSchema` (`@domain/contact/schema`) validating the payload
before the handler body runs, `ContactLayer`, and the `new ActionError(…)` throw. Every step is imported from
`@infrastructure/utils/*` and every one of them is an Effect, so nothing here talks to the database, Resend or
reCAPTCHA directly. ADR 0004 records why the Effect world is sealed at
this edge and nowhere deeper.

**The split is what makes the action testable.** `contact.ts` and `errorResponse.ts` import nothing from
`astro:*`, so `submitContact` runs in a unit test against stub `Database` and `EmailClient` layers — see
`contact.test.ts` and the doubles in `src/tests/doubles/` — and **so a unit test can run the mapping** over real
`Cause` values, defects included (`errorResponse.test.ts`). The one `astro:*` module the program still reaches
is `astro:env/server`, lazily imported inside `verifyRecaptcha`, and `vitest.config.ts` maps it onto a double.
Keep `astro:actions` out of both: the moment either imports `ActionError`, it stops resolving under vitest —
which is why the code stays a plain `{ code, message }` and only `index.ts` knows it becomes an `ActionError`.

## Invariants & rules

- **`ContactLayer` is provided here, per request** — `Effect.provide(ContactLayer)` inside the handler, never
  at module scope. Why there are two runtimes rather than one is ADR 0004 and `src/infrastructure/CLAUDE.md`;
  what belongs here is only that this one is built and discarded per request.
- **`contactErrorResponse` is the only place a tagged error becomes HTTP.** Exactly two are mapped:
  `ValidationError` → `BAD_REQUEST` and `DuplicateContactError` → `UNAUTHORIZED`. Everything else —
  `EmailError`, `DatabaseError`, `RecaptchaError`, and any defect — logs `Cause.pretty(cause)` through
  `Effect.logError` and collapses into one generic `INTERNAL_SERVER_ERROR` message. **Adding a tagged error in
  `@infrastructure/errors` without adding a case here silently degrades it to that generic message**, which is
  the failure mode to watch for — `errorResponse.test.ts` keys its census off `ContactError["_tag"]`, so
  widening that union without answering the new tag fails the type check rather than review. For the three
  unmapped tags that answer is the decision, not the default: their copy names our infrastructure, so the
  switch is deliberately left with two cases and no `INTERNAL_SERVER_ERROR` literal beyond the catch-all's.
- **`UNAUTHORIZED` is the status the form reacts to, which is why it is not a conflict code.** `ContactForm.tsx`
  keys `FormStatus.UNAUTHORIZED` off a 401 — the status the action's error carries, forwarded verbatim by
  `toContactSubmission` in `@modules/contact/utils/submission` — and that state disables every input and the
  submit button — the visitor is locked out rather than invited to retry. Answering `409` instead would leave the form
  live and the mapping silent, so this pair only makes sense read together.
- **Only `checkDuplicatedEntries` raises `DuplicateContactError` anywhere the visitor can see it.**
  `saveContact` can raise one too, when two submissions for the same address race past that check, but the
  catch-all below swallows it: both visitors are answered `ok`, and the loser loses only its row. That is the
  intended answer, not an oversight to tighten later — the loser's message *was* delivered, so answering "you
  already contacted" would be false as well as confusing. The `UNAUTHORIZED` path is therefore unreachable
  from `saveContact`. Why that arm still earns its keep is `src/infrastructure/CLAUDE.md`, under
  `persistence.ts`.
- **The answer is decided inside the Effect and thrown outside it.** `Effect.matchCauseEffect` folds both
  outcomes into an Effect of a plain `{ success, value | error }` union, `Effect.runPromise` resolves it, and
  only then does the handler `throw new ActionError(result.error)`. It has to be the `Effect` variant of the
  combinator, not `Effect.matchCause`: `contactErrorResponse` logs, so the failure branch must return an Effect
  for that log to be part of the program. Never throw an `ActionError` from inside the program — it would
  arrive as a defect, `Cause.failureOption` would find no failure, and the mapping would be lost. That last
  sentence is a test: `errorResponse.test.ts` dies with a `ValidationError` and asserts the generic 500.
- **Step order is load-bearing**: validate → verify reCAPTCHA → duplicate check → send email → save. The
  reCAPTCHA check runs *after* schema validation, so a malformed payload is rejected without spending a
  verification call. The email goes out **before** the row is written because the row stores the Resend
  `emailId`, so that order cannot simply be swapped.
- **A refused reCAPTCHA is two different answers**, and which one it is decides what the visitor reads: a
  `ValidationError` reaches them as the bot copy behind a `BAD_REQUEST`, a `RecaptchaError` takes the
  catch-all and reaches them as the generic 500. Which siteverify outcome produces which is `guards.ts`, and
  `src/infrastructure/CLAUDE.md` states the rule for keeping new `error-codes` on the right side.
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
- **Two forms of the address are in flight on purpose, and this file is not what keeps them apart.**
  `normalizeEmail` (`@domain/contact/rules`) trims, lowercases and strips the `+alias` segment, so
  `a+anything@d.com` and `a@d.com` are one person; the address as typed is what the reply has to reach.
  `submitContact` therefore hands every step the same validated `data` and normalises nowhere:
  `checkDuplicatedEntries` and `saveContact` normalise on the way in, because the normalised form is *their*
  requirement, and `persistence.test.ts` asserts each of them does. It used to be the orchestrator that built
  a second record and chose which step got which, where both were the same TypeScript type and swapping them
  type-checked — one assertion in `contact.test.ts` stood between the code and silently mailing the wrong
  address.
- The generic 500 copy lives in one module-level constant in `errorResponse.ts`, and it is the only string
  this folder writes for a visitor. The copy for the two mapped tags is written where each error is raised:
  the `ValidationError` text in the zod messages of `@domain/contact/schema`, joined by `validateContact`, and
  in `guards.ts` for the reCAPTCHA rejection; the `DuplicateContactError` text in `persistence.ts`.
  `contactErrorResponse` forwards `failure.value.message` verbatim, so those strings reach the visitor
  unchanged. The layers below stay tagged; they are not language-free. The bot line is the one piece of copy
  two layers both need, so it is declared once as `BOT_REFUSAL_MESSAGE` in `@domain/contact/schema` and read
  by the zod message, by `guards.ts` and by the form's own missing-token branch. A separate
  `UNDELIVERED_MESSAGE` lives in `@modules/contact/utils/submission`; it is not this constant's twin but the
  answer to a different failure, the request never arriving, which no server-side error can describe.
