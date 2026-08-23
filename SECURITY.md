# Security Policy

## Supported Versions

This is a continuously deployed personal website:
[biancafiore.me](https://biancafiore.me) always runs the latest `main`, and
that deployment is the only supported version. Fixes ship by deploying.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub
issues.**

If you discover a security vulnerability, please report it privately:

### Preferred Method: GitHub Private Vulnerability Reporting

1. Go to the [Security tab](https://github.com/fbuireu/biancafiore/security)
2. Click "Report a vulnerability"
3. Fill in the details about the vulnerability

### Alternative: The contact form

If you cannot use private reporting, write through the
[contact form](https://biancafiore.me/contact), and include:

- Type of issue (e.g., injection through the contact form, header bypass,
  leaked secret, etc.)
- The affected route or component, and the location of the relevant source
  code if you found it
- Step-by-step instructions to reproduce the issue
- Proof-of-concept if possible
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: we'll acknowledge receipt within 48 hours
- **Updates**: we'll provide updates on the fix progress
- **Timeline**: we aim to fix critical issues within 7 days
- **Credit**: we'll credit you in the security advisory (unless you prefer to
  remain anonymous)
- **Disclosure**: we follow a 90-day responsible disclosure policy

## Where to Look

Most of the site is prerendered content; the dynamic surface is small:

- **The contact form server action**: the one write path, backed by Turso and
  Resend, gated by reCAPTCHA v3.
- **The security headers middleware**, which sets the CSP and friends on every
  response.
- **The external service boundaries**: Contentful, Turso, and Resend.

Content itself (articles, projects, testimonials) lives in Contentful and is
not writable from this repository.
