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

**The smoke job is the only one that touches production, and until it existed nothing did.** The end-to-end run needs the preview deploy, which happens on pull requests only, so a push to `main` used to deploy production, cut a tag, and make no request to the live site at all.

The preview is not a faithful target either: `HIDE_CHROME` is true there, so the suite sees an under-construction placeholder on four routes. See [Rendering and Routing](Rendering-and-Routing).

A short set of cases carries a `@smoke` tag, and they are the cheapest things that prove the Worker is answering rather than merely deployed: the homepage with a non-empty title, an unknown path answering 404, and `robots.txt`. None of them names a feature, because a smoke case can only assert what the deploy it follows has already published. **The same trio runs in every repository that deploys**, written the same way, so a set that differs between them is drift rather than a decision.

The step passes no `--pass-with-no-tests`, and that is the point: Playwright exits non-zero on an empty set, so the flag would make a typo in the tag filter green.

**A failing smoke rolls production back.** A tag means the version is live *and answering*, so the release job needs both the production deploy and the smoke run. On its own that would leave a bad version serving traffic with only the tag withheld, so a separate rollback job returns the Worker to the previously live version when the deploy succeeded and the smoke failed. It is a separate job because it needs the Cloudflare credentials, and the smoke job deliberately declares no environment.

**What that costs is worth stating.** A case that fails for a reason outside the Worker now reverts a deploy that was fine. A case whose result depends on the caller's address does not belong in a set that can undo a release, which is why the feed and the sitemap are not in it: both answer `403` to a request from a datacenter address, from the edge rather than from the Worker, while a browser gets both.

---

## What gates a merge

The ruleset on `main` requires four contexts: `Check`, `Lint the pull request title`, `Dependency Review` and `zizmor`. `Check` is an aggregate job that needs every other job in `ci.yml` and fails when any of them failed or was cancelled, so the end-to-end run against the preview gates a merge without being named, which it could not be: every job in that workflow is conditional on the event, and a required check that never reports blocks the merge forever. Approvals are not required; the checks are the gate. Two settings back it: a `release-tags` ruleset that forbids deleting or moving any `v*` tag, and a deployment-branch policy on the `production` environment that accepts `main` only.

**The preview Worker outlives the end-to-end run, and it used to be deleted under it.** Closing a pull request does not cancel the CI run already going, so the cleanup queues behind that run, in a concurrency group spelled from the pull request number. A weekly sweep deletes any preview Worker whose pull request is closed, for the cases a cleanup missed.

---

## Things the deploy learned the hard way

- **A long commit message breaks it, and the error does not say so.** wrangler sends the latest commit message verbatim as a deployment annotation with no truncation, and past a few thousand characters the API answers `Received a malformed response from the API`: a build that compiled, uploaded, and then died on metadata. A merge commit carrying a long pull request body is enough. The annotation is now passed explicitly.
- **The secrets ride the deploy.** They are written to a file outside the workspace and uploaded with the version, rather than written after the deploy, which used to make every deploy two versions with a window in between where new code ran against the previous values.
- **Neither the build nor the deploy is wrapped in a retry.** A wrapper cannot tell a bad argument from a bad network, and both fail deterministically far more often than they fail for a reason a second attempt fixes.
