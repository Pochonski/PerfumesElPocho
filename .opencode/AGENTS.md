# opencode setup (Perfumes El Pocho)

This directory configures opencode for this project: skills, agents, commands, and conventions.

## Skills (`.opencode/skills/`)

Each `SKILL.md` is auto-loaded when its description matches the user's task. Invoke explicitly by asking for the skill by name or by triggering its keywords.

| Skill | Purpose | When it activates |
|---|---|---|
| `superpowers` | Enforces explore→plan→test→self-review workflow | Any non-trivial coding task |
| `frontend-design` | Production-grade UI in this repo's stack | Building/redesigning components or pages |
| `code-review` | Orchestrates 5 parallel reviewers (bugs/rules/history/structure/quality) | After implementation, before merge |
| `security-review` | Adversarial vulnerability scan | Before deploy, on auth/API/secrets changes |
| `claude-mem` | Persistent project memory via AGENTS.md and `docs/decisions/` | Session start, before planning, after deciding |
| `gstack` | Multi-role orchestration (CEO/EM/Architect/QA/Release/Security) | Pre-ship reviews, big planning calls |

## Agents (`.opencode/agents/`)

Subagents invoked via the `task` tool. Most are dispatched by commands (see below) or by skills.

### Code review (5)

- `code-reviewer-bugs.md` — correctness, null handling, race conditions
- `code-reviewer-rules.md` — repo conventions, AGENTS.md compliance
- `code-reviewer-history.md` — git history context, regressions
- `code-reviewer-structure.md` — module boundaries, layering
- `code-reviewer-quality.md` — readability, complexity, dead code, tests

### Gstack roles (6)

- `ceo-reviewer.md` — business value, scope, opportunity cost
- `engineering-manager.md` — sequencing, sizing, dependencies
- `architect.md` — system design, future-proofing, tech debt
- `qa-engineer.md` — test plans, edge cases, accessibility, regression
- `release-manager.md` — deploy risk, rollback, monitoring
- `security-auditor.md` — vulnerabilities, secrets, OWASP

## Commands (`.opencode/commands/`)

Slash-commands. Type `/<name> [args]` in opencode to invoke.

| Command | What it runs |
|---|---|
| `/review [scope]` | 5-agent parallel code review |
| `/security [scope]` | Security audit (1 agent) |
| `/plan <task>` | Disciplined plan via superpowers |
| `/ceo-review [scope]` | CEO lens on changes |
| `/em-review [scope]` | Engineering manager lens |
| `/architect [scope]` | Architecture lens |
| `/qa [scope]` | QA lens |
| `/release [scope]` | Release manager lens |
| `/ship [scope]` | Full pre-ship pipeline (all roles) |
| `/simplify [scope]` | Ruthless simplification pass |

### Scope argument

For review-style commands, `$ARGUMENTS` parses as:

- empty → `git diff main...HEAD` (fallback `git diff HEAD` if no main)
- `staged` → `git diff --cached`
- `last` → `git diff HEAD~1`
- anything else → treated as a list of paths

## Recommended workflow

For any non-trivial task:

1. **Read** `AGENTS.md` at repo root + `web/AGENTS.md` if frontend.
2. **`/plan <task>`** — produce a plan the user signs off on.
3. **Implement** — follow the plan, run tests, self-review.
4. **`/review`** — 5-agent parallel review, fix must-fix items.
5. **`/security`** — if the change touches auth, APIs, secrets, or deps.
6. **`/qa`** — if the change is user-facing.
7. **`/simplify`** — optional, to delete code that isn't earning its keep.
8. **`/ship`** — full pipeline for major changes.
9. **Log decisions** to `docs/decisions/NNNN-*.md`.

## How the adapted skills differ from the originals

These are **adaptations** of Claude Code plugins for opencode, not direct clones:

| Original | Adaptation | Why |
|---|---|---|
| `obra/superpowers` | `superpowers/SKILL.md` | Workflow instructions; no plugin hooks needed |
| `anthropics/.../frontend-design` | `frontend-design/SKILL.md` | Customized for this repo's exact stack |
| `anthropics/.../code-review` | `code-review/SKILL.md` + 5 agent files | Orchestration via the `task` tool instead of Agent tool |
| `anthropics/claude-code-security-review` | `security-review/SKILL.md` + `security-auditor.md` | Adversarial single-pass reviewer |
| `thedotmack/claude-mem` | `claude-mem/SKILL.md` | Uses AGENTS.md as memory (already loaded by opencode) |
| `garrytan/gstack` | `gstack/SKILL.md` + 5 role agents + commands | Top 6 roles as agents; other 17 as recipes |

opencode doesn't have plugin hooks that fire automatically on every tool call (Claude Code's `PreToolUse` / `PostToolUse`), so the `superpowers` workflow is enforced by instruction-following rather than hard hooks. Load the skill explicitly when you want the workflow to apply.

## Adding a new skill / agent / command

- New skill: `.opencode/skills/<name>/SKILL.md` with `name` + `description` frontmatter
- New agent: `.opencode/agents/<name>.md` with `description` + `mode: subagent` + permission frontmatter
- New command: `.opencode/commands/<name>.md` with `description` + `agent` + body that uses `$ARGUMENTS`

After saving, **restart opencode** for changes to take effect.

## Permissions note

The agent files declare permissions like `edit: deny` and `webfetch: deny` to enforce read-only review behavior. If you need an agent to edit, override in the dispatch prompt or create a non-review variant.