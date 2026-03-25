# Claude Code Workflow — `claude.yml`

**Full name:** TeqBench Package - Claude Code Workflow
**File:** `.github/workflows/claude.yml`

---

## Purpose

The Claude Code workflow provides AI-powered assistance directly in GitHub issues and pull requests. When a user mentions `@claude` in a comment or issue body, Claude reads the codebase, analyzes the request, and can implement features, fix bugs, review code, or create pull requests — all within the GitHub UI.

---

## Triggers

| Event                                   | Condition                       |
| --------------------------------------- | ------------------------------- |
| `issue_comment` (created)               | Comment body contains `@claude` |
| `pull_request_review_comment` (created) | Comment body contains `@claude` |
| `issues` (opened)                       | Issue body contains `@claude`   |

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

| Secret              | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `APP_ID`            | GitHub App ID for generating a bot token |
| `APP_PRIVATE_KEY`   | GitHub App private key                   |
| `ANTHROPIC_API_KEY` | Authenticates with the Anthropic API     |

The app token is used for checkout with submodules (Claude Code skills) and for full repository access.

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

| Tool        | Purpose               |
| ----------- | --------------------- |
| `View`      | Read file contents    |
| `Edit`      | Modify existing files |
| `Write`     | Create new files      |
| `GlobTool`  | Find files by pattern |
| `GrepTool`  | Search file contents  |
| `BatchTool` | Batch file operations |

### Git Commands (Via Bash Allowlist)

| Allowed           | Purpose                  |
| ----------------- | ------------------------ |
| `git status`      | Check working tree state |
| `git diff`        | View changes             |
| `git log`         | Browse commit history    |
| `git branch`      | List/create branches     |
| `git show`        | Inspect commits          |
| `git checkout`    | Switch branches          |
| `git add`         | Stage changes            |
| `git commit`      | Create commits           |
| `git push origin` | Push to remote           |

| Explicitly Excluded       | Reason                                     |
| ------------------------- | ------------------------------------------ |
| `git push --force`        | Destructive — rewrites history             |
| `git reset`               | Destructive — can lose commits             |
| `git rebase`              | Can rewrite history                        |
| `git branch -D`           | Destructive — deletes branches             |
| Arbitrary `bash` commands | Security — prevents uncontrolled execution |

### npm Commands (Via Bash Allowlist)

| Allowed   | Purpose                                 |
| --------- | --------------------------------------- |
| `npm run` | Run project scripts (test, lint, build) |
| `npm ci`  | Install dependencies                    |
| `npx`     | Run Node.js binaries                    |

---

## CLAUDE.md

Claude reads the `CLAUDE.md` file in the repo root for project-specific context. This file defines:

- Tech stack and framework versions
- Key commands
- Project structure and publishing details
- Commit conventions
- Branching rules and workflow expectations
- Explicit do's and don'ts for Claude's behavior

Both the GitHub Action and the Claude Code CLI read the same `CLAUDE.md`, ensuring consistent behavior across local and CI environments.

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
- **No release file edits** — Claude should not modify `release-please-config.json`, `.release-please-manifest.json`, `CHANGELOG.md`, or `.badges/*` (enforced by `CLAUDE.md` conventions)
