# src/actions

One Astro server action, `server.contact`, split across a handful of files. [`contact.ts`](./contact.ts) holds `submitContact`, the
Effect program that orchestrates the submission; [`errorResponse.ts`](./errorResponse.ts) holds `contactErrorResponse`, which turns a
failed `Cause` into the `{ code, message }` the visitor gets; [`index.ts`](./index.ts) holds the Astro binding and nothing
else: `defineAction`, `accept: "form"`, `contactFormSchema` (`@domain/contact/schema`) validating the payload
before the handler body runs, `ContactLayer`, provided per request, and the `new ActionError(…)` throw. Every step is imported from
`@infrastructure/utils/*` and every one of them is an Effect, so nothing
here talks to the database, Resend or reCAPTCHA directly. ADR 0004 records why the Effect world is sealed at
this edge and nowhere deeper.

**The split is what makes the action testable.** `contact.ts` and `errorResponse.ts` import nothing from
`astro:*`, so `submitContact` runs in a unit test against stub `Database`, `EmailClient` and `LoggerService` layers (see
[`contact.test.ts`](./contact.test.ts) and the doubles in [`src/tests/doubles/`](../tests/doubles)), and **so a unit test can run the mapping** over real
`Cause` values, defects included ([`errorResponse.test.ts`](./errorResponse.test.ts)). The one `astro:*` module the program reaches
is `astro:env/server`, lazily imported inside `verifyRecaptcha`, and [`vitest.config.ts`](../../vitest.config.ts) maps it onto a double.
Keep `astro:actions` out of both: the moment either imports `ActionError`, it stops resolving under vitest,
which is why the code stays a plain `{ code, message }` and only `index.ts` knows it becomes an `ActionError`.

## Invariants

- **`contactErrorResponse` is the only place a tagged error becomes HTTP.** Exactly these are mapped:
  `ValidationError` → `BAD_REQUEST` and `DuplicateContactError` → `UNAUTHORIZED`. Everything else
  (`EmailError`, `DatabaseError`, `RecaptchaError`, and any defect) logs `Cause.pretty(cause)` through
  `LoggerService` and collapses into one generic `INTERNAL_SERVER_ERROR` message. **Adding a tagged error in
  `@infrastructure/errors` without adding a case here silently degrades it to that generic message**:
  `errorResponse.test.ts` keys its census off `ContactError["_tag"]`, so widening that union without answering
  the new tag fails the type check rather than review. For the unmapped tags that answer is the decision, not
  the default: their copy names our infrastructure, so the switch has only the mapped cases above and no
  `INTERNAL_SERVER_ERROR` literal beyond the catch-all's. The generic copy is one module-level constant in
  `errorResponse.ts`; the copy of the two mapped tags is written where each is raised.
- **`UNAUTHORIZED` is the status the form reacts to, which is why it is not a conflict code.** [`ContactForm.tsx`](../ui/modules/contact/components/contactForm/ContactForm.tsx)
  keys `FormStatus.UNAUTHORIZED` off a 401 (the status the action's error carries, forwarded verbatim by
  `toContactSubmission` in `@modules/contact/utils/submission`), and that state disables every input and the
  submit button: the visitor is locked out rather than invited to retry. Answering `409` instead would leave the form
  live and the mapping silent, so this pair only makes sense read together.
- **`checkDuplicateContact` is the only thing that raises `DuplicateContactError`, and the database cannot.**
  `contact.email` carries a plain index rather than a unique constraint (`Contact_email_createdDate_idx`,
  over email and date, which is what the cooldown query reads), and `saveContact` declares `DatabaseError`
  alone. So two submissions for the same address that race past the check do not collide: both mails go out,
  both visitors are answered `ok`, and two rows are written. By the time the second insert happens the loser's
  message *has* been delivered, so answering "you already contacted" would be false, and the next submission
  from that address is inside the cooldown and refused normally. A unique constraint would not reach the
  `UNAUTHORIZED` path either: `submitContact` logs and swallows every failure of that step.
- **The answer is decided inside the Effect and thrown outside it.** `Effect.matchCauseEffect` folds both
  outcomes into an Effect of a plain `{ success, value | error }` union, `Effect.runPromise` resolves it, and
  only then does the handler `throw new ActionError(result.error)`. It has to be the `Effect` variant of the
  combinator, not `Effect.matchCause`: `contactErrorResponse` logs, so the failure branch must return an Effect
  for that log to be part of the program. Never throw an `ActionError` from inside the program: it would
  arrive as a defect, `Cause.failureOption` would find no failure, and the mapping would be lost. That last
  sentence is a test: `errorResponse.test.ts` dies with a `ValidationError` and asserts the generic 500.
- **Step order is load-bearing**: validate → verify reCAPTCHA → duplicate check → send email → save. The reCAPTCHA check runs *after* schema validation, so a malformed payload is rejected without
  spending a verification call. The email goes out **before** the row is written because the row stores the
  Resend `emailId`, so that order cannot simply be swapped.
- **A failed `saveContact` is logged, not raised.** Once the mail is away the visitor's message has reached
  Bianca; the row is bookkeeping for duplicate detection, not the deliverable. Failing the request there
  would show a 500 for work that actually succeeded and invite a retry that passes the duplicate check
  (because no row exists) and mails Bianca a second time. So `Effect.catchAll` takes every failure of that
  step, logs it with the `emailId` through `logger.logError`, and the action still answers `ok`. The cost is
  accepted and narrow: a dropped row means that address can contact again without being told it already did.
- **The payload is validated twice, on purpose.** `defineAction`'s `input` validates at the edge, and
  `validateContact` re-runs the same schema (minus `recaptcha`) inside the program, which is what makes
  `submitContact` self-sufficient enough to unit-test. The two are not interchangeable: `submitContact`
  destructures `recaptcha` out before validating, so the edge schema is the only thing rejecting an empty
  token, and dropping `input` from `defineAction` would send it to Google instead.
- **The email field trims before it validates**: `z.string().trim().pipe(z.email())`, not `z.email().trim()`.
  Zod applies `.trim()` in chain order, so validating first rejects any address pasted with a surrounding
  space and leaves the trim dead. Reordering those calls fails no type check, only the tests that submit a
  padded address.
- **Two forms of the address are in flight on purpose, and producing neither is this file's job.** Every step
  that takes the address is handed the same **validated** data; `normalizeEmail` (`@domain/contact/rules`) trims, lowercases and
  strips the `+alias` segment, and `checkDuplicateContact` and `saveContact` each call it on their own way to
  the database, so `a+anything@d.com` and `a@d.com` are treated as the same person. `sendEmail` does not, so
  the reply goes to the address as it was typed: alias and capitalisation intact, surrounding whitespace
  aside. Normalizing here, before the steps, would break alias delivery; dropping either call inside them
  would break duplicate detection.
