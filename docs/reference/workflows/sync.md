# Sync Workflow — `sync.yml`

**Full name:** TeqBench Package - Sync (Main into Dev) Workflow
**File:** `.github/workflows/sync.yml`

---

## Purpose

After [Release Please ↗](https://github.com/googleapis/release-please) merges a Release PR to `main`, the `dev` branch falls behind — it's missing the version bump in `package.json`, the updated `CHANGELOG.md`, and the new `.release-please-manifest.json`. This workflow automatically merges `main` back into `dev` to keep the branches in sync.

---

## Thin caller

This repo's `.github/workflows/sync.yml` is a thin caller — it declares the trigger and concurrency group, then delegates execution to the org-wide reusable workflow at [teqbench/.github → `.github/workflows/sync.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/sync.yml). The merge logic, branch-protection bypass, and `[skip ci]` handling live there.

---

## Triggers

<dl>
    <dt><code>push</code></dt>
    <dd>On <code>main</code>. Runs on every push to <code>main</code> — release merges, badge commits, and non-release merges alike. If <code>dev</code> is already up to date, the merge is a no-op and there is nothing to push.</dd>
</dl>

---

## Concurrency

```yaml
group: sync-${{ github.repository }}
cancel-in-progress: false
```

Separate from CI and Release to prevent cross-workflow cancellation.

---

## Secrets

`secrets: inherit` — the reusable workflow inherits org and repo secrets. The app token (`APP_ID`, `APP_PRIVATE_KEY`) is required upstream to bypass the `dev` branch protection ruleset; without it, the push to `dev` would be rejected.

---

## Interaction with other workflows

<dl>
    <dt>Sync pushes to <code>dev</code></dt>
    <dd>CI on <code>dev</code> is suppressed by the <code>[skip ci]</code> tag in the merge commit message (handled upstream).</dd>
    <dt>Sync races with another push to <code>dev</code></dt>
    <dd>Handled upstream by <code>git pull --rebase</code> before pushing.</dd>
</dl>
