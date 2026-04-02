# Release Workflow — `release.yml`

**Full name:** TeqBench Package - Release Workflow
**File:** `.github/workflows/release.yml`

---

## Purpose

The Release workflow automates versioning, changelog generation, GitHub Release creation, and npm publishing using Google's [Release Please ↗](https://github.com/googleapis/release-please). It eliminates the need to manually edit version numbers, write changelogs, or create release tags. When a release is created, the package is automatically published to GitHub Packages.

---

## Triggers

| Event  | Branches |
| ------ | -------- |
| `push` | `main`   |

Runs on every push to `main`, including merges from release branches, badge commits (though these have no releasable commits), and Release PR merges.

---

## Concurrency

```yaml
group: release-${{ github.repository }}
cancel-in-progress: false
```

Separate from CI and Sync to prevent cross-workflow cancellation.

---

## Secrets Used

| Secret            | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `APP_ID`          | GitHub App ID for generating a bot token |
| `APP_PRIVATE_KEY` | GitHub App private key                   |

The app token is used instead of `GITHUB_TOKEN` so that Release PRs and release commits can trigger downstream workflows (CI, Sync). GitHub's security policy prevents `GITHUB_TOKEN` from triggering other workflows.

---

## Job 1: `release` (Release Please)

### Permissions

```yaml
permissions: {}

jobs:
    release:
        permissions:
            contents: write # Create the GitHub Release and git tag
            pull-requests: write # Open and update the Release PR
```

### Timeout

```yaml
timeout-minutes: 10
```

### Steps

#### 1. Generate App Token

Uses `actions/create-github-app-token@v3` to create a short-lived token from the `teqbench-automation` GitHub App.

#### 2. Run Release Please

```yaml
uses: googleapis/release-please-action@v4
with:
    target-branch: main
    token: ${{ steps.app-token.outputs.token }}
    config-file: release-please-config.json
    manifest-file: .release-please-manifest.json
```

### Output

The job exposes `release_created` as an output, which the publish job uses to determine whether to run.

---

## Job 2: `publish` (Publish to GitHub Packages)

Runs only when `release_created == 'true'`.

### Permissions

```yaml
permissions:
    contents: read # Read the checked-out code
    packages: write # Publish to GitHub Packages
```

### Steps

1. **Checkout code** — Standard checkout (no full history needed).
2. **Setup Node** — Configures Node from `.nvmrc` with `registry-url: "https://npm.pkg.github.com"` for [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) authentication.
3. **Install dependencies** — `npm ci` for deterministic builds. `GITHUB_TOKEN` with `packages: write` handles publishing to the current repo's package, and `packages: read` (inherited) handles installing dependencies.
4. **Build** — `npm run build` compiles TypeScript to `dist/`.
5. **Publish** — `npm publish` with `NODE_AUTH_TOKEN` set to `GITHUB_TOKEN`. The `"files": ["dist"]` field in `package.json` ensures only compiled output is included.

> **Cross-repo `@teqbench` dependencies:** For packages that depend on other `@teqbench` packages, each dependency package must grant the consuming repository read access in its package settings (**[GitHub Packages ↗](https://github.com/orgs/teqbench/packages) → Manage access**). This applies to the entire transitive dependency tree, not just direct dependencies — same as CI.

---

## How Release Please Works

### Phase 1: Create/Update Release PR

After a push to `main` that includes [Conventional Commits ↗](https://conventionalcommits.org/) (`feat:`, `fix:`), [Release Please ↗](https://github.com/googleapis/release-please):

1. Reads all conventional commits since the last release tag.
2. Determines the version bump:
    - `fix(…):` — **patch** (e.g., 1.0.0 to 1.0.1)
    - `feat(…):` — **minor** (e.g., 1.0.0 to 1.1.0)
    - `feat(…)!:` or `BREAKING CHANGE:` — **major** (e.g., 1.0.0 to 2.0.0)
3. Opens (or updates) a Release PR that:
    - Bumps `version` in `package.json`
    - Bumps `version` in `package-lock.json` (both root and `packages['']`)
    - Updates `CHANGELOG.md` with grouped commit entries
    - Updates `.release-please-manifest.json`

If only `chore:`, `docs:`, or `refactor:` commits are present, no Release PR is created.

### Phase 2: Create GitHub Release and Publish

When the Release PR is merged:

1. Creates a GitHub Release with auto-generated release notes.
2. Creates a git tag (e.g., `v0.1.1`).
3. The `publish` job runs — builds and publishes the package to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).
4. The push to `main` from the merge triggers CI (to update badges) and Sync (to merge main into dev).

---

## Configuration Files

### `release-please-config.json`

```json
{
    "release-type": "node",
    "packages": {
        ".": {
            "package-name": "@teqbench/tbx-ngx-http",
            "initial-version": "0.1.0",
            "extra-files": [
                "package.json",
                { "type": "json", "path": "package-lock.json", "jsonpath": "$.version" },
                { "type": "json", "path": "package-lock.json", "jsonpath": "$.packages[''].version" }
            ],
            "include-component-in-tag": false,
            "changelog-path": "CHANGELOG.md"
        }
    }
}
```

Key settings:

- **`release-type: node`** — uses [Node.js ↗](https://nodejs.org/) release strategy (reads `package.json`).
- **`extra-files`** — also bumps version in `package-lock.json` at two JSON paths.
- **`include-component-in-tag: false`** — produces clean tags like `v0.1.1` instead of prefixed tags.
- **`changelog-path`** — writes changelog to the repo root.

### `.release-please-manifest.json`

```json
{
    ".": "0.1.0"
}
```

Tracks the current released version. Updated automatically by release-please. CI reads this file to generate the version badge.

---

## Interaction with Other Workflows

| Event                            | Triggers                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Release PR opened/updated        | CI runs as status check on the PR                                                            |
| Release PR merged (push to main) | CI (badge update), Release (creates GitHub Release + publishes), Sync (merges main into dev) |
| GitHub Release created           | No additional workflow triggers                                                              |
