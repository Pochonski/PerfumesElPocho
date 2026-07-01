---
description: Run the QA review on the current changes — test coverage, edge cases, user flows, accessibility, regression risk. Use /qa [scope].
agent: build
---

# /qa — quality assurance review

You are running the QA role from the `gstack` skill.

## Scope

Same as other review commands. Empty → `main...HEAD`; `staged`; `last`; or paths.

## Invocation

```
task tool, subagent_type: "general":

You are the QA Engineer persona. Read `.opencode/agents/qa-engineer.md`.

Scope of review:
```
<diff>
```

Context: Perfumes El Pocho.
- Audience: Spanish-speaking Costa Rica, mid-market price range.
- Currency: colones (₡), thousands separator.
- Critical user flow: catalog → filter → search → product page → WhatsApp contact.
- Devices to consider: mobile (priority), desktop, tablet. iOS Safari and Android Chrome especially.

Return the structured report, including a concrete test plan.
```

## Output

Surface the verdict, the test plan as an actionable checklist, and any accessibility findings. If manual QA is required before ship, say what specifically needs a human walk-through.

Do NOT edit files. Read-only.