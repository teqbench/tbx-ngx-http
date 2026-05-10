# CLAUDE.md

This file provides guidance for [Claude Code ↗](https://github.com/anthropics/claude-code) when working in this repository.

## Package Overview

This is `@teqbench/tbx-ngx-http`, an [Angular ↗](https://angular.dev) library providing base HTTP communication services and resilience constants. It offers an abstract `TbxNgxHttpService` that feature services extend to get automatic retries with exponential backoff (on GET by default, on mutating methods via `options.retry: true`), timeout handling, consistent URL resolution, and default headers. Resilience constants (`TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS`, `TBX_NGX_HTTP_RETRY_COUNT`, `TBX_NGX_HTTP_RETRY_DELAY_MS`, `TBX_NGX_HTTP_RETRYABLE_STATUSES`) are exported for direct use.

## Tech Stack

- **Language:** [TypeScript ↗](https://www.typescriptlang.org) 5.9+ (strict mode, [ES2022 ↗](https://262.ecma-international.org/13.0/) target, bundler module resolution)
- **Testing:** [Vitest ↗](https://vitest.dev) (globals enabled)
- **Linting:** [ESLint ↗](https://eslint.org) flat config with typescript-eslint
- **Formatting:** [Prettier ↗](https://prettier.io) (enforced via pre-commit hook and CI)
- **Git Hooks:** [Husky ↗](https://typicode.github.io/husky/) + [lint-staged ↗](https://github.com/lint-staged/lint-staged)
- **Versioning:** [Release Please ↗](https://github.com/googleapis/release-please) ([Conventional Commits ↗](https://www.conventionalcommits.org))
- **Registry:** [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) (`@teqbench` scope)

## Key Commands

- `npm ci` — Install dependencies (use this, not `npm install`)
- `npm run build` — Compile [TypeScript ↗](https://www.typescriptlang.org) to `dist/`
- `npm test` — Run tests with [Vitest ↗](https://vitest.dev)
- `npm run test:coverage` — Run tests with coverage enforcement (used in CI)
- `npm run typecheck` — Full [TypeScript ↗](https://www.typescriptlang.org) type-check (`tsc --noEmit`)
- `npm run lint` — Run [ESLint ↗](https://eslint.org)
- `npm run format` — Format all files with [Prettier ↗](https://prettier.io)
- `npm run format:check` — Check formatting (CI mode)

## Project Structure

- `src/` — Source code (all `.ts` files live here)
- `src/index.ts` — Barrel file (public API exports)
- `dist/` — Compiled output (git-ignored, only this directory is published)
- `docs/` — Per-package docs pipeline inputs (`overview.md`, `concepts.yml`, `features.yml`, `accessibility.md`) used to build the README and published with the package via `ng-package.json` assets. Also contains `reference/workflows/` describing each CI/CD pipeline.
- `.github/workflows/` — CI/CD pipelines (ci, release, sync, dep-compat-check, claude)
- Dependency updates run centrally via [Renovate ↗](https://docs.renovatebot.com/) (org-level workflow + `renovate-config.js` in `teqbench/.github`); no per-repo config is required

## Publishing

- Packages are published to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) (`@teqbench` scope) via the release workflow.
- Coverage thresholds are enforced in CI: 80% lines/functions/statements, 75% branches, per file.
- **Build tooling:** [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) is used to build [Angular Package Format ↗](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/edit) (APF) output. It uses bundler module resolution internally, so source files use extensionless relative imports (e.g., `'./foo.service'`). The `ng-package.json` at the repo root configures the entry point and output directory. [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) generates its own `package.json` inside `dist/` with the correct APF entry points (`module`, `typings`, `exports`). The release workflow publishes from `dist/` (`npm publish ./dist`) so consumers resolve against [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr)'s `package.json` directly — the root `package.json` does not need `main`, `types`, or `exports` fields.

## TSDoc Convention

All exported [TypeScript ↗](https://www.typescriptlang.org) declarations must have [TSDoc ↗](https://tsdoc.org) comments validated by `eslint-plugin-tsdoc`. Custom tags are defined in `tsdoc.json` and consumed downstream by [API Extractor ↗](https://api-extractor.com) and the AI HTML documentation generator.

### Standard Tags (always use)

- `@remarks` — Extended description, separated from the summary line.
- `@typeParam` — Document generic type parameters (not `@template`).
- `@param` — Document function/method parameters.
- `@returns` — Document return values. Omit for `void` returns.
- `@example` — Code examples in fenced [TypeScript ↗](https://www.typescriptlang.org) blocks.
- `@public` / `@internal` — Release tag on every export. Use `@public` unless the export is not part of the package API surface.
- `@packageDocumentation` — Required on every barrel file (`index.ts`) to describe the package entry point. Use `{@link ExportName}` to cross-reference primary exports.
- `@see` — Reference to related external resources or docs.
- `@deprecated` — Mark deprecated APIs with migration guidance.

### Custom Tags

- `@category` — Group exports by domain for navigation and table-of-contents generation (e.g., "Models", "Services", "Utilities", "Pipes", "Guards"). Repeatable — an export can belong to multiple categories (e.g., "Models", "Foundational", "Interface").
- `@since` — The package version when the export was first introduced (e.g., "1.0.0"). Allows the docs generator to render version badges and filter by release.
- `@related` — Cross-reference to a related export, optionally in another `@teqbench` package (e.g., "TbxAuthService" or "@teqbench/tbx-auth#TbxAuthService"). Repeatable — use one `@related` tag per reference.
- `@usage` — Prose description of when and why to use this export, distinct from `@example` which shows code. Helps the AI generator produce contextual KB articles rather than raw API listings.
- `@displayName` — Human-friendly label used as the heading in generated docs (e.g., "Base Domain Entity Model" for `TbxDomainEntityModel`). When omitted, the export name is used as-is.
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

Follow this order within a [TSDoc ↗](https://tsdoc.org) comment:

Top-level exports:

summary line
@remarks
@typeParam / @param / @returns
@usage
@example
@category (repeatable)
@displayName
@order
@since
@related (repeatable)
@public / @internal

Members (properties, methods):

summary line
@remarks
@param / @returns (methods only)
@order
@public / @internal

### Reference Implementation

`@teqbench/tbx-models` (a separate repository) `src/models/domain-entity.model.ts` is the reference for a fully migrated [TSDoc ↗](https://tsdoc.org) comment on an interface with member-level docs including `@order` tags. `src/index.ts` in that same package is the reference for a `@packageDocumentation` barrel file [TSDoc ↗](https://tsdoc.org) comment. These files are not accessible from this repository — clone `@teqbench/tbx-models` separately to view them.

### Verification

After migration, run `npm run lint` and confirm no `tsdoc/syntax` warnings. Run `npm run format:check` and `npm test` to ensure nothing broke.

## External Linking Convention

Every prose mention of an external specification, standard, or technology in documentation must be hyperlinked to its official source. This applies to all markdown files (.md) and all [TSDoc ↗](https://tsdoc.org) comments in [TypeScript ↗](https://www.typescriptlang.org) source files (.ts). Exclude CHANGELOG.md, git submodules, and build output directories.

### Format

- **Markdown:** `[Name ↗](url)` with the ↗ (U+2197) character inside the link text for external resources. Internal/relative links do not use ↗.
- **[TSDoc ↗](https://tsdoc.org):** `{@link url | Name}` inline syntax in every section where an external technology appears — summary, `@remarks`, `@usage`, `@param`, `@returns`, and member-level docs. For each distinct external resource referenced in a top-level export's summary, add a `@see {@link url | Name}` tag in the tag section.

### Rules

- Link to the official specification or project homepage, not Wikipedia or third-party summaries.
- Use canonical names (e.g., "ISO 8601" not "ISO-8601").
- Internal references and cross-references to other `@teqbench` packages use relative links or `{@link ExportName}` without ↗.
- Link every prose mention, not just the first occurrence per document.
- Do not place links inside backtick code spans or section headings.
- License references link to the project's own LICENSE file using a relative path, without ↗.
- [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) links use the org packages page, not the generic feature page.
- Project-specific service instances (badge gist, org packages page, issue templates) link to the actual instance URL, not the generic service homepage. Discover URLs from README badge URLs, workflow files, `package.json`, and config files.

### SECURITY.md Reporting Channel

- **Private repository:** Email link (`[info@teqbench.dev](mailto:info@teqbench.dev)`). GitHub Private vulnerability reporting is not available without GitHub Advanced Security.
- **Public repository:** [GitHub Private vulnerability reporting ↗](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) via `/security/advisories/new`. Enable at the org level if available, otherwise at the repo level.
- When transitioning a repo from private to public, update SECURITY.md to switch from email to the advisory URL.

### README Requirements

The README must have a "Feedback" section immediately above "License" with links to Bug Report and Feature Request issue templates using the `issues/new?template=` URL pattern.

## AI Friendliness Convention

All [TSDoc ↗](https://tsdoc.org) comments, inline code comments, and markdown files must be written for AI consumption — documentation generators, code assistants, and retrieval-augmented generation systems parse these to answer questions, generate docs, or suggest code.

### Disambiguation

- Every `{@link ExportName}` must resolve to an export in the current package. References to external types must include a full URL: `{@link https://angular.dev/api/core/ClassName | ClassName}`.
- Barrel file grouping comments (e.g., `// Models`, `// Services`) must match the `@category` tags on the exports they group.
- `@category Interface` is reserved for [TypeScript ↗](https://www.typescriptlang.org) `interface` declarations. Abstract classes serving as DI tokens or extension points use `@category Contract`.

### Context Completeness

- Do not imply auto-registration. If consumers must explicitly provide an implementation via DI, say so. Do not write "default implementation" without clarifying that no provider is registered automatically.
- Optional fields the pipeline never populates must state that explicitly (e.g., "the pipeline never sets this field; set it when constructing a context manually").
- Methods with error-handling behavior (try/catch, swallowing, fallback) must document it in `@remarks`.
- Hypothetical class names in `@example` blocks must include a comment identifying them as consumer-defined placeholders (e.g., `// SentryErrorLogger is a hypothetical consumer-defined subclass`).
- References to files or configurations in other repositories must note they are external and not accessible from the current repo.

### Structural Consistency

- Every exported class and function must have an `@example` tag.
- Do not duplicate the same URL in both an inline `{@link}` and a `@see` tag on the same member.
- `@internal` members must have a summary line before the tag.
- `@returns` is required for non-void returns; omit for `void`.
- Summary lines must lead with the primary action matching the export name (e.g., `logClientError` summarizes as "Log a manually caught error..." not "Build a structured error context...").

### Semantic Clarity

- Do not use terms with established technical meanings in unintended ways (e.g., "side-effect pattern" for fan-out, "structured output" for human-readable console logging).
- Do not reference concepts or patterns that do not exist in the codebase.
- Coverage pragmas (`/* v8 ignore next */`) and other non-obvious annotations must be documented in this file (see Publishing section).
- Configuration snapshots in documentation must note they are examples that may not reflect the current state.
- Custom `package.json` metadata fields (not defined by the [npm ↗](https://www.npmjs.com) spec) must be identified as custom where referenced.

## Markdown Tables Convention

Avoid `<table>` and pipe-syntax tables in markdown files (`README.md`, `CHANGELOG.md`, guides, etc.). Use a `<dl>`/`<dt>`/`<dd>` definition list instead.

- **Why.** [GitHub ↗](https://github.com/) doesn't honor any column-width controls in rendered markdown — `<col>`, `width=` attributes, and CSS in `<style>` blocks are all stripped. Multi-column tables wrap unpredictably across viewport sizes and look inconsistent between repos. Definition lists give the same name → description shape with predictable single-column flow that renders the same everywhere [GitHub ↗](https://github.com/) previews markdown.

- **Pattern.**

    ```html
    <dl>
        <dt><a href="https://example.com">Item name ↗</a></dt>
        <dd>One-line description of the item.</dd>
        <dt>Next item</dt>
        <dd>Its description.</dd>
    </dl>
    ```

    See `profile/README.md` in `teqbench/.github` (a separate repository — not accessible from this repo) for the canonical example used on the TeqBench organization profile page.

- **When tables are still acceptable.** Only inside source code that emits HTML to a non-[GitHub ↗](https://github.com/) renderer ([Storybook ↗](https://storybook.js.org/) docs pages rendered via [MDX ↗](https://mdxjs.com/), the website's own `<tbx-markdown>` walker, etc.) — those have full control over column widths. Anything that lands in a `.md` file rendered by [GitHub ↗](https://github.com/) itself follows the `<dl>` rule.

## Commit Convention

Follow **[Conventional Commits ↗](https://www.conventionalcommits.org)** strictly:

- `feat(scope): ...` — New feature (minor bump)
- `fix(scope): ...` — Bug fix (patch bump)
- `feat(scope)!: ...` — Breaking change (major bump)
- `docs(scope): ...` — Documentation
- `refactor(scope): ...` — Refactor
- `chore(scope): ...` — Maintenance

### No Bare At-Prefixed Tokens

Do not write the at-symbol followed by a non-slashed identifier in commit subjects or bodies. The release-please changelog renderer ([conventional-changelog-conventionalcommits ↗](https://github.com/conventional-changelog/conventional-changelog) v6 `writerOpts.transform`) rewrites such tokens as broken GitHub user-mention links, splitting version strings into links to non-existent users.

- Version refs: write `v2.9.3`, not preceded by the at-symbol.
- Scope/org refs in prose: write `teqbench`, not preceded by the at-symbol.
- TSDoc tag refs in prose: write `related`, `example`, `since`, `category`, `returns`, `link` — not preceded by the at-symbol.
- Fully-qualified scoped package paths that contain a forward slash remain safe; the renderer short-circuits them.

Markdown formatting does not escape this rewrite: backticks and code spans in commit messages do not protect.

## Branching & Workflow

- `main` — Production. Only receives merges from `release/*`, `hotfix/*`, or `release-please--*` branches.
- `dev` — Integration branch. Receives merges from `feature/*` and `bugfix/*` branches.
- Create feature/bugfix branches off `dev`, PR back to `dev`.
- Use `release/*` branches to carry `dev` to `main`.
- Use `hotfix/*` branches off `main` for urgent fixes.

### What Claude Should Do

- Create feature or bugfix branches off `dev` when implementing issues.
- Write clean, well-tested code that passes lint, typecheck, and tests.
- Use [Conventional Commits ↗](https://www.conventionalcommits.org) messages.
- Create PRs targeting `dev` (never directly target `main`).
- Keep PRs focused and atomic — one issue per PR.

### What Claude Should NOT Do

- Never push directly to `main` or `dev`.
- Never force-push to any branch.
- Never delete branches.
- Never modify CI workflow files without explicit instruction.
- Never modify `release-please-config.json`, `.release-please-manifest.json`, or `CHANGELOG.md`.
- Never modify secrets, tokens, or files containing them. Secrets are defined at the organization level on [GitHub ↗](https://github.com/); repo-local code should reference them by name only and never read or rewrite their values.
- Never commit content intended to be private, regardless of repository visibility. Treat every commit as if the repo could become public.

## Package-Specific Guidance

- `TbxNgxHttpService` is abstract — it cannot be instantiated directly. Feature services extend it and provide a `baseUrl`.
- GET retries by default; POST, PUT, PATCH, and DELETE skip retry by default. Either default can be overridden per call with `options.retry`.
- The retry operator uses exponential backoff: `RETRY_DELAY * 2^(attempt - 1)`.
- `TBX_NGX_HTTP_RETRYABLE_STATUSES` defines which HTTP status codes trigger retries (0, 408, 429, 500, 502, 503, 504).
- Dependencies: `@angular/common` (HttpClient), `@angular/core` (inject), `rxjs`, `http-status-codes`.
