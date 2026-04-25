# CI Workflow — `ci.yml`

**Full name:** TeqBench Package - CI Workflow
**File:** `.github/workflows/ci.yml`

---

## Purpose

The CI workflow is the quality gate for the repository. It runs formatting checks, type checking, linting, tests with coverage enforcement, dependency auditing, and README version drift detection on every push and pull request to `main` and `dev`. After a successful push (not PR), it pushes badge data to a shared [GitHub Gist ↗](https://gist.github.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4) and updates the README with branch-specific [Shields.io ↗](https://shields.io) badge URLs.

---

## Triggers

<dl>
    <dt><code>push</code> on <code>main</code>, <code>dev</code></dt>
    <dd>Full pipeline + badge gist push.</dd>
    <dt><code>pull_request</code> on <code>main</code>, <code>dev</code></dt>
    <dd>Full pipeline, no badge updates.</dd>
</dl>

---

## Concurrency

```yaml
group: ci-${{ github.repository }}-${{ github.ref }}
cancel-in-progress: false
```

Per-branch isolation: CI on `main` and `dev` run independently. Runs on the same branch queue sequentially (no cancellation).

---

## Secrets & Variables

<dl>
    <dt><code>APP_ID</code> (Secret, Repo)</dt>
    <dd>GitHub App ID for generating a bot token.</dd>
    <dt><code>APP_PRIVATE_KEY</code> (Secret, Repo)</dt>
    <dd>GitHub App private key.</dd>
    <dt><code>GIST_TOKEN</code> (Secret, Org)</dt>
    <dd>PAT with <code>gist</code> scope for pushing badge data.</dd>
    <dt><code>GIST_ID</code> (Variable, Org)</dt>
    <dd>ID of the shared public badge gist.</dd>
</dl>

The app token is used for checkout with submodules. The gist token is used to push badge JSON data to the shared gist owned by `teqbench-shields-bot`.

---

## Job: `check` (Lint, Typecheck & Test)

### Permissions

Permissions are declared at the **job level**. A `permissions: {}` block at the workflow level sets an explicit read-only default — any future jobs added to this file will have no elevated access unless they declare their own permissions block.

```yaml
permissions: {}

jobs:
    check:
        permissions:
            contents: read
```

### Timeout

```yaml
timeout-minutes: 20
```

### Step-by-Step Walkthrough

#### 1. Enforce Source Branch for Main

PRs to `main` must come from `release/*`, `hotfix/*`, or `release-please--*` branches. All other PRs are rejected with an error annotation. This is a CI-enforced policy — it does not rely solely on GitHub branch protection settings.

#### 2. Generate App Token

Uses `actions/create-github-app-token@v3` to create a short-lived token from the `teqbench-automation` GitHub App.

#### 3. Checkout Code

```yaml
uses: actions/checkout@v4
with:
    submodules: true
    token: ${{ steps.app-token.outputs.token }}
    fetch-depth: 0
```

Uses the app token to check out submodules ([Claude Code ↗](https://github.com/anthropics/claude-code) skills). `fetch-depth: 0` fetches full history.

#### 4. Setup Node

Reads the Node version from `.nvmrc` with [npm ↗](https://www.npmjs.com/) cache enabled.

#### 5. Install Dependencies

```bash
npm ci
```

Clean install from `package-lock.json` for deterministic builds. `GITHUB_TOKEN` is used with `packages: read` permission (inherited from the job's `contents: read` scope) to authenticate with [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).

> **Cross-repo `@teqbench` dependencies:** For packages that depend on other `@teqbench` packages, each dependency package must grant the consuming repository read access in its package settings (**[GitHub Packages ↗](https://github.com/orgs/teqbench/packages) → Manage access**). This applies to the entire transitive dependency tree, not just direct dependencies. Without this, `npm ci` will fail with `403 Forbidden`.

#### 6. Audit Dependencies

```bash
npm audit --audit-level=high
```

Fails the build on high or critical severity vulnerabilities. Runs immediately after install — if the dependency tree has a known vulnerability, there's no point running the rest of the pipeline.

#### 7. Check Formatting

```bash
npm run format:check
```

Runs `prettier --check .` against all tracked files. Also enforced locally via the [Husky ↗](https://typicode.github.io/husky/) `pre-commit` hook — the CI step is the safety net.

#### 8. TypeScript Check

```bash
npm run typecheck
```

Full type-check (`tsc --noEmit`) without emitting output.

#### 9. Lint

```bash
npm run lint
```

Runs [ESLint ↗](https://eslint.org/) with the flat config (`eslint.config.js`).

#### 10. Run Tests with Coverage

```bash
npm run test:coverage
```

Runs `vitest run --coverage`, enforcing the coverage thresholds configured in `vitest.config.ts`:

- 80% lines, functions, and statements
- 75% branches
- Per-file enforcement (`perFile: true`)

#### 11. Evaluate Metrics

Extracts badge data from test output for the gist push steps:

- **Coverage:** reads `coverage/coverage-summary.json`, extracts line coverage percentage, sets color to `brightgreen` (≥80%) or `yellow` (<80%)
- **Tests:** reads `report.json`, extracts passed/total/failed counts, sets color to `brightgreen` (all pass) or `red` (any failures)
- **Version:** reads from `.release-please-manifest.json` (preferred) or `package.json`

#### 12. Check README Version Drift

Compares the [TypeScript ↗](https://www.typescriptlang.org/) and [Node.js ↗](https://nodejs.org/) versions in `README.md`'s compatibility table against `package.json`. Fails the build if they don't match, preventing documentation drift after dependency updates.

#### 13. Build

```bash
npm run build
```

Compiles [TypeScript ↗](https://www.typescriptlang.org/) to `dist/` using `tsconfig.build.json`.

#### 14–18. Push Badge Data to Gist

Five badges are pushed as JSON to a shared public GitHub Gist using `schneegans/dynamic-badges-action@v1.7.0`. [Shields.io ↗](https://shields.io) reads the JSON and renders the badges dynamically. Only runs on **push events** (not PRs).

<dl>
    <dt>Coverage</dt>
    <dd>Style: <code>for-the-badge</code>. Source: <code>coverage-summary.json</code> (lines pct). Gist filename: <code>{repo}-{branch}-coverage.json</code>.</dd>
    <dt>Tests</dt>
    <dd>Style: <code>for-the-badge</code>. Source: <code>report.json</code> (passed/total counts). Gist filename: <code>{repo}-{branch}-tests.json</code>.</dd>
    <dt>Build Status</dt>
    <dd>Style: <code>for-the-badge</code>. Source: <code>job.status</code> (success/failure). Gist filename: <code>{repo}-{branch}-build-status.json</code>.</dd>
    <dt>Build Number</dt>
    <dd>Style: <code>for-the-badge</code>. Source: <code>github.run_number</code>. Gist filename: <code>{repo}-{branch}-build-number.json</code>.</dd>
    <dt>Version</dt>
    <dd>Style: <code>for-the-badge</code>. Source: <code>.release-please-manifest.json</code> or <code>package.json</code>. Gist filename: <code>{repo}-{branch}-version.json</code>.</dd>
</dl>

All badge steps run with `if: always()` so badges update even on failure. The `schneegans/dynamic-badges-action` creates gist files automatically if they don't exist — no manual gist setup is needed per repository.

---

## Environment Variables

<dl>
    <dt><code>GIST_OWNER</code></dt>
    <dd>Value: <code>teqbench-shields-bot</code>. GitHub account that owns the shared badge gist.</dd>
    <dt><code>REPO_NAME</code></dt>
    <dd>Value: <code>github.event.repository.name</code>. Derived automatically — used to prefix gist filenames.</dd>
</dl>

---

## Badge Rendering

Badges are rendered by [Shields.io ↗](https://shields.io) endpoint badges. The URL format is:

```
https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/{GIST_OWNER}/{GIST_ID}/raw/{REPO_NAME}-{BRANCH}-{badge}.json
```

The gist stores JSON files matching the [Shields.io ↗](https://shields.io) endpoint schema:

```json
{
    "schemaVersion": 1,
    "label": "coverage",
    "message": "100%",
    "color": "brightgreen",
    "style": "for-the-badge"
}
```

[Shields.io ↗](https://shields.io) caches responses for ~5 minutes. After a CI run, badges may take a few minutes to reflect new data.
