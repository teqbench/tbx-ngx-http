# Dependency Compatibility Check — `dep-compat-check.yml`

**Full name:** Dependency Compatibility Check
**File:** `.github/workflows/dep-compat-check.yml`

---

## Purpose

Tracks pinned dependencies that are waiting for a new version — for example, waiting for a package to release a compatible major version before it can be adopted. The workflow checks the npm registry daily, evaluates resolution conditions, and posts status updates to a tracking issue.

---

## Triggers

| Event               | Schedule           |
| ------------------- | ------------------ |
| `schedule`          | Daily at 12:00 UTC |
| `workflow_dispatch` | Manual trigger     |

---

## Permissions

```yaml
permissions:
    issues: write
```

Only needs write access to issues for posting status comments.

---

## Secrets Used

| Secret         | Purpose                     |
| -------------- | --------------------------- |
| `GITHUB_TOKEN` | Default token for API calls |

No app token needed — this workflow only reads the npm registry and writes issue comments.

---

## How It Works

### Configuration

The workflow uses a tracking epic issue. The `EPIC` constant in the workflow file must be set to the issue number during repository setup (see SETUP.md step 8).

### Issue Metadata Format

Sub-issues of the epic must include a metadata block in their body:

```html
<!-- dep-compat
package: @angular/core
resolution: semver-major:22
description: Waiting for Angular 22 to support new signals API
also-track: @angular/cli, @angular/compiler
-->
```

| Field         | Required | Description                                                       |
| ------------- | -------- | ----------------------------------------------------------------- |
| `package`     | Yes      | npm package name to check                                         |
| `resolution`  | No       | Resolution condition (see below). Defaults to `manual`.           |
| `description` | No       | Human-readable context for status reports                         |
| `also-track`  | No       | Comma-separated list of additional packages to show in the report |

### Resolution Conditions

| Condition               | Behavior                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| `semver-gte:<version>`  | Resolved when latest version >= target. Status: Monitoring or Blocked |
| `semver-major:<number>` | Resolved when latest major >= target. Status: Resolved or Blocked     |
| `manual` (or omitted)   | Always shows as Action Needed — requires manual evaluation            |

### Evaluation Flow

1. Finds open issues with `Part of #<EPIC>` and `<!-- dep-compat ... -->` metadata.
2. For each, queries the npm registry for the latest version.
3. Evaluates the resolution condition against the current version.
4. Compares version fingerprints with the last bot comment to detect changes.
5. Posts a summary comment if: versions changed, it's Monday, or the workflow was triggered manually.

### Status Labels

| Label         | Meaning                                        |
| ------------- | ---------------------------------------------- |
| Resolved      | Resolution condition met — ready to integrate  |
| Blocked       | Waiting for a version that meets the condition |
| Action needed | Manual resolution — requires human evaluation  |
| Monitoring    | Condition met but keeping an eye on it         |

---

## Example Status Comment

```
## Dependency Compatibility — 2026-03-22

1/2 resolved. 1 item(s) still need attention.

| Item | Status | Detail |
|---|---|---|
| Angular 22 upgrade (#3) | Resolved | `@angular/core`: 22.0.1 — **v22 available!** Ready for integration. |
| ESLint flat config (#5) | Blocked | `eslint`: 9.39.2 (need >= 10.0.0 ✗) |
```

---

## Noise Reduction

The workflow only posts a comment when:

- **Version change detected** — at least one tracked package has a different version than the last check
- **Monday** — weekly summary regardless of changes
- **Manual trigger** — always posts when run via `workflow_dispatch`

This prevents daily noise while ensuring changes are reported promptly.
