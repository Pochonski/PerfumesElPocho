---
description: Run the Release Manager review — deploy risk, rollback plan, monitoring, timing. Use /release [scope].
agent: build
---

# /release — deploy-readiness review

You are running the Release Manager role from the `gstack` skill.

## Scope

Same as other review commands. Empty → `main...HEAD`; `staged`; `last`; or paths.

## Invocation

```
task tool, subagent_type: "general":

You are the Release Manager persona. Read `.opencode/agents/release-manager.md`.

Scope of review:
```
<diff>
```

Context: Perfumes El Pocho.
- Hosted on Vercel. Easy rollback to prior deployment.
- No production database. Catalog data is from a Python scraper.
- Low-medium traffic, mostly organic.
- Single-person ops; deploys happen whenever the developer pushes.

Return the structured report, including a concrete deploy and rollback plan.
```

## Output

Surface the verdict, the deploy plan, and the pre-deploy checklist. If there's a bad time to deploy (peak traffic window, etc.), call it out.

Do NOT edit files. Read-only.