---
name: superpowers
description: Enforces a disciplined engineering workflow - explore before changing, plan before coding, write tests alongside implementation, and self-review before claiming done. Use when starting non-trivial tasks, implementing features, refactoring, fixing bugs, or whenever the user asks for "the proper way" or "production quality" work. Also activates when the user mentions TDD, planning, or test-first.
---

# Superpowers

A meta-skill that overlays every coding task with a strict, opinionated workflow. Borrowed and adapted from `obra/superpowers`, this is the foundation that makes the rest of the skills in this directory effective.

## When this skill activates

This skill is meant to be loaded **first** when starting any non-trivial task. It also re-activates automatically when:

- The user asks to implement, build, add, fix, refactor, or change code
- The user says "production-ready", "proper way", "best practice", "clean"
- The task spans more than one file or requires multiple edits
- You're about to write a non-trivial function, component, endpoint, or query

If the task is a single trivial edit (typo, one-line config), skip this and just do it.

## The workflow (in order, every time)

### 1. Explore first

Before writing anything, **understand the existing code**.

- Read the relevant files end-to-end. Don't skim.
- Use `grep` and `glob` to find related code, callers, tests.
- Check `AGENTS.md` files in the affected directory for local conventions.
- If a Next.js file: read `web/node_modules/next/dist/docs/` for the relevant guide (this project uses Next 16, which differs from training data).
- Identify the patterns already in use. Mimic them. Don't invent new ones.

Output a short summary: what exists today, what's missing, what's broken.

### 2. Plan before coding

Never jump straight to `edit` / `write`. Use `todowrite` to lay out the plan.

A good plan has:

- **Goal** — one sentence stating what "done" looks like
- **Steps** — ordered, each independently verifiable
- **Files to touch** — explicit list, so you don't surprise the user
- **Tests** — what you'll add or update
- **Risks** — anything that could go wrong (migrations, breaking changes, perf)

If the plan needs user input (library choice, API design), use `question` before continuing. Don't guess on reversible decisions; don't ask on obvious ones.

### 3. Write tests alongside code

TDD-lite: tests are part of the same commit, not an afterthought.

- Find the existing test framework before writing tests. Check `package.json`, look for `*.test.*`, `*.spec.*`, or a `tests/` directory.
- For new pure functions: at least one happy-path + one edge-case test.
- For new components: a render test + a key interaction test.
- For new API endpoints: a success test + the obvious error path.
- If the codebase has no tests, propose adding one example test for the new code and ask before going further.

Never claim "done" with a passing build alone. Run the tests and show the output.

### 4. Self-review before claiming done

Before saying "done", run a self-review pass on your own diff:

- Re-read every changed file. Look for bugs you missed.
- Check: do tests cover the new branches? Are error paths handled?
- Check: does this match the codebase's style and conventions?
- Check: did you leave debug logs, commented-out code, or `console.log`?
- Check: is anything sensitive (keys, tokens, PII) being logged?

If you find issues, fix them before reporting back. Don't ship a "polish this for me" handoff.

### 5. Report concisely

When done, report:

- What changed (files + intent, one line each)
- What was tested and the result
- Anything you skipped or that needs follow-up

Do NOT summarize the obvious. The diff is the summary.

## Anti-patterns this skill exists to prevent

- "Let me just write this real quick" → 200 lines of unreviewed code
- "I'll add tests later" → later never comes
- "I think the existing pattern is..." → invented a new pattern
- "Should be fine" → no verification
- Editing files without reading them first
- Long explanations of what you're about to do (just do it, after planning)

## Pairing with other skills

- After planning in step 2, load `frontend-design` if the task touches UI.
- After self-review in step 4, optionally invoke `/review` from the `code-review` skill for a second pass.
- For anything user-facing, load `claude-mem` to check project context first.

## Notes for this repo

- Project: Perfumes El Pocho (Next.js 16 frontend + Python scraper)
- Local convention: read `web/AGENTS.md` before touching Next.js code
- Spanish is acceptable in user-facing strings; code/comments stay English unless the project says otherwise