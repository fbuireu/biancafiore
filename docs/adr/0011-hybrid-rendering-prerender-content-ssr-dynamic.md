# Hybrid rendering: prerender content pages, SSR only for dynamic

Every content page opts into static prerendering (`export const prerender = true`) even though the adapter runs `output: "server"`, so the site ships as prerendered HTML served from the edge and only invokes the Workers SSR runtime for genuinely dynamic paths (the contact server action, on-demand 404/500). This gives static-fast, edge-cached content with SSR available exactly where it is needed, rather than paying per-request SSR for pages that never change or giving up server actions by going fully static.

## Consequences

- Prerendered pages are identical for every visitor, so per-user state cannot be server-rendered — the theme is applied by a client bootstrap before first paint (ADR 0005).
