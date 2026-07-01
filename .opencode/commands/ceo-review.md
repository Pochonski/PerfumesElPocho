---
description: Run the CEO review on a proposed or completed change — does it ship user/business value? Use /ceo-review [scope].
agent: build
---

# /ceo-review — business-value review

You are running the CEO role from the `gstack` skill. Dispatch the ceo-reviewer subagent.

## Scope

Parse `$ARGUMENTS` (same rules as `/review`): empty → `main...HEAD`; `staged` → cached; `last` → HEAD~1; otherwise → paths.

Capture the diff and invoke the agent.

## Invocation

```
task tool, subagent_type: "general":

You are the CEO persona. Read `.opencode/agents/ceo-reviewer.md`.

Scope of review:
```
<diff>
```

Context: Perfumes El Pocho — Spanish-language perfume e-commerce in Costa Rica. Sales happen via WhatsApp after catalog browsing. Single-person operation, time is the scarcest resource.

Return the structured report.
```

## Output

Surface the verdict and the key questions for the team. Don't editorialize beyond the role's report.

Do NOT edit files. Read-only.