---
name: code-review
description: Run a five-agent parallel code review on recent changes - bugs, repo rules, git history, structure, and quality. Use after implementing a feature, before committing, before opening a PR, or whenever the user says "review this", "check the code", "is this safe to merge", or invokes /review.
---

# Code Review (5-agent parallel pass)

Adapted from `anthropics/claude-plugins-official/code-review`. The original runs five specialized reviewers in parallel; this skill does the same by dispatching five opencode subagents via the `task` tool in a single message.

The five reviewers are **complementary on purpose** — each catches things the others miss. They MUST run in parallel (single message, multiple `task` calls) to keep the wall-clock cost sane.

## When to run this

- After `superpowers` step 4 (self-review) and before claiming done
- Before `git commit` or `git push`
- Before opening a PR
- When the user says "revisa esto", "code review", "is this good?", "/review", or `/code-review`

## How to run it

In the **current session**, dispatch five subagents in parallel using the `task` tool. Each call uses `subagent_type: "general"` (or the appropriate specialized subagent if available) and references the matching agent file under `.opencode/agents/`.

| # | Agent file | Focus |
|---|---|---|
| 1 | `code-reviewer-bugs.md` | Correctness — logic errors, null/undefined, race conditions, off-by-one |
| 2 | `code-reviewer-rules.md` | Repo conventions — AGENTS.md, lint, type, existing patterns |
| 3 | `code-reviewer-history.md` | Git history — `git log`/`git blame` on touched files for context regressions |
| 4 | `code-reviewer-structure.md` | Architecture — module boundaries, deps, layering, single responsibility |
| 5 | `code-reviewer-quality.md` | Quality — readability, naming, dead code, complexity, test coverage |

### Invocation pattern

For each reviewer, the prompt should be:

> You are the **<FOCUS>** reviewer. Read your instructions from `.opencode/agents/<file>.md`. Review the changes described below and return a structured report.
>
> **Scope of review:** <the diff, files, or recent commits to review>
>
> Return:
> 1. A short verdict (`APPROVE`, `REQUEST CHANGES`, or `COMMENT`)
> 2. A numbered list of findings, each with: severity (`BLOCKER` / `MAJOR` / `MINOR` / `NIT`), file:line, and a one-paragraph fix
> 3. A "What's good" section with 1-3 things worth keeping

Then merge the five reports:

- **BLOCKER** in any report → must fix before merge
- **MAJOR** in 2+ reports → must fix
- **MAJOR** in 1 report → discuss with user
- **MINOR** / **NIT** → optional, batch into a follow-up

Report the merged result back to the user. Don't hide disagreements between reviewers.

## Defining the scope of review

Pick ONE of these and pass it to every reviewer:

- **`git diff main...HEAD`** — review everything not yet merged
- **`git diff --cached`** — review staged changes
- **`git diff HEAD~1`** — review the last commit
- **List of paths** — e.g. "src/lib/checkout.ts, src/app/api/orders/route.ts"

If the user doesn't specify, default to `git diff main...HEAD` (or `git diff HEAD` if there's no main branch yet).

## What this skill is NOT

- Not a substitute for `superpowers` self-review — run superpowers first, then this.
- Not a CI replacement. CI catches mechanical things (types, lint, tests). This catches things humans miss.
- Not exhaustive static analysis. Use `tsc`, `eslint`, etc. for that.

## Anti-patterns

- Running the five reviewers sequentially (defeats the parallel design)
- Skipping history review on "trivial" changes (typo fixes can revert important context)
- Reporting only blockers and hiding quality issues
- "LGTM" reviews without reading the diff
- Reviewing your own code without invoking the skill (load it, run all five, even if you wrote the code)