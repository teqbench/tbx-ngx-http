# Dependency Compatibility Check — `dep-compat-check.yml`

**Full name:** Dependency Compatibility Check
**File:** `.github/workflows/dep-compat-check.yml`

---

## Purpose

Tracks pinned dependencies that are waiting for a new version — for example, waiting for a package to release a compatible major version before it can be adopted. The workflow checks the [npm ↗](https://www.npmjs.com/) registry on a daily schedule, evaluates resolution conditions on sub-issues of a tracking epic, and posts status updates to the epic.

---

## Thin caller

This repo's `.github/workflows/dep-compat-check.yml` is a thin caller — it declares triggers and the local epic issue number, then delegates execution to the org-wide reusable workflow at [teqbench/.github → `.github/workflows/dep-compat-check.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/dep-compat-check.yml). All evaluation logic, the issue-metadata format, the resolution-condition grammar, and the status-comment format live there.

---

## Triggers

<dl>
    <dt><code>schedule</code></dt>
    <dd>Daily at 12:00 UTC.</dd>
    <dt><code>workflow_dispatch</code></dt>
    <dd>Manual trigger.</dd>
</dl>

---

## Inputs

<dl>
    <dt><code>epic-issue-number</code></dt>
    <dd>This repo passes <code>1</code> — the tracking epic for dependency compatibility in this repository. Update if the epic issue is recreated under a different number.</dd>
</dl>

---

## Secrets

`secrets: inherit` — the reusable workflow inherits org and repo secrets. The default `GITHUB_TOKEN` (with `issues: write`) is sufficient for posting status comments.

---

## Where to look for the public API

Documentation for the issue-metadata block (`<!-- dep-compat ... -->`), resolution-condition grammar (`semver-gte`, `semver-major`, `manual`), status labels, and example status comments lives with the reusable workflow at [teqbench/.github ↗](https://github.com/teqbench/.github). When writing sub-issues for the epic in this repo, follow whatever the upstream workflow currently expects — it is the authoritative source.
