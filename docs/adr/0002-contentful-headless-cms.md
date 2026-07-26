# Contentful as the content source

Articles, projects, authors, tags, testimonials and cities are authored in Contentful and fetched at request time through the CMS client, instead of local Markdown/MDX content collections. A hosted headless CMS lets the non-technical site owner edit content without touching the repo or a deploy, which is worth the external dependency and vendor lock-in for a client-owned site.

To contain the lock-in, Contentful's shape stops at the infrastructure boundary: the client returns raw entries and everything downstream consumes pure DTOs, so a future CMS swap is a client + mapper change rather than an app-wide rewrite.
