# Claude Code Workflow — `claude.yml`

**Full name:** TeqBench Package - [Claude Code ↗](https://github.com/anthropics/claude-code) Workflow
**File:** `.github/workflows/claude.yml`

---

## Purpose

The [Claude Code ↗](https://github.com/anthropics/claude-code) workflow provides AI-powered assistance directly in GitHub issues and pull requests. When a user mentions `@claude` in a comment or issue body, Claude reads the codebase, analyzes the request, and can implement features, fix bugs, review code, or create pull requests — all within the GitHub UI.

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

## Permissions

```yaml
permissions: {}

jobs:
    claude:
        permissions:
            contents: write # Read/edit/create files, push commits
            pull-requests: write # Create and update PRs
            issues: write # Comment on issues
            id-token: write # Required by the Claude Code action
```

---

## Secrets Used

<dl>
    <dt><code>APP_ID</code></dt>
    <dd>GitHub App ID for generating a bot token.</dd>
    <dt><code>APP_PRIVATE_KEY</code></dt>
    <dd>GitHub App private key.</dd>
    <dt><code>ANTHROPIC_API_KEY</code></dt>
    <dd>Authenticates with the <a href="https://docs.anthropic.com/en/api/getting-started">Anthropic API ↗</a>.</dd>
</dl>

The app token is used for checkout with submodules ([Claude Code ↗](https://github.com/anthropics/claude-code) skills) and for full repository access.

---

## Job: `claude` (Claude Code)

### Condition

```yaml
if: |
    (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
    (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
    (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
```

Only runs when `@claude` is explicitly mentioned.

### Timeout

```yaml
timeout-minutes: 30
```

### Step-by-Step Walkthrough

#### 1. Generate App Token

Uses `actions/create-github-app-token@v3` with `owner: teqbench` scope to generate a token that can access the skills submodule across the organization.

#### 2. Checkout Code

```yaml
uses: actions/checkout@v4
with:
    submodules: true
    token: ${{ steps.app-token.outputs.token }}
    fetch-depth: 0
```

Full history checkout with submodules so Claude has access to the skills definitions and can inspect git log, diff against branches, etc.

#### 3. Run Claude Code

```yaml
uses: anthropics/claude-code-action@v1
with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    claude_args: >-
        --max-turns 10
        --allowedTools
        "View,Edit,Write,GlobTool,GrepTool,BatchTool,
         Bash(git status:*),Bash(git diff:*),Bash(git log:*),
         Bash(git branch:*),Bash(git show:*),Bash(git checkout:*),
         Bash(git add:*),Bash(git commit:*),Bash(git push origin:*),
         Bash(npm run:*),Bash(npm ci:*),Bash(npx:*)"
```

---

## Tool Restrictions

Claude's capabilities are explicitly restricted via `--allowedTools` to prevent unsafe operations:

### File Tools (Built-in)

<dl>
    <dt><code>View</code></dt>
    <dd>Read file contents.</dd>
    <dt><code>Edit</code></dt>
    <dd>Modify existing files.</dd>
    <dt><code>Write</code></dt>
    <dd>Create new files.</dd>
    <dt><code>GlobTool</code></dt>
    <dd>Find files by pattern.</dd>
    <dt><code>GrepTool</code></dt>
    <dd>Search file contents.</dd>
    <dt><code>BatchTool</code></dt>
    <dd>Batch file operations.</dd>
</dl>

### Git Commands (Via Bash Allowlist)

Allowed:

<dl>
    <dt><code>git status</code></dt>
    <dd>Check working tree state.</dd>
    <dt><code>git diff</code></dt>
    <dd>View changes.</dd>
    <dt><code>git log</code></dt>
    <dd>Browse commit history.</dd>
    <dt><code>git branch</code></dt>
    <dd>List/create branches.</dd>
    <dt><code>git show</code></dt>
    <dd>Inspect commits.</dd>
    <dt><code>git checkout</code></dt>
    <dd>Switch branches.</dd>
    <dt><code>git add</code></dt>
    <dd>Stage changes.</dd>
    <dt><code>git commit</code></dt>
    <dd>Create commits.</dd>
    <dt><code>git push origin</code></dt>
    <dd>Push to remote.</dd>
</dl>

Explicitly excluded:

<dl>
    <dt><code>git push --force</code></dt>
    <dd>Destructive — rewrites history.</dd>
    <dt><code>git reset</code></dt>
    <dd>Destructive — can lose commits.</dd>
    <dt><code>git rebase</code></dt>
    <dd>Can rewrite history.</dd>
    <dt><code>git branch -D</code></dt>
    <dd>Destructive — deletes branches.</dd>
    <dt>Arbitrary <code>bash</code> commands</dt>
    <dd>Security — prevents uncontrolled execution.</dd>
</dl>

### npm Commands (Via Bash Allowlist)

<dl>
    <dt><code>npm run</code></dt>
    <dd>Run project scripts (test, lint, build).</dd>
    <dt><code>npm ci</code></dt>
    <dd>Install dependencies.</dd>
    <dt><code>npx</code></dt>
    <dd>Run <a href="https://nodejs.org/">Node.js ↗</a> binaries.</dd>
</dl>

---

## CLAUDE.md

Claude reads the `CLAUDE.md` file in the repo root for project-specific context. This file defines:

- Tech stack and framework versions
- Key commands
- Project structure and publishing details
- Commit conventions
- Branching rules and workflow expectations
- Explicit do's and don'ts for Claude's behavior

Both the GitHub Action and the [Claude Code ↗](https://github.com/anthropics/claude-code) CLI read the same `CLAUDE.md`, ensuring consistent behavior across local and CI environments.

---

## Usage Examples

In any issue or PR comment:

```
@claude implement this feature based on the issue description
@claude fix the bug described above
@claude review this PR
@claude add unit tests for the greet function
```

Claude will:

1. Read the codebase and `CLAUDE.md` for context
2. Create a feature or bugfix branch off `dev`
3. Implement the requested changes
4. Run tests and lint to verify
5. Commit with conventional commit messages
6. Push and create a PR targeting `dev`

---

## Limitations

- **Max turns:** 10 — prevents runaway sessions
- **Timeout:** 30 minutes — hard cap on execution time
- **No workflow edits** — Claude should not modify `.github/workflows/*` without explicit instruction (enforced by `CLAUDE.md` conventions)
- **No release file edits** — Claude should not modify `release-please-config.json`, `.release-please-manifest.json`, or `CHANGELOG.md` (enforced by `CLAUDE.md` conventions)
