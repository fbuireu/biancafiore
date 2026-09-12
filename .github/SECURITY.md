# Security Policy

## Supported Versions

This is a continuously deployed personal website, not a versioned library:
[biancafiore.me](https://biancafiore.me) always runs the latest `main`, and
that deployment is the only supported version. There is nothing older to
patch; fixes ship by deploying.

## Scope

Most of the site is prerendered content; the dynamic surface is small.

### In scope

- **The contact form server action**: the one write path, backed by Turso and
  Resend, gated by reCAPTCHA v3.
- **The security headers middleware**, which sets the CSP and friends on every
  response.
- **The external service boundaries**: Contentful, Turso, and Resend.

Content itself (articles, projects, testimonials) lives in Contentful and is
not writable from this repository.

### Out of scope

- Vulnerabilities in the platforms and services the site is built on:
  Cloudflare, Contentful, Turso, Resend, Google reCAPTCHA, Astro. Report those
  to them.
- Rate limiting, quota exhaustion or cost caused by ordinary use of the
  public routes.

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

## Security Updates

Security fixes ship as ordinary commits to `main`, which deploys them; there is
no release to wait for and nothing for a reader to update.
