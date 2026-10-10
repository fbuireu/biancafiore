# Security Policy

## Supported Versions

This is a continuously deployed personal website, not a versioned library:
[biancafiore.me](https://biancafiore.me) always runs the latest `main`, and
that deployment is the only supported version. There is nothing older to
patch; fixes ship by deploying.

| Component | Supported |
| --- | --- |
| The site, `biancafiore.me` | The latest deploy from `main` |
| Anything older | No |

## Scope

The site is mostly content, rendered on request and served from the Workers
cache. Content itself (articles, projects, testimonials) lives in EmDash, the CMS
the same Worker hosts, and is written through its admin, never from this
repository.

### In scope

- **The contact form server action**: the one write path, backed by Turso and
  Resend, gated by reCAPTCHA v3.
- **The security headers middleware**, which sets the CSP and friends on every
  response.
- **The external service boundaries**: Turso and Resend.
- **The CMS itself**: its admin at `biancafiore.me/_emdash/admin`, its API and
  tokens, and the plugins in `src/infrastructure/cms/plugins`.

### Out of scope

- Vulnerabilities in the platforms and services the site is built on:
  Cloudflare, EmDash, Turso, Resend, Google reCAPTCHA, Astro. Report those
  to them.
- Rate limiting, quota exhaustion or cost caused by ordinary use of the
  public routes.

### Documented trade-offs, not vulnerabilities

Some behaviour that looks reportable is a documented, deliberate decision.
Please check these before reporting:

- **Cloudflare Web Analytics runs before the consent banner.** The zone
  injects its beacon at the edge before any script in this tree runs, so
  nothing here can gate it. It is kept on purpose, the privacy policy names
  it, and the only switch is the Cloudflare dashboard. Google Analytics and
  the Better Stack tag, by contrast, are consent-gated. See
  [ADR 0013](../docs/adr/0013-analytics-gated-behind-cookie-consent.md) and
  [ADR 0020](../docs/adr/0020-logs-and-traces-leave-through-cloudflares-export.md).
- **The policy allows inline styles.** `script-src` names each inline script by its digest and has no `'unsafe-inline'`, but `style-src` keeps it: Astro writes inline styles for islands, fonts and view transitions, and the templates carry custom properties in `style` attributes. A report that styles can be injected describes this decision.
- **`/rss.xml` and `/sitemap-index.xml` answer `403` to some automated
  clients.** Nothing in this tree returns a 403; that answer comes from a zone
  rule at the edge, and a browser gets both. It is a Cloudflare setting, not a
  finding against the site.

A report that one of these exposes something *beyond* its documented scope is
very much welcome.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests or discussions.** Report them privately instead.

### Preferred: GitHub private vulnerability reporting

1. Open [Report a vulnerability](https://github.com/fbuireu/biancafiore/security/advisories/new)
2. Fill in the form with the details below

Private reporting is open to any GitHub account and is the channel this project
uses.

### If private reporting is unavailable

Write through the [contact form](https://biancafiore.me/contact), and say
nothing about the finding anywhere public.

Whichever way it reaches me, include:

- The type of issue (injection through the contact form, header bypass,
  leaked secret…)
- The affected route or component, and the location of the relevant source
  code if you found it
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code, if possible
- The impact of the issue, including how an attacker might exploit it

### What to expect

- **Acknowledgment**: I will acknowledge receipt within 48 hours
- **Updates**: I will keep you informed of the fix's progress
- **Timeline**: I aim to fix critical issues within 7 days
- **Credit**: I will credit you in the security advisory, unless you prefer to
  remain anonymous
- **Disclosure**: this project follows a 90-day responsible disclosure policy

Reports made in good faith will not result in legal action. Thank you for
helping keep the site and its readers safe.

## security.txt

[`public/.well-known/security.txt`](../public/.well-known/security.txt) is
served at `https://biancafiore.me/.well-known/security.txt` and points to this
policy. Its `Expires` is two years after its last renewal, and `pnpm test:docs`
fails 30 days before that date, so `main` turns red a month before the file
lapses. To renew it, move `Expires` forward, at most two years from the day
you do it.

The file in this repository is the only one: a `security.txt` configured in the
Cloudflare zone (Security Center) answers before the Worker and hides it, so it
stays off, and the production smoke run fails when the body it gets is not this
file byte for byte.

## Security Updates

Security fixes ship as ordinary commits to `main`, which deploys them; there is
no release to wait for and nothing for a reader to update.
