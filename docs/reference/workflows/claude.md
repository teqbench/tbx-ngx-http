# Claude Code Workflow — `claude.yml`

**Full name:** TeqBench Package - [Claude Code ↗](https://github.com/anthropics/claude-code) Workflow
**File:** `.github/workflows/claude.yml`

---

## Purpose

The [Claude Code ↗](https://github.com/anthropics/claude-code) workflow provides AI-powered assistance directly in GitHub issues and pull requests. When a user mentions `@claude` in a comment or issue body, Claude reads the codebase, analyzes the request, and can implement features, fix bugs, review code, or create pull requests — all within the GitHub UI.

---

## Thin caller

This repo's `.github/workflows/claude.yml` is a thin caller — it declares triggers, concurrency, and the `@claude` filter, then delegates execution to the org-wide reusable workflow at [teqbench/.github → `.github/workflows/claude.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/claude.yml). All step definitions, tool restrictions, action versions, and permissions live there. Update the upstream workflow to change Claude's capabilities across every TeqBench package repo at once.

The triggers and the `@claude` filter must live in the local caller because GitHub Actions reusable workflows only support `workflow_call` as a trigger — so event triggers (`issue_comment`, `issues`, `pull_request_review_comment`) and the body-contains-`@claude` condition cannot move upstream.

---

## Triggers

<dl>
    <dt><code>issue_comment</code> (created)</dt>
    <dd>Comment body contains <code>@claude</code>.</dd>
    <dt><code>pull_request_review_comment</code> (created)</dt>
    <dd>Comment body contains <code>@claude</code>.</dd>
    <dt><code>issues</code> (opened)</dt>
    <dd>Issue body contains <code>@claude</code>.</dd>
</dl>

---

## Concurrency

```yaml
group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
cancel-in-progress: false
```

Per-issue/PR concurrency: only one Claude run per issue or PR at a time. Uses its own group (not shared with CI/Release/Sync) so Claude runs aren't blocked by or block other workflows.

---

## Job filter

```yaml
if: |
    (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
    (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
    (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
```

Only runs when `@claude` is explicitly mentioned in the triggering body.

---

## Secrets

`secrets: inherit` — the reusable workflow inherits org and repo secrets. See the upstream workflow for the specific secrets it consumes (e.g. `APP_ID`, `APP_PRIVATE_KEY`, `ANTHROPIC_API_KEY`).

---

## CLAUDE.md

Claude reads the `CLAUDE.md` file in the repo root for project-specific context. This file defines the tech stack, key commands, project structure, commit conventions, branching rules, and explicit do's and don'ts for Claude's behavior. Both the GitHub Action and the [Claude Code ↗](https://github.com/anthropics/claude-code) CLI read the same `CLAUDE.md`, ensuring consistent behavior across local and CI environments.

---

## Usage Examples

In any issue or PR comment:

```text
@claude implement this feature based on the issue description
@claude fix the bug described above
@claude review this PR
@claude add unit tests for the greet function
```
