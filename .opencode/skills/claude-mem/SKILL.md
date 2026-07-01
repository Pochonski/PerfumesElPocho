---
name: claude-mem
description: Gives the model persistent memory of this project - structure, conventions, decisions, technical context - so it doesn't have to relearn it every session. Use at the start of any session, before planning, when context seems thin, or whenever the user says "remember this", "context", "memory", "what did we decide".
---

# Claude-MEM (project memory)

Adapted from `thedotmack/claude-mem`. In opencode, persistent memory is implemented differently than in Claude Code — opencode already loads `AGENTS.md` files as part of every session's instructions, so we lean into that instead of inventing a separate memory store.

This skill teaches you (the model) **where memory lives in this repo, how to read it, and how to write to it**.

## The memory model

```
AGENTS.md                          ← project root (always loaded)
├── web/AGENTS.md                  ← Next.js conventions, already exists
├── scraper/AGENTS.md              ← scraper-specific notes (create if needed)
├── .opencode/AGENTS.md            ← opencode-specific conventions
└── docs/decisions/                ← append-only decision log (create)
    ├── 0001-scraper-source-choice.md
    ├── 0002-pricing-display.md
    └── ...
```

**Convention:** memory files are append-only and dated. Don't rewrite history — add new entries.

## When you READ memory

### At the start of every session (mandatory)

Before doing anything else, **read `AGENTS.md` at the repo root**. If you haven't seen it in this session, you don't know the project.

Also read:

- `web/AGENTS.md` if any task touches the frontend
- `scraper/AGENTS.md` if any task touches the scraper
- The most recent entry in `docs/decisions/` for any non-trivial change

### Before making a non-trivial decision

Search `docs/decisions/` for prior decisions on the same topic. Use grep: `grep -r "<keyword>" docs/decisions/`. If a decision exists, respect it unless the user explicitly reverses it (and then log the reversal).

### When you don't recognize something

If the user mentions a file, function, library, or pattern you don't recognize, **check memory first** before asking. It may be documented in a decision log or AGENTS.md.

## When you WRITE memory

### Triggers for writing

- After making a non-trivial technical decision (library choice, architecture, schema change)
- After discovering a non-obvious constraint or gotcha
- After the user states a preference ("always", "never", "from now on")
- After fixing a subtle bug whose root cause should be remembered

### How to write

1. Create a new file in `docs/decisions/` with the next sequence number. Read the directory first to find the current max.
2. Use this template:

```markdown
# NNNN — short title

**Date:** YYYY-MM-DD
**Status:** accepted | superseded by NNNN | deprecated
**Context:** what was the situation when this decision was needed
**Decision:** what we chose
**Consequences:** what this means going forward (both good and bad)
**Alternatives considered:** what else we looked at and why we passed
```

3. Reference the decision from `AGENTS.md` if it's important enough to surface in every session.

### What NOT to write

- Trivia ("I added a button today")
- Things already obvious from reading the code
- Personal opinions about the codebase
- Anything that contains secrets, PII, or internal URLs not safe to commit

### For short-lived context

If you need to remember something for the rest of the session but it's not worth a permanent decision log entry, add it to a local "session notes" section in your scratchpad (not in a committed file). Don't pollute the repo with ephemeral notes.

## Bootstrapping (if memory files don't exist yet)

If this is the first time the skill runs in the repo:

1. **Don't go on a writing spree.** Memory is most useful when it's curated, not exhaustive.
2. Start with one high-leverage file: `AGENTS.md` at the repo root with:
   - One-line project description
   - Tech stack (one line each)
   - "Where to look first" pointers
3. Then add `docs/decisions/` only when an actual decision gets made.
4. Existing `web/AGENTS.md` is already a good template — mimic its brevity.

## Pairing with other skills

- **`superpowers` step 1 (Explore)**: memory reading is part of exploration. Read AGENTS.md first.
- **`superpowers` step 2 (Plan)**: cite relevant decisions in your plan. If a plan contradicts a decision, flag it.
- **`gstack`**: gstack's CEO/EM roles should reference decision history when making calls.

## The "explain yourself again" anti-pattern

If the user has had to explain the same project context more than twice, **memory is failing**. Either:

- The AGENTS.md isn't being read (check `opencode.json` `instructions` field)
- The decision isn't logged yet — add it now
- The decision is in the wrong place (move it closer to the relevant code)

The success metric for this skill: the user never has to repeat themselves.