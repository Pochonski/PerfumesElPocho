---
description: Plan a non-trivial change with superpowers discipline: explore, scope, list files, propose tests, surface risks. Use /plan <task description>.
agent: plan
---

# /plan — disciplined planning

You are running the **planning step** of the `superpowers` skill. Your job: produce a plan the user can sign off on before you write any code.

## Step 1 — load context

Before planning, read:

- `AGENTS.md` at repo root (via `claude-mem` skill)
- `web/AGENTS.md` if the task touches the frontend
- `scraper/AGENTS.md` if it touches the scraper (create if missing)
- The most recent entry in `docs/decisions/` if it exists

Use `grep` / `glob` to find existing patterns in the affected area.

## Step 2 — capture the task

`$ARGUMENTS` is the user's task description. If empty, ask via `question`.

## Step 3 — produce the plan

Use `todowrite` with this exact structure (one todo per item):

1. **Goal** — one sentence: what "done" looks like
2. **Existing context** — one paragraph: what's already there and what we're changing
3. **Step N** — ordered implementation steps, each independently verifiable
4. **Files to touch** — explicit list (create / modify / delete)
5. **Tests** — what tests to add or update, and which framework
6. **Risks** — anything that could go wrong (breaking changes, migrations, perf, deps)
7. **Out of scope** — what we're explicitly NOT doing in this change
8. **Definition of done** — short checklist

## Step 4 — present for approval

After writing the todos, output a short summary and ask the user:

> Does this plan look right? Approve, or what would you change?

Wait for the user's response before doing any edits.

## Step 5 — switch to build

Once approved, the user will switch to a build-mode agent to execute the plan. This command stays read-only — it does not edit code.

## Anti-patterns to refuse

- Plans that don't list files (no surprise edits)
- Plans that skip tests
- Plans without risks
- Plans that silently expand scope ("while I'm here, also...")

If the task is trivial (one line, one file), say so and skip the formal plan.