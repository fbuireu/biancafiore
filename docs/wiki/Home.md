# biancafiore

**The portfolio and blog of a content writer, served from the edge.**

An Astro SSR site on Cloudflare Workers, with editorial content authored in Contentful and contact submissions stored in Turso. It is a real production site on [biancafiore.me](https://biancafiore.me), and this wiki is the shape of how it is built.

---

## What It Is

- A **Blog** of long-form Articles, each with an Author, a publish date and topical Tags
- A **portfolio** of Projects, plus Testimonials and the Cities behind the biography
- A **Tag Index** that browses writing by subject, and by the person who wrote it
- A **contact form** backed by a server action, reCAPTCHA and transactional email
- **Prerendered content pages** with only the dynamic paths hitting the SSR runtime

---

## Quick Navigation

| Page | Description |
|------|-------------|
| **[Getting Started](Getting-Started)** | Install, env, dev server, the checks |
| **[Architecture](Architecture)** | The layers, and how much DDD this tree takes |
| **[Content Model](Content-Model)** | The domain vocabulary, and how Contentful reaches it |
| **[Rendering and Routing](Rendering-and-Routing)** | What prerenders, what runs on request, and `HIDE_CHROME` |
| **[Styling](Styling)** | The cascade layers, the token system, the colour scheme |
| **[CI/CD](CI-CD)** | Workflows, the two deploys, the smoke run and the rollback |
| **[Troubleshooting](Troubleshooting)** | The failures that have actually happened here |

---

## Where The Rules Live

This wiki is the shape, not the rules. Anything normative lives in the repository beside the code it governs, and a test asserts it: restating it here would be a second copy that nothing checks.

| Question | Where |
|---|---|
| What does a domain word mean, and what does it displace? | [`CONTEXT.md`](https://github.com/fbuireu/biancafiore/blob/main/CONTEXT.md) |
| What rule does one folder obey? | the `CLAUDE.md` inside that folder |
| Why was a decision made this way? | [`docs/adr/`](https://github.com/fbuireu/biancafiore/tree/main/docs/adr) |
| What is known-broken or deliberately deferred? | [`docs/BACKLOG.md`](https://github.com/fbuireu/biancafiore/blob/main/docs/BACKLOG.md) |
| How do I contribute? | [`CONTRIBUTING.md`](https://github.com/fbuireu/biancafiore/blob/main/CONTRIBUTING.md) |

---

## A Note On Content

Articles, Projects and Testimonials are **not in this repository**. They live in Contentful, so a typo in an article cannot be fixed by a pull request. Code contributions go through the normal fork-and-PR flow; content corrections go through the content issue template.
