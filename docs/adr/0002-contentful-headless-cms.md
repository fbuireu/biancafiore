# 2. Contentful as the content source

Date: 2026-07-26

## Status

Accepted.

## Context

The site owner is not a developer and publishes regularly. Local Markdown/MDX content collections would put every edit behind a repo commit and a deploy, which is the wrong workflow for a client-owned site whose whole point is that its owner writes on it.

## Decision

Articles, projects, authors, tags, testimonials and cities are authored in Contentful and fetched through the CMS client, at the cost of an external dependency and vendor lock-in.

To contain the lock-in, Contentful's shape stops at the infrastructure boundary: the client returns raw entries and everything downstream consumes pure DTOs, so a future CMS swap is a client + mapper change rather than an app-wide rewrite.

## Consequences

- The mapping layer that keeps Contentful out of the rest of the app is not incidental plumbing: it is what makes this reversible, and it is recorded separately as the anti-corruption layer ([ADR 0012](./0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md)).
- Builds must survive without credentials, so `fetchEntries` bails out through `isContentfulConfigured()` and answers no entries rather than failing: one gate for every loader, in front of the client instead of repeated behind it.
- Content shape is owned outside the repo: a field renamed in Contentful breaks a DTO, and the domain glossary in [`CONTEXT.md`](../../CONTEXT.md) is the only place the two vocabularies are reconciled.
