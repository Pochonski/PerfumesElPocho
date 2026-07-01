---
name: gstack
description: A multi-role orchestration layer - CEO, engineering manager, QA, release manager, architect, and other roles review work from their own lens before it ships. Use when the user wants a structured review from multiple perspectives, when shipping a feature end-to-end, when planning a release, or when invoking /ceo-review, /em-review, /qa, /release, /architect.
---

# Gstack (multi-role review and orchestration)

Adapted from `garrytan/gstack`. The original ships ~23 role-based skills. Rather than recreate all 23 as separate skills, this implementation provides:

1. **This orchestrator skill** (SKILL.md) — explains how to combine roles
2. **Six role agents** — the highest-leverage roles for a one-person project
3. **Five role commands** — `/ceo-review`, `/em-review`, `/qa`, `/release`, `/architect` for one-shot invocation

The other 17 gstack skills are documented as recipes in the recipes section below; if you need one, read the recipe and follow it as a workflow.

## Philosophy

A single reviewer, no matter how senior, has blind spots. Gstack invokes **multiple specialized roles in parallel**, each looking at the same change through a different lens. Together they catch more issues than any single review could.

For this repo (one-person project, fast iteration), the goal isn't corporate process — it's **wearing different hats deliberately** instead of just shipping whatever the first perspective thinks.

## The six core roles

| Role | Focus | Agent file | Command |
|---|---|---|---|
| **CEO** | Business value, user impact, opportunity cost, scope creep | `ceo-reviewer.md` | `/ceo-review` |
| **Engineering Manager** | Delivery, scope, sequencing, dependencies, "is this the right next thing" | `engineering-manager.md` | `/em-review` |
| **Architect** | System design, boundaries, scalability, future-proofing, tech debt | `architect.md` | `/architect` |
| **QA** | Testing, edge cases, user flows, accessibility, regression risk | `qa-engineer.md` | `/qa` |
| **Release Manager** | Deploy risk, rollback plan, feature flags, monitoring, comms | `release-manager.md` | `/release` |
| **Security Lead** | Threat model, secret handling, auth, OWASP, supply chain | uses `security-auditor.md` from security-review skill | `/security-scan` |

The Security Lead role delegates to the existing `security-auditor` agent from the `security-review` skill — don't reinvent it.

## How to combine roles

### Recipe A — "ship this feature" (full pre-ship)

Run in this order, with appropriate parallelism:

1. **Architect** (sequential) — has the diff been designed well? Any structural issues to fix before code-review?
2. **Code review** (parallel 5 agents, from `code-review` skill) — bugs, rules, history, structure, quality
3. **Security review** (parallel 1 agent, from `security-review` skill) — vulnerabilities
4. **QA** (sequential) — test plan, manual scenarios, regression risk
5. **Release Manager** (sequential) — deploy plan, rollback, monitoring
6. **CEO** (sequential, last) — final go/no-go from a business lens

### Recipe B — "is this the right thing to build?"

1. **CEO** — should we even be doing this?
2. **Engineering Manager** — given current priorities, is this the right NEXT thing?
3. (then proceed to Recipe A if you decide to build it)

### Recipe C — "I just want a quick gut check"

Just invoke `/ceo-review` or `/em-review` standalone.

### Recipe D — "is this safe to deploy right now?"

1. **Release Manager** — what's the deploy risk?
2. **Security Lead** — any unresolved security findings?
3. **QA** — any unresolved test gaps?

## Invoking a role

Each role is a subagent. To run a role:

```
task tool:
  subagent_type: "general"
  prompt: |
    You are the <ROLE>. Read your role definition from .opencode/agents/<file>.md.

    <scope of review — same as code-review skill>

    Return your structured report.
```

For parallel roles, dispatch multiple `task` calls in the same message.

## The other 17 gstack skills (recipes)

These aren't separate agents — they're **workflows** you can run by following the recipe. If a user asks for one and it's not in the core six, read this section and follow it.

| Skill | Recipe |
|---|---|
| `plan` | Use `todowrite` with goals, steps, files, tests, risks. Iterate until user signs off. |
| `brainstorm` | Generate 3+ distinct approaches. For each: pros, cons, effort, risk. Recommend one. |
| `prime` | At session start, run `claude-mem`, then list open TODOs, recent decisions, and blockers. |
| `triage` | For a bug report: reproduce, isolate, identify root cause, propose fix + test. |
| `debug` | Reproduce, narrow, fix, add regression test, document in `docs/decisions/`. |
| `review` (high-level) | Run Recipe A above. |
| `simplify` | After implementation, ask "what can we delete?" Refactor for less code. |
| `claudemd` | When AGENTS.md gets stale or the project grows, audit and rewrite it. |
| `claude` | Persona-only invocation: "act as a senior <X>" — useful for one-off questions. |
| `compound` | After each task, capture: what worked, what didn't, what to remember. Update AGENTS.md. |
| `document` | Write user-facing docs / READMEs / decision logs for significant changes. |
| `worktree` | For risky changes, suggest working in a git worktree. |
| `gstack` (meta) | This skill. The orchestrator. |
| `loop` | For repetitive tasks: define the loop, exit condition, and run. |
| `spawn` | Run roles in parallel (this is what `task` does). |
| `parallel-fix` | For N independent fixes, dispatch them as parallel subagents. |
| `tool-design` | When adding a new tool/MCP server, design its surface before building. |

If a user asks for one of these explicitly (e.g. `/brainstorm`, `/simplify`), follow the recipe. Don't pretend to invoke a non-existent agent.

## Anti-patterns

- Invoking all six roles for every change (slow, noisy — pick what fits)
- Letting the CEO role veto technical decisions (CEO lens is business value, not code)
- Running roles sequentially when they could run in parallel
- Treating role output as gospel (roles give a perspective, not an order)
- Skipping the role layer "because we're moving fast" (that's when you need it most)

## When in doubt

Default to: **Architect → code-review → security-review → ship**. Add CEO and Release Manager when the change is user-visible.