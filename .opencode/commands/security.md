---
description: Run a security audit on the current changes. Use /security [scope] where scope is "staged", "last", or paths.
agent: build
---

# /security — security audit

You are running the `security-review` skill. Dispatch the security-auditor subagent on the current changes.

## Step 1 — determine scope

Parse `$ARGUMENTS`:

- empty → `git diff main...HEAD` (fallback `git diff HEAD`)
- `staged` → `git diff --cached`
- `last` → `git diff HEAD~1`
- anything else → list of paths

Capture the diff into a single string.

## Step 2 — invoke the auditor

Call the `task` tool once with `subagent_type: "general"`:

```
You are the SECURITY AUDITOR. Read your instructions from `.opencode/agents/security-auditor.md`.

Scope of review:
```
<diff>
```

Deployment context: Vercel (Next.js 15.5.19, React 19.2.4). Frontend is mostly static; no production database. Sales flow is WhatsApp CTA (no payment processing in-app).

Data sensitivity: customer browsing data only; no PII stored server-side; scraped product catalog.

Threat model: public internet users browsing the catalog; authenticated users are not yet a feature.

Return the structured report defined in your agent file. Treat CRITICAL and HIGH as deploy-blockers.
```

## Step 3 — present the result

Surface findings, with CRITICAL/HIGH at the top.

If any CRITICAL/HIGH finding exists:
- Recommend NOT deploying until addressed.
- For hardcoded secrets: recommend **immediate rotation** (not just removal).
- For injection vulns: ask the user before implementing the fix.

If only MEDIUM/LOW: list as follow-ups, allow deploy.

Do NOT edit files. This command is read-only.