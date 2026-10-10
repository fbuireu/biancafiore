# CI/CD

Everything runs through GitHub Actions, and the site deploys to Cloudflare Workers with wrangler. The custom domain sits on the production environment; per-PR previews get their own Worker, deleted when the pull request closes.

---

## The workflows

| Workflow | Runs on | Does |
|---|---|---|
| `ci.yml` | push to `main`, pull requests, manual dispatch | A `Verify` job running `pnpm verify`, then both deploys, the end-to-end run against the preview, the production smoke run and the release, and a `Check` job that aggregates them all: the one context the branch ruleset requires |
| `_deploy.yml` | `workflow_call` | The shared deploy steps both environments call |
| `cleanup-development.yml` | pull request closed; weekly | Deletes the per-PR preview Worker once its CI run has finished, and sweeps the Workers of closed pull requests every week |
| `publish-article.yml` | Contentful webhook | Dispatches `ci.yml`, so a published Article redeploys production with the same smoke run and rollback as a push |
| `sync-wiki.yml` | push to `main` touching `docs/wiki/**` | Publishes this wiki |
| `zizmor.yml` | push to `main`, pull requests | Security linting of the workflows themselves |
| `dependency-review.yml` | pull requests | Fails a pull request introducing a known-vulnerable dependency |
| `commit-message.yml` | pull request opened / edited / reopened / synchronize | commitlint on the **pull request title** |
| `dependabot-auto-merge.yml` | Dependabot pull requests | Auto-merges the safe update types; Renovate merges its own once `Check` is green |

---

## Why the pull request title is the one that matters

`main` takes squash merges and the repository sets the squash title from the pull request title, so **that title is the commit semantic-release reads**. The local `commit-msg` hook validates the branch's own commits, which the squash then discards, and GitHub fills the pull request title from the *branch name* whenever a pull request carries more than one commit, so the default is rarely conventional.

The check re-runs on `synchronize` because a required check is evaluated against the head sha: without that trigger a new commit would leave it unreported and block the merge.

---

## The smoke run, and the rollback

**The smoke job is the only one that touches production.** The end-to-end run needs the preview deploy, which happens on pull requests only, so without the smoke job a push to `main` would deploy production and cut a tag without a single request to the live site.

The preview is not a faithful target either: `HIDE_CHROME` is true there, so the suite sees an under-construction placeholder on the unpublished routes. See [Rendering and Routing](Rendering-and-Routing).

A short set of cases carries a `@smoke` tag, and they are the cheapest things that prove the Worker is answering rather than merely deployed: the homepage with a non-empty title, an unknown path answering 404, `robots.txt`, and `/.well-known/security.txt`, served as plain text with a contact and an `Expires` still ahead. None of them names a feature, because a smoke case can only assert what the deploy it follows has already published. **The same set runs in every repository that deploys**, written the same way, so a set that differs between them is drift rather than a decision. The `security.txt` case also wants the body byte for byte the file in the repository: a `security.txt` the Cloudflare zone serves itself answers before the Worker, and the case is what notices one standing in for the repository's.

**`security.txt` lapses unless someone renews it.** Its `Expires` is two years after its last renewal, and the docs test fails 30 days before that date, so `main` turns red a month before the file lapses; renewing it means moving `Expires` forward, at most two years. [`SECURITY.md`](https://github.com/fbuireu/biancafiore/blob/main/.github/SECURITY.md) says the same, and the rule lives in the *Deploy* section of [`AGENTS.md`](https://github.com/fbuireu/biancafiore/blob/main/AGENTS.md).

The step passes no `--pass-with-no-tests`, and that is the point: Playwright exits non-zero on an empty set, so the flag would make a typo in the tag filter green.

**A failing smoke rolls production back.** A tag means the version is live *and answering*, so the release job needs both the production deploy and the smoke run. On its own that would leave a bad version serving traffic with only the tag withheld, so a separate rollback job returns the Worker to the previously live version when the deploy succeeded and the smoke failed. It is a separate job because it needs the Cloudflare credentials, and the smoke job deliberately declares no environment.

**A merge landing mid-release joins the release in flight.** The release job fast-forwards onto the head of `main` before semantic-release runs, so the version covers every commit on `main` at that moment and the run those commits queued has nothing left to publish; releasing from the run's own sha would make its version-bump push a non-fast-forward once another commit had landed. A tag can therefore precede the deploy of the commits it absorbed by a few minutes. Two cases still stand the job down, `main` rewritten under the run or a merge landing in the seconds between the fast-forward and the push, and both heal on their own: no tag was written, so the run the newer head queued cuts the release over everything since the last one. A manual dispatch on `main` redeploys production with the smoke run behind it, for a rotated credential, and cuts no release.

**What that costs is worth stating.** A case that fails for a reason outside the Worker now reverts a deploy that was fine. A case whose result depends on the caller's address does not belong in a set that can undo a release, which is why the feed and the sitemap are not in it: both answer `403` to a request from a datacenter address, from the edge rather than from the Worker, while a browser gets both.

---

## What gates a merge

The ruleset on `main` requires these contexts: `Check`, `Lint the pull request title`, `Dependency Review` and `zizmor`. `Check` is an aggregate job that needs the verify, deploy, end-to-end, smoke and release jobs in `ci.yml` and fails when any of them failed or was cancelled, so the end-to-end run against the preview gates a merge without being named, which it could not be: every job in that workflow is conditional on the event, and a required check that never reports blocks the merge forever. Approvals are not required; the checks are the gate. Settings outside it back it up: a `release-tags` ruleset that forbids deleting or moving any `v*` tag, and a deployment-branch policy on the `production` environment that accepts `main` only.

**Every Playwright run uses two browsers.** The end-to-end run against the preview and the smoke run against production both run each case in Chromium and in WebKit, the engine behind Safari, and each job installs both behind a cache keyed on the pair, so a cache saved with one browser is never restored into a run of both. The docs test holds the projects and the install.

**The Access token reaches the preview alone.** The preview sits behind Cloudflare Access, so the end-to-end job carries a service token, `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`, and [`e2e/fixtures.ts`](https://github.com/fbuireu/biancafiore/blob/main/e2e/fixtures.ts), where every spec takes its `test` from, adds it as `CF-Access-Client-Id` and `CF-Access-Client-Secret` to the requests whose origin is the preview's, and to the requests a spec makes itself. What a page asks of a third party, Tag Manager, Calendly or any other, carries no token, which `extraHTTPHeaders` in the config could not promise: Playwright sends those on every request. The docs test holds the imports and the config.

**The preview Worker outlives the end-to-end run.** Closing a pull request does not cancel the CI run already going, so the cleanup queues behind that run, in a concurrency group spelled from the pull request number. A weekly sweep deletes any preview Worker whose pull request is closed, for the cases a cleanup missed.

---

## Where the logs go

Cloudflare keeps Workers Logs and Workers Traces for the site Worker and **exports both** to Better Stack through its own OTLP export: each stage names its own pair of destinations, configured in the account's dashboard with the endpoint and the token, so nothing in the repository holds a credential and rotating the sink needs no deploy. Neither signal is sampled: the rate is the one setting that loses data without a symptom, and this site serves too little traffic for sampling to save anything.

The application's own log lines reach the same place through `console`. That is deliberate rather than lazy: the export attributes console output to the active span and stamps its trace id, so a failed request's log line and the span it failed on answer one query, with nothing in the code producing the join. A sink posted to over HTTP from inside the Worker is invisible to the runtime and its lines would arrive with an empty trace id. Every line is one JSON object carrying the same `service`, `level` and `message` keys the sibling repositories use, so one query reads all three. Build-time logs stay human-readable in the build output and reach no sink at all.

**The destinations are dashboard settings, and a deploy naming one that does not exist fails.** The reasoning is recorded in [ADR 0020](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0020-logs-and-traces-leave-through-cloudflares-export.md).

---

## How the deploy step is shaped

The shared deploy workflow passes wrangler a `--message` of its own, `<sha>-<event>`, so a deployment reads as the commit it shipped. It is one token with no spaces because the three repositories that deploy share the format, and in forever-pto the OpenNext wrapper re-spawns wrangler through a shell that splits a message on its spaces; the docs test holds every deploy to it.

The runtime secrets travel with the deploy in a secrets file, so a deploy is one version rather than a deploy followed by a secret write that leaves the new code running against the old values in between. The upload is additive: a secret the file omits is not deleted.

Neither the build nor the deploy is wrapped in a retry. Both fail deterministically far more often than on a network flake, a retry wrapper cannot tell the two apart, and wrangler already retries its own API calls.

The release commit, `chore(release): <version> [skip ci]`, is the one commit on `main` that commitlint never sees, since the hook runs on a branch and the pull request check reads the title. The `[skip ci]` is load-bearing: without it that push starts the run that cuts the next release.
