# biancafiore.me

[![Codecov](https://img.shields.io/codecov/c/gh/fbuireu/biancafiore?style=flat-square&logo=codecov)](https://codecov.io/gh/fbuireu/biancafiore)

The portfolio and blog of Bianca Fiore, a content writer. An Astro SSR site on
Cloudflare Workers, with the writing served from Contentful and contact
submissions persisted to Turso.

```bash
pnpm install
cp .env.example .env
pnpm start
```

## Where things are written down

| | |
| --- | --- |
| How the codebase is put together | [CLAUDE.md](./CLAUDE.md) and the nested guides it links |
| What the domain words mean | [CONTEXT.md](./CONTEXT.md) |
| Why a decision was made | [docs/adr/](./docs/adr/) |
| What is not decided yet | [docs/BACKLOG.md](./docs/BACKLOG.md) |
| How to contribute | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| How to report a vulnerability | [SECURITY.md](./SECURITY.md) |

Articles, projects and testimonials live in Contentful, not in this repository,
so a typo in a piece of writing is a
[content issue](.github/ISSUE_TEMPLATE/content_issue.yml) rather than a pull
request.

## License

- **Source code** (components, styles, config) is licensed under [MIT](LICENSE).
- **Blog content** (posts, articles, original images) is **© Bianca Fiore, all rights reserved**.
  No part of the content may be reproduced, distributed, or used in any form without prior
  written permission. For permissions, get in touch via [biancafiore.me](https://biancafiore.me).
