# Release Workflow — `release.yml`

**Full name:** TeqBench Package - Release Workflow
**File:** `.github/workflows/release.yml`

---

## Purpose

The Release workflow automates versioning, changelog generation, GitHub Release creation, and [npm ↗](https://www.npmjs.com/) publishing using Google's [Release Please ↗](https://github.com/googleapis/release-please). When a Release PR is merged to `main`, the package is automatically published to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).

---

## Thin caller

This repo's `.github/workflows/release.yml` is a thin caller — it declares the trigger and concurrency group, then delegates execution to the org-wide reusable workflow at [teqbench/.github → `.github/workflows/release.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/release.yml). All step definitions (Release Please configuration, build, publish), action versions, and permissions live there. Update the upstream workflow to change release behavior across every TeqBench package repo at once.

---

## Triggers

<dl>
    <dt><code>push</code></dt>
    <dd>On <code>main</code>. Runs on every push, including merges from release branches and Release PR merges.</dd>
</dl>

---

## Concurrency

```yaml
group: release-${{ github.repository }}
cancel-in-progress: false
```

Separate from CI and Sync to prevent cross-workflow cancellation.

---

## Secrets

`secrets: inherit` — the reusable workflow inherits org and repo secrets. See the upstream workflow for the specific secrets it consumes (e.g. `APP_ID`, `APP_PRIVATE_KEY`).

The app token is used instead of `GITHUB_TOKEN` so that Release PRs and release commits can trigger downstream workflows (CI, Sync). GitHub's security policy prevents `GITHUB_TOKEN` from triggering other workflows.

---

## Configuration files (local)

These files are local to this repo and drive [Release Please ↗](https://github.com/googleapis/release-please) behavior in the upstream workflow:

<dl>
    <dt><code>release-please-config.json</code></dt>
    <dd>Declares the release type (<code>node</code>), package name, and extra files to bump (e.g. <code>package-lock.json</code> at multiple JSON paths).</dd>
    <dt><code>.release-please-manifest.json</code></dt>
    <dd>Tracks the current released version. Updated automatically by Release Please. CI reads this file to render the version badge.</dd>
</dl>

---

## How Release Please works (high level)

After a push to `main` that includes [Conventional Commits ↗](https://conventionalcommits.org/) (`feat:`, `fix:`), [Release Please ↗](https://github.com/googleapis/release-please) opens or updates a Release PR that bumps the version, updates the changelog, and updates the manifest. When the Release PR is merged, the upstream workflow creates a GitHub Release, tags the commit, and publishes to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).

For per-step detail (publish credentials, build command, files included), see the upstream workflow.
