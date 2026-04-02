# CI Workflow — `ci.yml`

**Full name:** TeqBench Package - CI Workflow
**File:** `.github/workflows/ci.yml`

---

## Purpose

The CI workflow is the quality gate for the repository. It runs formatting checks, type checking, linting, tests with coverage enforcement, dependency auditing, and README version drift detection on every push and pull request to `main` and `dev`. After a successful push (not PR), it pushes badge data to a shared [GitHub Gist ↗](https://gist.github.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4) and updates the README with branch-specific [Shields.io ↗](https://shields.io) badge URLs.

---

## Triggers

| Event          | Branches      | Behavior                        |
| -------------- | ------------- | ------------------------------- |
| `push`         | `main`, `dev` | Full pipeline + badge gist push |
| `pull_request` | `main`, `dev` | Full pipeline, no badge updates |

---

---

## Concurrency

```yaml
group: ci-${{ github.repository }}-${{ github.ref }}
cancel-in-progress: false
```

Per-branch isolation: CI on `main` and `dev` run independently. Runs on the same branch queue sequentially (no cancellation).

---

## Secrets & Variables

| Name              | Type     | Scope | Purpose                                      |
| ----------------- | -------- | ----- | -------------------------------------------- |
| `APP_ID`          | Secret   | Repo  | GitHub App ID for generating a bot token     |
| `APP_PRIVATE_KEY` | Secret   | Repo  | GitHub App private key                       |
| `GIST_TOKEN`      | Secret   | Org   | PAT with `gist` scope for pushing badge data |
| `GIST_ID`         | Variable | Org   | ID of the shared public badge gist           |

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

This step is conditioned on `github.actor != 'dependabot[bot]'` and is **skipped entirely** on [Dependabot ↗](https://docs.github.com/en/code-security/dependabot) PRs. The app secrets are intentionally unavailable to Dependabot — GitHub isolates Dependabot from repository secrets as a security boundary.

#### 3. Checkout Code

```yaml
uses: actions/checkout@v4
with:
    submodules: ${{ github.actor != 'dependabot[bot]' }}
    token: ${{ steps.app-token.outputs.token || github.token }}
    fetch-depth: 0
```

Uses the app token when available. Falls back to `GITHUB_TOKEN` for [Dependabot ↗](https://docs.github.com/en/code-security/dependabot) PRs. Submodules (Claude Code skills) are checked out for non-Dependabot runs. `fetch-depth: 0` fetches full history.

#### 4. Setup Node

Reads the Node version from `.nvmrc` with npm cache enabled.

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

| Badge        | Style         | Source                                            | Gist Filename                       |
| ------------ | ------------- | ------------------------------------------------- | ----------------------------------- |
| Coverage     | for-the-badge | `coverage-summary.json` (lines pct)               | `{repo}-{branch}-coverage.json`     |
| Tests        | for-the-badge | `report.json` (passed/total counts)               | `{repo}-{branch}-tests.json`        |
| Build Status | for-the-badge | `job.status` (success/failure)                    | `{repo}-{branch}-build-status.json` |
| Build Number | for-the-badge | `github.run_number`                               | `{repo}-{branch}-build-number.json` |
| Version      | for-the-badge | `.release-please-manifest.json` or `package.json` | `{repo}-{branch}-version.json`      |

All badge steps run with `if: always()` so badges update even on failure. The `schneegans/dynamic-badges-action` creates gist files automatically if they don't exist — no manual gist setup is needed per repository.

---

## Environment Variables

| Variable     | Value                          | Purpose                                               |
| ------------ | ------------------------------ | ----------------------------------------------------- |
| `GIST_OWNER` | `teqbench-shields-bot`         | GitHub account that owns the shared badge gist        |
| `REPO_NAME`  | `github.event.repository.name` | Derived automatically — used to prefix gist filenames |

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
