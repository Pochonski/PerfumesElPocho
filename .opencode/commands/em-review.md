---
description: Run the Engineering Manager review on a proposed or completed change — right scope, right sequence, right next thing? Use /em-review [scope].
agent: build
---

# /em-review — delivery review

You are running the Engineering Manager role from the `gstack` skill.

## Scope

Same as `/ceo-review`: parse `$ARGUMENTS` to determine diff scope.

## Invocation

```
task tool, subagent_type: "general":

You are the Engineering Manager persona. Read `.opencode/agents/engineering-manager.md`.

Scope of review:
```
<diff>
```

Context: Perfumes El Pocho — solo project, fast iteration. Time is scarce. The "team" is one developer with an AI assistant.

Return the structured report.
```

## Output

Surface the verdict, scope recommendations, and the definition of done. If the role recommends cutting scope, present that as an actionable proposal.

Do NOT edit files. Read-only.