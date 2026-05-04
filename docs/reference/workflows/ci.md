# CI Workflow — `ci.yml`

**Full name:** TeqBench Package - CI Workflow
**File:** `.github/workflows/ci.yml`

---

## Purpose

The CI workflow is the quality gate for the repository. It runs formatting checks, type checking, linting, tests with coverage enforcement, dependency auditing, and badge updates on every push and pull request to `main` and `dev`.

---

## Thin caller

This repo's `.github/workflows/ci.yml` is a thin caller — it declares triggers, concurrency, and local inputs, then delegates the full pipeline to the org-wide reusable workflow at [teqbench/.github → `.github/workflows/ci.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/ci.yml). All step definitions, action versions, permissions, and run conditions live there. Update the upstream workflow to change pipeline behavior across every TeqBench package repo at once.

---

## Triggers

<dl>
    <dt><code>push</code> on <code>main</code>, <code>dev</code></dt>
    <dd>Full pipeline + badge update.</dd>
    <dt><code>pull_request</code> on <code>main</code>, <code>dev</code></dt>
    <dd>Full pipeline, no badge update.</dd>
</dl>

---

## Concurrency

```yaml
group: ci-${{ github.repository }}-${{ github.ref }}
cancel-in-progress: false
```

Per-branch isolation — runs on the same branch queue sequentially (no cancellation).

---

## Inputs and Secrets

<dl>
    <dt><code>gist-id</code> (input)</dt>
    <dd>Sourced from the org-level <code>GIST_ID</code> variable. Identifies the shared public gist where badge JSON is written.</dd>
    <dt><code>secrets: inherit</code></dt>
    <dd>The reusable workflow inherits org and repo secrets — see the upstream workflow for the specific secrets it consumes (e.g. <code>APP_ID</code>, <code>APP_PRIVATE_KEY</code>, <code>GIST_TOKEN</code>).</dd>
</dl>
