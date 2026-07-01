---
name: security-review
description: Scans code changes for security vulnerabilities before merge or deploy - secrets, injection, auth, SSRF, supply chain, OWASP Top 10. Use when touching authentication, APIs, payment flows, file uploads, env handling, dependencies, or anything that handles user data. Also activates on /security, /security-scan, "is this safe to deploy", "check for vulnerabilities".
---

# Security Review

Adapted from `anthropics/claude-code-security-review`. This skill runs a focused security audit on changed code before it reaches production. It is intentionally separate from the general `code-review` skill — security findings need a different mindset (adversarial, not collaborative) and a different reviewer.

## When to run this

Run a security review **before**:

- Merging code that handles auth, sessions, tokens, or passwords
- Touching API routes, server actions, or any code that runs on the server with user input
- Adding or upgrading dependencies
- Changing payment / order / checkout flows
- Modifying env handling, secrets, or `.env*` files
- Deploying to production (`vercel deploy`, etc.)

If unsure, run it. The cost of a false negative (shipping a vuln) is much higher than the cost of a 30-second review.

## How to run it

Dispatch the security-auditor subagent (`.opencode/agents/security-auditor.md`) via the `task` tool with `subagent_type: "general"`. Scope it like the code-review skill:

- `git diff main...HEAD` for full PR review
- `git diff --cached` for staged only
- Specific paths for targeted audits

In your prompt, also pass:

- **Deployment context**: where this runs (Vercel serverless, client browser, etc.)
- **Data sensitivity**: does this code touch PII, payment data, credentials?
- **Threat model**: who are the likely adversaries (public internet users, authenticated users, admin users)?

## What this skill checks (and what it does NOT)

**It checks** code-level vulnerabilities in:

- Input validation & injection (SQL, command, path, template, prompt)
- Authentication & authorization
- Session & token handling
- Secret management
- Cryptography usage
- Deserialization
- File uploads & SSRF
- Dependency CVEs (via `npm audit` / `pip audit`)
- Headers / CORS / CSP for web responses
- Logging that might leak sensitive data

**It does NOT check** (use other tools):

- Infrastructure / cloud config (use cloud-specific scanners)
- Runtime / production telemetry
- Network-level attacks (DDoS, etc.)
- Social engineering
- Compliance (GDPR, PCI) — use dedicated tooling

## Severity rubric

- **CRITICAL** — exploitable today with low effort; data exfiltration, RCE, auth bypass
- **HIGH** — exploitable with some preconditions; significant data or privilege risk
- **MEDIUM** — defense-in-depth issue; would matter if another control fails
- **LOW** — best-practice violation; limited direct impact

Any CRITICAL or HIGH finding should block the deploy/merge. The user decides on MEDIUM/LOW.

## After the review

Apply fixes yourself if they're small and obvious (e.g. "this should be parameterized"). For larger fixes (adding a CSRF library, changing the auth model), surface the recommendation and ask the user before implementing.

Update `AGENTS.md` if the finding reveals a convention the whole codebase should follow (e.g. "all env access must go through `lib/env.ts`").

## Pairing with other skills

- Run **after** `code-review` (which catches general bugs and quality) and **before** deploy
- If secrets were leaked, also run a `git log -p` to see scope of exposure
- If a CVE is found in a dep, also check `package-lock.json` / lockfiles for transitive impact