# Astro SSR deployed to Cloudflare Workers

The site runs Astro with `output: "server"` on the `@astrojs/cloudflare` adapter and ships to Cloudflare Workers (`wrangler deploy`), rather than static prerender or a Node host such as Vercel. We chose the Workers edge runtime for global low-latency SSR, integrated image resizing (`imageService: "cloudflare"` in production), and zero-cost idle, accepting that the code is now bound to web-standard APIs instead of Node.

## Consequences

- No Node built-ins at runtime: the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`, and `node:async_hooks` / `contentful` are externalized in `vite.ssr.external`.
- Deploy, secrets, and env are Wrangler/Cloudflare-shaped; moving hosts means re-solving image handling and the runtime, so this is expensive to reverse.
