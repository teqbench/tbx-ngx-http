# CLAUDE.md

This file provides guidance for Claude Code when working in this repository.

## Package Overview

This is `@teqbench/tbx-ngx-http`, an Angular library providing base HTTP communication services and resilience constants. It offers an abstract `TbxNgxHttpService` that feature services extend to get automatic retries with exponential backoff on GET requests, timeout handling, consistent URL resolution, and default headers. Resilience constants (`TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS`, `TBX_NGX_HTTP_RETRY_COUNT`, `TBX_NGX_HTTP_RETRY_DELAY_MS`, `TBX_NGX_HTTP_RETRYABLE_STATUSES`) are exported for direct use.

## Tech Stack

- **Language:** [TypeScript ↗](https://www.typescriptlang.org/) 5.9+ (strict mode, [ES2022 ↗](https://262.ecma-international.org/13.0/) target, bundler module resolution)
- **Testing:** [Vitest ↗](https://vitest.dev/) (globals enabled)
- **Linting:** [ESLint ↗](https://eslint.org/) flat config with typescript-eslint
- **Formatting:** [Prettier ↗](https://prettier.io/) (enforced via pre-commit hook and CI)
- **Git Hooks:** [Husky ↗](https://typicode.github.io/husky/) + [lint-staged ↗](https://github.com/okonet/lint-staged)
- **Versioning:** [Release Please ↗](https://github.com/googleapis/release-please) ([Conventional Commits ↗](https://conventionalcommits.org/))
- **Registry:** [GitHub Packages ↗](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages) (`@teqbench` scope)

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
- **Build tooling:** [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) is used to build [Angular Package Format ↗](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/edit) (APF) output. It uses bundler module resolution internally, so source files use extensionless relative imports (e.g., `'./foo.service'`). The `ng-package.json` at the repo root configures the entry point and output directory. ng-packagr generates its own `package.json` inside `dist/` with the correct APF entry points (`module`, `types`, `exports`). The release workflow publishes from `dist/` (`npm publish ./dist`) so consumers resolve against ng-packagr's `package.json` directly — the root `package.json` does not need `main`, `types`, or `exports` fields.

## [TSDoc ↗](https://tsdoc.org/) Convention

All exported TypeScript declarations must have TSDoc comments validated by `eslint-plugin-tsdoc`. Custom tags are defined in `tsdoc.json` and consumed downstream by [API Extractor ↗](https://api-extractor.com/) and the AI HTML documentation generator.

### Standard Tags (always use)

- `@remarks` — Extended description, separated from the summary line.
- `@typeParam` — Document generic type parameters (not `@template`).
- `@param` — Document function/method parameters.
- `@returns` — Document return values.
- `@example` — Code examples in fenced TypeScript blocks.
- `@public` / `@internal` — Release tag on every export. Use `@public` unless the export is not part of the package API surface.
- `@packageDocumentation` — Required on every barrel file (`index.ts`) to describe the package entry point. Use `{@link ExportName}` to cross-reference primary exports.
- `@see` — Reference to related external resources or docs.
- `@deprecated` — Mark deprecated APIs with migration guidance.

### Custom Tags

- `@category` — Group exports by domain for navigation and table-of-contents generation (e.g., "Models", "Services", "Utilities", "Pipes", "Guards"). Repeatable — an export can belong to multiple categories (e.g., "Models", "Foundational", "Interface").
- `@since` — The package version when the export was first introduced (e.g., "1.0.0"). Allows the docs generator to render version badges and filter by release.
- `@related` — Cross-reference to a related export, optionally in another `@teqbench` package (e.g., "TbxAuthService" or "@teqbench/tbx-auth#TbxAuthService"). Repeatable — use one `@related` tag per reference.
- `@usage` — Prose description of when and why to use this export, distinct from `@example` which shows code. Helps the AI generator produce contextual KB articles rather than raw API listings.
- `@displayName` — Human-friendly label used as the heading in generated docs (e.g., "Base Model" for `TbxModel`). When omitted, the export name is used as-is.
- `@order` — Numeric sort hint controlling display sequence. Applied at two levels:
    - Top-level exports: controls display sequence within a `@category` on generated pages.
    - Members (properties, methods): controls display sequence within the parent class/interface page. Members without `@order` are sorted by precedence group (see Member Ordering below), then alphabetically.

### Member Ordering

The documentation generator groups and sorts members within a class or interface page using the following precedence. Within each group, members are sorted by `@order` (lowest first), then alphabetically.

1. Constructor(s)
2. Identity properties (named `id`)
3. Required readonly properties
4. Required mutable properties
5. Optional properties
6. Abstract methods
7. Public methods
8. Protected methods
9. Static members
10. Events / callbacks
11. Deprecated members

Add `@order` to any member where alphabetical sorting within its group produces the wrong result. Common cases:

- `id` should appear before `createdAt` and `updatedAt` — give `id` `@order 1`.
- Lifecycle-related properties should appear in logical sequence — use `@order` to enforce creation-before-update ordering.

### Comment Structure

Top-level exports:

````typescript
/**
 * Summary line — one sentence, no period
 *
 * @remarks
 * Extended description. Multiple paragraphs allowed.
 *
 * @typeParam T - Description of the generic parameter.
 *
 * @usage
 * When and why to use this export.
 *
 * @example
 * ```typescript
 * // usage example
 * ```
 *
 * @category Models
 * @category Foundational
 * @displayName Base Model
 * @order 1
 * @since 1.0.0
 * @related OtherExport
 *
 * @public
 */
````

Member-level comment structure (properties, methods):

```typescript
/**
 * Summary line — one sentence, no period
 *
 * @remarks
 * Extended description if needed.
 *
 * @order 1
 *
 * @public
 */
```

### Tag Ordering

Follow this order within a TSDoc comment:

Top-level exports: summary line → `@remarks` → `@typeParam` / `@param` / `@returns` → `@usage` → `@example` → `@category` (repeatable) → `@displayName` → `@order` → `@since` → `@related` (repeatable) → `@public` / `@internal`

Members (properties, methods): summary line → `@remarks` → `@param` / `@returns` (methods only) → `@order` → `@public` / `@internal`

## Commit Convention

Follow **[Conventional Commits ↗](https://conventionalcommits.org/)** strictly:

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

- `TbxNgxHttpService` is abstract — it cannot be instantiated directly. Feature services extend it and provide a `baseUrl`.
- Only GET requests include the retry operator. Mutating methods (POST, PUT, PATCH, DELETE) intentionally skip retries.
- The retry operator uses exponential backoff: `RETRY_DELAY * 2^(attempt - 1)`.
- `TBX_NGX_HTTP_RETRYABLE_STATUSES` defines which HTTP status codes trigger retries (0, 408, 429, 500, 502, 503, 504).
- Dependencies: `@angular/common` (HttpClient), `@angular/core` (inject), `rxjs`, `http-status-codes`.
