# CLAUDE.md

This file provides guidance for Claude Code when working in this repository.

## Package Overview

This is `@teqbench/tbx-ngx-http`, an Angular library providing base HTTP communication services and resilience constants. It offers an abstract `BaseHttpService` that feature services extend to get automatic retries with exponential backoff on GET requests, timeout handling, consistent URL resolution, and default headers. Resilience constants (`HTTP_DEFAULT_TIMEOUT_MS`, `HTTP_RETRY_COUNT`, `HTTP_RETRY_DELAY_MS`, `HTTP_RETRYABLE_STATUSES`) are exported for direct use.

## Tech Stack

- **Language:** TypeScript 5.9+ (strict mode, ES2022 target, bundler module resolution)
- **Testing:** Vitest (globals enabled)
- **Linting:** ESLint flat config with typescript-eslint
- **Formatting:** Prettier (enforced via pre-commit hook and CI)
- **Git Hooks:** Husky + lint-staged
- **Versioning:** Release Please (Conventional Commits)
- **Registry:** GitHub Packages (`@teqbench` scope)

## Key Commands

- `npm ci` — Install dependencies (use this, not `npm install`)
- `npm run build` — Compile TypeScript to `dist/`
- `npm test` — Run tests with Vitest
- `npm run test:coverage` — Run tests with coverage enforcement (used in CI)
- `npm run typecheck` — Full TypeScript type-check (`tsc --noEmit`)
- `npm run lint` — Run ESLint
- `npm run format` — Format all files with Prettier
- `npm run format:check` — Check formatting (CI mode)

## Project Structure

- `src/` — Source code (all `.ts` files live here)
- `src/index.ts` — Barrel file (public API exports)
- `dist/` — Compiled output (git-ignored, only this directory is published)
- `docs/` — Documentation (placeholder for package-specific guides)
- `.github/workflows/` — CI/CD pipelines (ci, release, sync, dep-compat-check, claude)
- `.github/dependabot.yml` — Automated dependency update PRs targeting `dev`

## Publishing

- Packages are published to GitHub Packages (`@teqbench` scope) via the release workflow.
- Coverage thresholds are enforced in CI: 80% lines/functions/statements, 75% branches, per file.
- **Build tooling:** ng-packagr is used to build Angular Package Format (APF) output. It uses bundler module resolution internally, so source files use extensionless relative imports (e.g., `'./foo.service'`). The `ng-package.json` at the repo root configures the entry point and output directory. ng-packagr generates its own `package.json` inside `dist/` with the correct APF entry points (`module`, `types`, `exports`). The release workflow publishes from `dist/` (`npm publish dist`) so consumers resolve against ng-packagr's `package.json` directly — the root `package.json` does not need `main`, `types`, or `exports` fields.

## Commit Convention

Follow **Conventional Commits** strictly:

- `feat(scope): ...` — New feature (minor bump)
- `fix(scope): ...` — Bug fix (patch bump)
- `feat(scope)!: ...` — Breaking change (major bump)
- `docs(scope): ...` — Documentation
- `refactor(scope): ...` — Refactor
- `chore(scope): ...` — Maintenance

## Branching & Workflow

- `main` — Production. Only receives merges from `release/*`, `hotfix/*`, or `release-please--*` branches.
- `dev` — Integration branch. Receives merges from `feature/*` and `bugfix/*` branches.
- Create feature/bugfix branches off `dev`, PR back to `dev`.
- Use `release/*` branches to carry `dev` to `main`.
- Use `hotfix/*` branches off `main` for urgent fixes.

### What Claude Should Do

- Create feature or bugfix branches off `dev` when implementing issues.
- Write clean, well-tested code that passes lint, typecheck, and tests.
- Use conventional commit messages.
- Create PRs targeting `dev` (never directly target `main`).
- Keep PRs focused and atomic — one issue per PR.

### What Claude Should NOT Do

- Never push directly to `main` or `dev`.
- Never force-push to any branch.
- Never delete branches.
- Never modify CI workflow files without explicit instruction.
- Never modify `release-please-config.json`, `.release-please-manifest.json`, or `CHANGELOG.md`.

## Package-Specific Guidance

- `BaseHttpService` is abstract — it cannot be instantiated directly. Feature services extend it and provide a `baseUrl`.
- Only GET requests include the retry operator. Mutating methods (POST, PUT, PATCH, DELETE) intentionally skip retries.
- The retry operator uses exponential backoff: `RETRY_DELAY * 2^(attempt - 1)`.
- `HTTP_RETRYABLE_STATUSES` defines which HTTP status codes trigger retries (0, 408, 429, 500, 502, 503, 504).
- Dependencies: `@angular/common` (HttpClient), `@angular/core` (inject), `rxjs`, `http-status-codes`.
