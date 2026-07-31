# 17. Doubles sit at the seam the architecture already declares

Date: 2026-07-31

## Status

Accepted.

## Context

Nothing outside the process may be reached from a test: Contentful, Turso, Resend and Google all cost money, latency or an email to a real person. Something has to stand in for them, and the question is *where* the substitution happens.

This codebase reaches the outside world in two different shapes, and they are not alike.

Most of it goes through a vendor SDK wrapped in an Effect layer — `CmsClient`, `Database`, `EmailClient`. ADR 0004 chose that shape precisely so the dependency is injected rather than imported, which means a test can hand the program a different layer and nothing else has to know.

Two call sites do not. `verifyRecaptcha` posts to Google's siteverify endpoint and `getImagePlaceholder` fetches an image derivative, both with a bare `fetch`. There is no seam there at all: the URL, the method and the body are assembled inline.

Those two were tested by replacing the global `fetch` with `vi.stubGlobal`, which is the bluntest double available. It answers every request identically, so nothing checked that the code called the right URL, used the right method, or shaped the body correctly — a mutation that pointed `verifyRecaptcha` at `/api/verify` instead of `/api/siteverify`, or sent `GET`, passed the whole suite. It is also global mutable state: a missing `unstubAllGlobals` leaks into the next file.

## Decision

**Double at the seam the architecture declares, and nowhere else.**

For anything behind an Effect layer, the double is a layer. `tests/doubles/contactLayers.ts` and `cmsLayer.ts` build stand-ins for `Database`, `EmailClient` and `CmsClient`. Dropping to HTTP for these would couple the suite to Contentful's and Resend's wire formats, which we do not control and cannot usefully assert; the layer is typed, so a contract change fails at compile time instead.

For a bare `fetch`, the seam is the network, and MSW is the double. `tests/doubles/network.ts` exposes `recaptchaDouble` and `imageDouble`, following the same shape as the layer doubles already in that folder: a function taking named options and returning what it recorded, scoped to the test rather than to the module.

Routing does part of the asserting. MSW matches on method and URL, and `tests/setup/network.ts` starts the server with `onUnhandledRequest: "error"`, so a request to the wrong endpoint fails the test without anyone writing an assertion for it.

MSW is **not** the default. Two call sites justified it; a third SDK behind a layer would not.

## Consequences

- **Three mutations that used to pass now fail**: pointing siteverify at the wrong path, switching `POST` to `GET`, and putting the token in the wrong field. The first two were invisible to `vi.stubGlobal` by construction.
- **A test that forgets its double now fails loudly** rather than silently reaching the network, because an unhandled request is an error. That is the behaviour we want and it also means every new outbound call must be declared in a test before it can pass.
- **MSW revealed a test that asserted something impossible.** `getImagePlaceholder` was covered by a case claiming it fetches a relative source such as `/local/hero.jpg` verbatim. Node's `fetch` cannot parse a relative URL — it throws, and the function returns `undefined` through its own catch. The stub had accepted the call because it accepted everything. The test now asserts what the code really does.
- **Two mocking idioms live side by side**, and the rule for choosing is in the Decision above rather than in taste. Getting it wrong is not fatal but it is confusing, which is why this is written down.
- **A setup file now runs for every node test**, costing a few hundred milliseconds of startup, and the server is shared: a handler registered by one test would leak into the next without the `resetHandlers` in `afterEach`.
- **MSW cannot help where there is no request.** It intercepts; it does not verify that a fetch happened at the right moment in a program's control flow. That is still the layer double's job, and for `getImagePlaceholder` it is the loader tests that check the placeholder reaches the entry.
