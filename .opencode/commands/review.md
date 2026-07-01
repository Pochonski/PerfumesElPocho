---
description: Run the 5-agent parallel code review (bugs, rules, history, structure, quality) on the current changes. Use /review [scope] where scope is "staged", "last", or paths.
agent: build
---

# /review — 5-agent parallel code review

You are running the `code-review` skill. Dispatch five subagents **in parallel** (single message, multiple `task` calls), then merge their reports.

## Step 1 — determine the scope

Parse `$ARGUMENTS` (everything after `/review`):

- empty / not provided → `git diff main...HEAD` (fallback to `git diff HEAD` if no main branch)
- `staged` → `git diff --cached`
- `last` → `git diff HEAD~1`
- anything else → treat as a list of file paths (space-separated)

Run the relevant git command to capture the diff into a single string you'll pass to all reviewers.

If there is no diff (e.g. clean tree with no `main` branch), say so and stop.

## Step 2 — dispatch five reviewers in parallel

In one assistant message, call the `task` tool five times. Use `subagent_type: "general"` for each, with this prompt template (filling in the focus + agent file):

```
You are the <FOCUS> reviewer. Read your instructions from `.opencode/agents/<FILE>.md`.

Scope of review:
```
<the diff captured in step 1>
```

Also consider the project context:
- Repo: Perfumes El Pocho
- Stack: Next.js 15.5.19, React 19.2.4, Tailwind v4, Geist, Phosphor icons, Framer Motion, Lenis, Zod, Python scraper
- Read `web/AGENTS.md` for Next.js conventions before flagging anything as non-idiomatic.

Return the structured report defined in your agent file.
```

The five calls:

| # | Focus | Agent file |
|---|---|---|
| 1 | bugs | `code-reviewer-bugs.md` |
| 2 | rules | `code-reviewer-rules.md` |
| 3 | history | `code-reviewer-history.md` |
| 4 | structure | `code-reviewer-structure.md` |
| 5 | quality | `code-reviewer-quality.md` |

## Step 3 — merge reports

After all five return, merge findings:

- **BLOCKER** in any report → must fix; merge blocked
- **MAJOR** in 2+ reports → must fix
- **MAJOR** in 1 report → surface to user, ask whether to fix now
- **MINOR** / **NIT** → list as optional follow-ups

If the same finding appears in multiple reports, merge them and cite all reviewers.

## Step 4 — present the merged result

Output a single report in this shape:

```
# Code Review — <scope>

## Verdict: APPROVE | REQUEST CHANGES | BLOCKED

## Must fix
1. ...

## Should discuss
1. ...

## Optional follow-ups
1. ...

## What's good
- ...
```

Do NOT run extra commands. Do NOT edit files. This command is read-only by design.