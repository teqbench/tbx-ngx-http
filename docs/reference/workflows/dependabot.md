# Dependabot — `dependabot.yml`

**File:** `.github/dependabot.yml`

---

## Purpose

Automatically opens pull requests to update dependencies on a weekly schedule. PRs target the `dev` branch (not `main`) and use conventional commit message prefixes so they integrate cleanly with the release-please workflow.

---

## Schedule

Runs every **Monday**.

---

## Target Branch

All Dependabot PRs target **`dev`**, not `main`. This ensures dependency updates go through the standard PR review and CI pipeline before reaching production.

---

## Ecosystems

### npm Dependencies

| Setting           | Value          |
| ----------------- | -------------- |
| Package ecosystem | `npm`          |
| Directory         | `/`            |
| Commit prefix     | `chore(deps):` |
| Labels            | `dependencies` |

#### Grouping

Related packages are grouped into single PRs to reduce noise:

| Group        | Packages                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript` | `typescript`                                                                                                                                   |
| `tooling`    | `prettier`, `prettier-*`, `@prettier/*`, `husky`, `lint-staged`, `vitest`, `@vitest/*`, `eslint`, `eslint-*`, `@eslint/*`, `typescript-eslint` |

Ungrouped packages (e.g., `@types/node`) get individual PRs.

### GitHub Actions

| Setting           | Value                |
| ----------------- | -------------------- |
| Package ecosystem | `github-actions`     |
| Directory         | `/`                  |
| Commit prefix     | `chore(ci):`         |
| Labels            | `dependencies`, `ci` |

Updates action versions used in all workflow files (e.g., `actions/checkout@v4` to `@v5`).

---

## Interaction with Pinned Dependencies

Some dependencies are intentionally pinned without caret ranges (see `devDependenciesPinned` in `package.json`):

- **`typescript-eslint`** — pinned without `^` because patch releases have introduced breaking rule changes
- **`@types/node`** — pinned to `~24.0.0` to match the Node 24 runtime

Dependabot will still open PRs for these packages. Review them carefully and test before merging — the pinning is intentional and documented.

---

## CI Integration

Dependabot PRs trigger the CI workflow like any other PR. However, the CI workflow handles Dependabot specially:

- **App token generation is skipped** — Dependabot cannot access repository secrets
- **Submodule checkout is skipped** — Dependabot cannot access private submodules
- **Falls back to `GITHUB_TOKEN`** — sufficient for read-only validation (audit, lint, typecheck, test)
- **Badge commits are not generated** — badges only commit on push events, not PRs
