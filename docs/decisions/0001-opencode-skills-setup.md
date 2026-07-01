# 0001 — opencode skills setup (adapted from Claude Code plugins)

**Date:** 2026-06-30
**Status:** accepted
**Context:** The repo had `AGENTS.md` (project memory) and `web/AGENTS.md` (Next.js conventions) but no structured workflow for code review, security audit, or multi-role review. The user wanted the Claude Code plugins ecosystem (superpowers, frontend-design, code-review, security-review, claude-mem, gstack) adapted to opencode.
**Decision:** Adapt, don't clone. Create:
- 6 skills under `.opencode/skills/<name>/SKILL.md`
- 11 subagents under `.opencode/agents/`
- 10 slash-commands under `.opencode/commands/`
- `.opencode/AGENTS.md` documenting the setup
- Update root `AGENTS.md` to reference the new setup

Each adaptation takes the **concept** from the original plugin and re-implements it in opencode primitives (skills + subagents + commands) rather than trying to clone Claude Code-specific hook APIs.
**Consequences:**
- All review workflows are now reachable via `/review`, `/security`, `/qa`, `/architect`, etc.
- The 5-agent parallel code review works because the `/review` command dispatches them in a single message.
- `claude-mem` memory system uses existing AGENTS.md files instead of inventing a new store.
- After saving config, the user must restart opencode for new skills/agents to load.
**Alternatives considered:**
- Install via npm/opencode plugin system: rejected because the originals are Claude Code-only and not packaged for opencode.
- Use only the global `~/.config/opencode/` location: rejected because these are project-specific adaptations (mentions of Perfumes El Pocho, Spanish copy, colones currency).