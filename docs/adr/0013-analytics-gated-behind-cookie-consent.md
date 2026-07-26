# Analytics gated behind cookie consent

Google Analytics / Tag Manager load with consent denied by default: an inline script in `<head>` reads the `cc_cookie` (vanilla-cookieconsent) and calls `gtag('consent', 'default', { analytics_storage })`, set to `granted` only if the visitor accepted the `analytics` category, before GA/GTM initialise. This is driven by a GDPR / consent-mode requirement that is not otherwise visible in the code, chosen over fire-and-forget analytics that would be simpler but non-compliant.
