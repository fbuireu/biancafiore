# 20. Logs and traces leave through Cloudflare's export, and `console` is the transport

Date: 2026-09-12

## Status

Accepted

## Context

Nothing outside Cloudflare ever saw a log from this site. `[observability]` was on, so Workers Logs held the lines
for the dashboard's retention window and no longer, `[observability.traces]` was on with no sampling rate written
down, and an error that happened at three in the morning was gone before anyone looked. The contact action already
logs, and ADR 0004 makes Effect how this tree talks to anything outside it, so the question was never whether to log
but where the lines go.

Both sibling repositories answered it twice, and the second answer is the one worth copying. Each first built a
**tail consumer Worker** that flattened every tail event and posted it to Better Stack; each has since deleted it,
because `[observability]` now declares `destinations`, an array of names pointing at an OTLP endpoint and its bearer
token configured in the Cloudflare dashboard. The platform exports what the tail Worker was re-implementing, and it
adds the field that Worker structurally could not produce: **the trace id of the span a line was emitted under**,
since a tail consumer never receives spans at all.

The second half of their answer is what makes that stamp reach application code. The export sees `console` output
and uncaught exceptions. A log call that posts to a sink over HTTP from inside the Worker is invisible to the
runtime, so its lines arrive with an empty trace id and sit beside the spans they belong to without joining them.
Writing the line to `console` hands the runtime something it can attribute.

What is left is this repository's own question: Effect is here and is not in one of them, so the `logger` object
could be reached directly, or through a `Context.Tag`. Reaching it directly is cheaper at every call site and in
every test. The tag buys one property a module import cannot: a program that logs carries `LoggerService` in its
`R`, so an **explicitly annotated** return type turns an unintended log into a compile error at the function that
introduced it. An inferred `R` widens and gets nothing, which makes the annotation load-bearing rather than
stylistic.

## Decision

**`wrangler.toml` names an export destination per stage, and `console` carries the app's own lines to it.**

The top level and both `[env.*]` blocks each declare `enabled`, `redact_query_string = true`,
`head_sampling_rate = 1` and their own pair of destinations, `biancafiore-web-<stage>-logs` and
`biancafiore-web-<stage>-traces`, the `<repo>-<package>-<stage>-<signal>` shape both siblings use. The top level is
production's twin, block for block, so a bare `wrangler deploy` cannot reach the development source.

[`src/infrastructure/logging/contract.ts`](../../src/infrastructure/logging/contract.ts) and
[`logger.ts`](../../src/infrastructure/logging/logger.ts) are **byte for byte what the siblings carry**, bar
`LOG_SERVICE` and the alias this tree's import convention wants. One `write` serialises the context, the service, the level and the message, and hands it to
`console[level]`. The spread order is load-bearing: context first, so a caller cannot relabel its own line, which
was a real bug in forever-pto before it was a rule anywhere.

[`service.ts`](../../src/infrastructure/logging/service.ts) is this repository's seam:
`Layer.sync(LoggerService, () => logger)`, merged into `ContactLayer`. Every Effect program that logs takes
`LoggerService` in `R` and annotates its return type. Code with no layer to provide one, `500.astro` whose
frontmatter has no runtime and `getImagePlaceholders` which runs inside `astro build`, imports the same object
directly.

The rejected alternatives are a tail consumer Worker, which both siblings deleted, and reaching `logger` directly
everywhere, which would delete the compile-time signal with nothing to replace it.

## Consequences

- **The destination names are settings that must exist before a deploy**, created in the account's Workers
  Observability section with the Better Stack endpoint and token. Nothing in this tree can assert that they exist,
  and a `destinations` entry naming one that does not is the failure to remember.
- **Rotating the log sink is a dashboard change**, not a deploy. No credential for it appears anywhere in this
  tree, which is why `docs/docs-consistency.test.ts` asserts that the only credential-shaped Better Stack name in
  `src`, `.env.example` and `astro.config.ts` is `BETTER_STACK_TRACKING_TOKEN` — the **browser** tag's token, which
  is public by construction and belongs to [ADR 0013](./0013-analytics-gated-behind-cookie-consent.md) rather than
  to this one. The export's endpoint and bearer token are a different pair and live on the Cloudflare destination.
- **A destination belongs to the account, not to the Worker**, so these names share one namespace with every other
  Worker on it. The stage is in the name because a destination has no environment of its own: a development Worker
  naming production's is accepted, exports happily, and files preview traffic with the live site's, where only
  `script` tells them apart. The docs test asserts the split, because nothing else can.
- **Sampling is `1`, which is what both siblings settled on**, forever-pto after a spell at `0.2`. The rate is the
  one setting here that loses data with no symptom. Revisit it if the volume ever costs something, and revisit it in
  all three at once.
- **The structured fields are parsed by the sink rather than received as fields**, because the line is serialised
  here. If a field stops being queryable, the answer is the sink's parsing rather than the caller.
- **A log call cannot fail its caller.** The guarantee belongs to the `try` around `JSON.stringify`, which throws on
  a circular reference or a `BigInt`. A caller passing either loses the line instead of taking down a request.
- **`console` is the transport, so the `noConsole` exemption is structural rather than a concession.** `biome.json`
  scopes it to `logger.ts` and nothing else, exactly as both siblings do, and it must not widen.
- **`redacted` and `redact_query_string` are not the same control.** The wrangler setting redacts the *request* URL
  Cloudflare itself records; `redacted` strips the query off a `url` field a **caller** puts in a log context. Both
  stay.
- **Effect's own `Logger` is now unused here**, and `Effect.logError` / `Effect.logInfo` should not come back: they
  write through a logger nothing configures, so their lines would reach the export in Effect's shape rather than the
  shared one.
- **Build-time logs reach no sink and that is fine.** `fetchEntries` and `getImagePlaceholders` run inside
  `astro build`, printing into the build output for a person to read in a CI run.
- **Application tracing stays out of scope.** `[observability.traces]` records Cloudflare's own spans, and
  `Effect.withSpan` cannot be bridged onto the runtime's tracer: `Tracer.Span` needs `traceId`, `spanId` and
  `sampled` synchronously, and Cloudflare documents `spanContext()` as not yet available, which forever-pto measured
  when it deleted its OpenTelemetry wrapper. The join that matters is the one the export produces on its own.
