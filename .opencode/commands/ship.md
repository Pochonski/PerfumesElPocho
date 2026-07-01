---
description: Run the full pre-ship pipeline from gstack — architect, code review, security, QA, release, CEO. Use /ship [scope] for the full review before deploy.
agent: build
---

# /ship — full pre-ship pipeline (gstack Recipe A)

Run every relevant review in the most efficient order, then give a single go/no-go.

## Step 1 — scope

Parse `$ARGUMENTS` (same rules): empty → `main...HEAD`; `staged`; `last`; or paths. Capture the diff.

## Step 2 — run reviews in optimal order

### Round 1 (parallel) — fast structural checks

In one assistant message, dispatch in parallel:

1. **Architect** (`.opencode/agents/architect.md`) — system design
2. **Bugs reviewer** (`.opencode/agents/code-reviewer-bugs.md`) — correctness
3. **Rules reviewer** (`.opencode/agents/code-reviewer-rules.md`) — conventions

These three cover most blocking issues cheaply. If any returns a BLOCKER, stop and report — don't waste cycles.

### Round 2 (parallel) — quality + context

If Round 1 passes, dispatch in parallel:

1. **History reviewer** (`.opencode/agents/code-reviewer-history.md`) — git context
2. **Structure reviewer** (`.opencode/agents/code-reviewer-structure.md`) — module boundaries
3. **Quality reviewer** (`.opencode/agents/code-reviewer-quality.md`) — readability
4. **Security auditor** (`.opencode/agents/security-auditor.md`) — vulnerabilities

### Round 3 (sequential) — business + deploy

After Round 2:

1. **QA engineer** (`.opencode/agents/qa-engineer.md`) — test plan + accessibility
2. **Release Manager** (`.opencode/agents/release-manager.md`) — deploy plan
3. **CEO** (`.opencode/agents/ceo-reviewer.md`) — final business go/no-go

## Step 3 — emit the ship decision

After all rounds, output:

```
# /ship — Verdict

## Round 1: STRUCTURE
- Architect: ...
- Bugs: ...
- Rules: ...

## Round 2: QUALITY & SECURITY
- History: ...
- Structure: ...
- Quality: ...
- Security: ...

## Round 3: BUSINESS & DEPLOY
- QA: ...
- Release: ...
- CEO: ...

## Final verdict: SHIP | SHIP WITH CHECKS | HOLD | BLOCK

If BLOCK or HOLD, list the must-fix items.
If SHIP WITH CHECKS, list the checks to run before deploy.
```

## Notes

- This command is **read-only**. It does not edit code, run deploys, or push commits.
- For very large diffs, prefer running individual review commands instead of `/ship` — the cost adds up.
- The CEO verdict is the final gate, but if Engineering Manager or Release Manager says HOLD, that outweighs CEO's SHIP.