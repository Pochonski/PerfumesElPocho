---
description: After implementation, simplify the diff — ask "what can we delete?" and remove code that isn't earning its keep. Use /simplify [scope].
agent: build
---

# /simplify — ruthless simplification

Run the "simplify" recipe from `gstack`. Read the diff as if it were a draft and propose deletions.

## Step 1 — scope

Same as other review commands. Empty → `main...HEAD`; `staged`; `last`; or paths.

## Step 2 — what to look for

For each added line, ask:

- **Was this used by the original task, or added speculatively?**
- **Does this abstraction have exactly one caller? If only one, inline it.**
- **Is this configuration used? If not, delete it.**
- **Are these two functions almost identical? Merge them.**
- **Are these three components doing the same thing in different files? Extract one primitive.**
- **Did we add a new dependency when a stdlib or existing dep would do?**
- **Did we add tests for behavior we never shipped?**
- **Did we add a wrapper around an API call that doesn't need wrapping?**

## Step 3 — dispatch

Call `task` once:

```
You are a ruthless simplifier. Read `.opencode/agents/architect.md` for the lens (especially "RUTHLESSLY SIMPLIFY").

Scope:
```
<diff>
```

Project context: Perfumes El Pocho, Next.js 15.5.19 + React 19 + Tailwind v4. Small project, prefer deletion over clever abstraction.

Return:
1. Concrete deletions (file:line + what to remove + why it's safe)
2. Concrete merges (two near-duplicates + how to unify)
3. Concrete inline opportunities (a wrapper around a single caller)
4. Anything to KEEP that looks deletable but isn't

Be specific. Cite file:line for every suggestion.
```

## Step 4 — present

Output the simplifier's findings. Apply deletions only after the user confirms — don't auto-delete.

## Anti-patterns

- Suggesting "we could use a hook / context / abstraction" — that's the opposite of simplification.
- "We might need this later" — YAGNI; delete it.
- Refactoring that adds indirection to "improve clarity" — if the code is clear enough, leave it.