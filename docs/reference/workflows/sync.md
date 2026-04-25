# Sync Workflow — `sync.yml`

**Full name:** TeqBench Package - Sync (Main into Dev) Workflow
**File:** `.github/workflows/sync.yml`

---

## Purpose

After [Release Please ↗](https://github.com/googleapis/release-please) merges a Release PR to `main`, the `dev` branch falls behind — it's missing the version bump in `package.json`, the updated `CHANGELOG.md`, and the new `.release-please-manifest.json`. This workflow automatically merges `main` back into `dev` to keep the branches in sync.

---

## Triggers

<dl>
    <dt><code>push</code></dt>
    <dd>On <code>main</code>.</dd>
</dl>

Sync runs on **every push to `main`** — release merges, badge commits, and non-release merges alike. This ensures `dev` never silently falls behind `main`. If `dev` is already up to date, the merge is a no-op and the push has nothing to send.

---

## Concurrency

```yaml
group: sync-${{ github.repository }}
cancel-in-progress: false
```

Separate from CI and Release to prevent cross-workflow cancellation.

---

## Secrets Used

<dl>
    <dt><code>APP_ID</code></dt>
    <dd>GitHub App ID for generating a bot token.</dd>
    <dt><code>APP_PRIVATE_KEY</code></dt>
    <dd>GitHub App private key.</dd>
</dl>

The app token allows the Sync workflow to bypass the `dev` branch protection ruleset (which requires PRs and status checks). Without the bot token, the push to `dev` would be rejected.

---

## Job: `sync` (Merge main into dev)

### Permissions

```yaml
permissions: {}

jobs:
    sync:
        permissions:
            contents: write # Required to push the merge commit to dev
```

Only `contents: write` is needed — the app token handles the branch-protection bypass.

### Timeout

```yaml
timeout-minutes: 10
```

### Step-by-Step Walkthrough

#### 1. Generate App Token

Uses `actions/create-github-app-token@v3` to create a short-lived token from the `teqbench-automation` GitHub App.

#### 2. Checkout Repository

```yaml
uses: actions/checkout@v4
with:
    fetch-depth: 0
    token: ${{ steps.app-token.outputs.token }}
```

`fetch-depth: 0` is critical — the runner needs full history so it knows the `dev` branch exists and can perform the merge.

#### 3. Merge Main into Dev

```bash
git config user.name "teqbench-automation[bot]"
git config user.email "263536528+teqbench-automation[bot]@users.noreply.github.com"

git checkout dev
git pull origin dev

git merge origin/main --no-edit -m "chore: sync main into dev [skip ci]"

git pull --rebase origin dev || true
git push origin dev
```

**Step-by-step:**

1. **Configure git identity** — uses the bot's identity so commits are attributed correctly.
2. **Checkout dev and pull latest** — ensures we have the most recent state of `dev`.
3. **Merge `origin/main` into `dev`** — brings all changes from main (releases, docs, CI fixes).
4. **Pull with rebase** — handles race conditions where another push landed on `dev` between the merge and push.
5. **Push to dev** — the bot token bypasses branch protection.

**Commit message details:**

- `chore: sync main into dev` — descriptive message for the merge commit.
- `[skip ci]` — prevents the push to `dev` from triggering a CI run, avoiding unnecessary workflow runs.

---

## Interaction with Other Workflows

<dl>
    <dt>Sync pushes to <code>dev</code></dt>
    <dd>CI on <code>dev</code> is <strong>skipped</strong> — the <code>[skip ci]</code> tag in the merge commit message suppresses the <code>push</code> trigger per the <a href="https://docs.github.com/en/actions">GitHub Actions ↗</a> specification.</dd>
    <dt>Sync races with another push</dt>
    <dd>Handled by <code>git pull --rebase</code> before pushing.</dd>
</dl>
