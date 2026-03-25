# Setup Checklist

Complete these steps after creating a new repository from this template, then delete this file.

## Using Claude Code

Open Claude Code in the new repository root and ask it to follow this checklist:

> Follow the setup checklist in SETUP.md to configure this package as `@teqbench/tbx-<name>` with description "<description>".

Claude Code will read this file automatically and work through the automated steps. It will prompt you when a manual step is needed.

## Steps

Steps marked **[auto]** can be performed by Claude Code. Steps marked **[manual]** require action in the GitHub UI or browser. Complete the manual steps first — they configure the infrastructure that CI and automation depend on.

### Pre-requisites (manual)

1. **[manual] Create the repository** from this template on GitHub
2. **[manual] Grant teqbench-automation app access:** go to **github.com/organizations/teqbench/settings/installations**, select the **teqbench-automation** app, and add the new repo to its repository access list (required for CI checkout, badge commits, sync, and release workflows)
3. **[manual] Add repo to org rulesets:** go to **github.com/organizations/teqbench/settings/rules** and add the new repo to the `main` and `dev` ruleset "Selected repositories" lists

### Package setup (automated)

> **Important:** All automated changes must be made on a `feature/*` branch off `dev`, then merged to `dev` via PR. Once merged, create a `release/*` branch from `dev`, merge `main` into it, and PR to `main`. Do not commit directly to `dev` or `main`. See CLAUDE.md and CONTRIBUTING.md for the full branching workflow.

4. **[auto] Reset versioning:** set `version` to `0.0.0` in `package.json`, both `version` fields in `package-lock.json`, and `.release-please-manifest.json`. Reset `CHANGELOG.md` to just `# Changelog` (remove all template changelog entries). This ensures the first release starts fresh.
5. **[auto] Update `package.json` and `package-lock.json`:** set `name` to `@teqbench/tbx-*` (or `tbx-ngx-*` / `tbx-mat-*`), set `description`, add any `dependencies` and `peerDependencies`. Update both `name` fields in `package-lock.json` to match.

    If the package depends on other `@teqbench` packages (listed in `dependencies` or `peerDependencies`), you must grant this repository read access to each `@teqbench` package in the entire dependency tree (direct and transitive) on GitHub. For each `@teqbench` package, go to **github.com/orgs/teqbench/packages/npm/\<package-name\>/settings → Manage access**, add the new repository, and set the role to **Read**. GitHub Packages has its own access control layer — repository and app permissions alone are not sufficient. Without this, CI will fail with `403 Forbidden` during `npm ci`. For example, if your package depends on `tbx-mat-severity-icons` which depends on `tbx-mat-icons`, you must grant read access on both packages.

6. **[auto] Update `release-please-config.json`:** set `package-name` to match `package.json` name
7. **[auto] Set up dependency compatibility tracking:** create a GitHub issue in the repo titled "Dependency Compatibility Tracking" to serve as the tracking epic. Some dependencies are intentionally pinned or ignored by Dependabot (e.g., `@types/node` is pinned to the Node runtime major, ESLint is blocked until Angular ESLint catches up). Dependabot won't track these — instead, the `dep-compat-check` workflow checks the npm registry daily and posts status comments on this epic issue. To track a specific dependency, create a sub-issue with `Part of #<epic>` and a `<!-- dep-compat ... -->` metadata block in the body (see [docs/reference/workflows/dep-compat-check.md](docs/reference/workflows/dep-compat-check.md) for the metadata format). After creating the issue, update `EPIC` in `.github/workflows/dep-compat-check.yml` with the issue number. Pin the issue to the top of the issue board for visibility.
8. **[auto] Update `README.md`:** replace the package name, description, install instructions, and usage example with the actual package details. Also replace `teqbench.dev.templates.tbx-package` in the badge URLs with the new repository name so badges point to the correct gist files.
9. **[auto] Update `CLAUDE.md`:** replace the TODO in the Package Overview with a description of what this package does
10. **[auto] Update `eslint.config.js`:** add Angular-specific rules if this is a `tbx-ngx-*` or `tbx-mat-*` package (skip for plain `tbx-*` packages)
11. **[auto] Configure Angular test infrastructure** (skip for plain `tbx-*` packages): this step sets up the Vitest + Angular compiler pipeline that Angular packages require for TestBed-based specs. Do NOT use manual `TestBed.initTestEnvironment()` — it breaks teardown with the plugin's `vmThreads` pool.
    - Create `src/test-setup.ts`:

        ```typescript
        import '@angular/compiler';
        import '@analogjs/vitest-angular/setup-snapshots';
        import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

        setupTestBed();
        ```

    - Create `tsconfig.spec.json` extending `tsconfig.json` with `include: ["src/**/*.spec.ts", "src/test-setup.ts"]`
    - Update `vitest.config.ts`: add `@analogjs/vite-plugin-angular` plugin with `jit: true` and `tsconfig: 'tsconfig.spec.json'`; set `environment: 'jsdom'` and `setupFiles: ['src/test-setup.ts']`
    - Update `tsconfig.json`: add `experimentalDecorators: true` and `emitDecoratorMetadata: true`
    - Update `tsconfig.build.json`: add `**/test-setup.ts` to excludes
    - Add Angular devDependencies: `@analogjs/vite-plugin-angular`, `@analogjs/vitest-angular`, `@angular/build`, `@angular/compiler`, `@angular/compiler-cli`, `@angular/platform-browser`, `angular-eslint`, `jsdom`, `zone.js`

12. **[auto] Verify ng-packagr build:** run `npm run build` and confirm `dist/` contains APF output (`fesm2022/`, `types/`, and a generated `package.json`). The build uses ng-packagr with bundler module resolution, so all relative imports in source files must be extensionless (e.g., `'./foo.service'`). No ESM extension rewriting config is needed — ng-packagr handles this.
13. **[auto] Replace example source files** in `src/` — delete `greet.ts` and `greet.spec.ts`, add the actual package source, and update `src/index.ts` barrel exports
14. **[auto] Update `SECURITY.md`:** replace the advisory URL with the new repository's Security Advisory link
15. **[auto] Search for remaining placeholders:** grep the entire repository for `TODO-package-name` and `TODO`. Replace or remove every occurrence — this catches references in documentation, badge URLs, lock files, and code examples that earlier steps may have missed.
16. **[auto] Verify publish contents:** run `npm pack --dry-run` and confirm only `dist/` files are included
17. **[auto] Delete this file**

## Verification

After all steps are complete, output a summary table like this:

| Step | Description                           | Status                   |
| ---- | ------------------------------------- | ------------------------ |
| 1    | Create repository                     | Manual — pre-req         |
| 2    | Grant teqbench-automation access      | Manual — pre-req         |
| 3    | Add repo to org rulesets              | Manual — pre-req         |
| 4    | Reset versioning                      | Done                     |
| 5    | Update package.json/lock              | Done                     |
| 6    | Update release-please-config.json     | Done                     |
| 7    | Set up dep-compat tracking            | Done                     |
| 8    | Update README.md                      | Done                     |
| 9    | Update CLAUDE.md                      | Done                     |
| 10   | Update eslint.config.js               | Skipped (tbx-\* package) |
| 11   | Configure Angular test infrastructure | Skipped (tbx-\* package) |
| 12   | Verify ng-packagr build               | Done                     |
| 13   | Replace example source files          | Done                     |
| 14   | Update SECURITY.md                    | Done                     |
| 15   | Search for remaining placeholders     | Done                     |
| 16   | Verify publish contents               | Done                     |
| 17   | Delete SETUP.md                       | Done                     |

> **Reminder:** Subscribe to the dep-compat tracking issue (step 7) to receive daily status notifications.

Use **Done**, **Skipped** (with reason), or **Manual — action required** as the status for each step.
