# Contributing

## Prerequisites

### Node.js

Install the version specified in `.nvmrc` (Node 24+). If you use nvm:

```bash
nvm install
nvm use
```

### GitHub Packages Authentication

This package depends on `@teqbench` scoped packages hosted on GitHub Packages. To install them locally, you need a GitHub personal access token (PAT) with `read:packages` scope.

1. Create a PAT at **GitHub > Settings > Developer settings > Personal access tokens** with `read:packages` scope
2. Add it to your shell profile (`~/.zshrc` or `~/.bashrc`):
    ```bash
    export GITHUB_TOKEN=ghp_yourTokenHere
    ```
3. Add the auth line to your **user-level** `~/.npmrc` (not the repo `.npmrc`):
    ```
    //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
    ```
4. Open a new terminal (or `source ~/.zshrc`) and verify: `npm ci`

The repo `.npmrc` already configures the `@teqbench` scope to use GitHub Packages. The `~/.npmrc` auth line tells npm how to authenticate. CI handles this separately via `actions/setup-node`.

#### Cross-repo package access (CI)

If this package depends on other `@teqbench` packages, each package in the entire dependency tree (direct and transitive) must grant this repository read access on GitHub. For each `@teqbench` package, go to **github.com/orgs/teqbench/packages/npm/\<package-name\>/settings → Manage access**, add this repository, and set the role to **Read**. GitHub Packages has its own access control layer — repository and app permissions alone are not sufficient. Without this, CI will fail with `403 Forbidden` during `npm ci`. For example, if this package depends on `tbx-mat-severity-icons` which depends on `tbx-mat-icons`, you must grant read access on both packages.

## Tech Stack

- **Language:** [TypeScript](https://www.typescriptlang.org) 5.9+
- **Testing:** [Vitest](https://vitest.dev)
- **Linting:** [ESLint](https://eslint.org) (Flat Config)
- **Formatting:** [Prettier](https://prettier.io) (enforced via pre-commit hook and CI)
- **Git Hooks:** Husky + lint-staged (runs Prettier on staged files before every commit)
- **Versioning:** [Release Please](https://github.com/googleapis/release-please) (Conventional Commits)

## Key Commands

- `npm ci` — Install dependencies (use this, not `npm install`)
- `npm run build` — Build the package
- `npm test` — Run tests
- `npm run test:coverage` — Run tests with coverage enforcement
- `npm run typecheck` — Full TypeScript type-check
- `npm run lint` — Run ESLint checks
- `npm run format` — Format all files with Prettier
- `npm run format:check` — Check formatting without writing (used in CI)

## Commit Convention

Follow **[Conventional Commits](https://www.conventionalcommits.org)** strictly. Release Please uses these to determine version bumps.

- `feat(scope): ...` — New feature (minor version bump)
- `fix(scope): ...` — Bug fix (patch version bump)
- `feat(scope)!: ...` or `BREAKING CHANGE:` — Breaking change (major version bump)
- `docs(scope): ...` — Documentation changes
- `refactor(scope): ...` — Code changes that neither fix a bug nor add a feature
- `chore(scope): ...` — Maintenance (no version bump)

## Branching & Workflow

### Branch Structure

- `main` — Production. Protected. Only receives merges from `release/*`, `hotfix/*`, or `release-please--*` branches.
- `dev` — Integration branch. Protected. Receives merges from feature and bugfix branches.
- `feature/*` — New features. Branch from `dev`, merge back to `dev` via PR.
- `bugfix/*` — Bug fixes. Branch from `dev`, merge back to `dev` via PR.
- `release/*` — Release preparation. Branch from `dev`, merge `main` into it to resolve conflicts, then PR to `main`.
- `hotfix/*` — Urgent production fixes. Branch from `main`, merge `main` into it before PR to ensure clean merge, then PR to `main`.

### Rules

- All merges to `main` and `dev` require a pull request.
- Direct pushes to `main` and `dev` are blocked (except for the automation bot).
- CI must pass before a PR can be merged.
- Release and hotfix branches must merge `main` into themselves before opening a PR to `main` — this resolves badge conflicts and ensures CI validates the combined state.
- After a release merges to `main`, the sync workflow automatically merges `main` back into `dev`.

## PR Process

1. Branch from `dev` (or `main` for hotfixes)
2. Make changes following the conventions above
3. Ensure all checks pass: `npm run format:check && npm run typecheck && npm run lint && npm run test:coverage && npm run build`
4. Open a PR targeting `dev`
5. Address review feedback
6. Merge after CI passes and approval is granted

## Release Process

1. Create a `release/*` branch from `dev`
2. Merge `main` into the release branch to resolve any conflicts (especially badge files)
3. Open a PR from the release branch to `main`
4. After merge, Release Please opens a version bump PR on `main`
5. Merge the Release Please PR to trigger a GitHub Release and publish to GitHub Packages
6. The sync workflow automatically merges `main` back into `dev`

For details on how the CI/CD pipelines work, see [docs/reference/workflows/](docs/reference/workflows/).
