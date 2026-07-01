# Perfumes El Pocho — Project Memory

> Bootstrapped by the `claude-mem` skill. Read this at the start of every session.

## What this is

Perfumes El Pocho — boutique perfume e-commerce for Costa Rica. Spanish-language catalog of 4,000+ fragrances. Sales happen via WhatsApp after catalog browsing. Single-person operation.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 15.5.19, React 19.2.4, Tailwind v4 |
| Font | Geist |
| Icons | `@phosphor-icons/react` |
| Animation | Framer Motion + Lenis smooth scroll |
| Validation | Zod |
| Data | Python scraper → static catalog |
| Hosting | Vercel |

## Where to look first

- `web/app/` — routes, layouts, server entry points (Next 15.5 root app dir, NOT under `web/src/`)
- `web/src/components/{ui,sections,product,filters,providers}/` — UI by concern
- `web/src/lib/` — pure utilities + business logic (no UI imports here)
- `web/src/data/` — typed access to data sources + shared constants (`constants.ts`)
- `scraper/` — Python catalog scraper
- `docs/decisions/` — append-only decision log
- `web/AGENTS.md` — Next.js-specific conventions (read before touching frontend)

## Non-negotiable conventions

- **Code, comments, identifiers: English.** User-facing copy: Spanish.
- **Currency**: colones (₡), thousands separator, no decimals.
- **Tailwind v4**: config via `@theme` in CSS, NOT `tailwind.config.js`.
- **React 19**: server components by default; `"use client"` only when needed.
- **No new dependencies** without explicit user approval.
- **No comments** in code unless asked.

## Memory workflow

- Read `AGENTS.md` (this file) at session start.
- Read `web/AGENTS.md` if touching the frontend.
- Read `scraper/AGENTS.md` if touching the scraper (create on first need).
- Read the most recent `docs/decisions/NNNN-*.md` for context on prior choices.
- After making a non-trivial decision, append a new entry to `docs/decisions/`.

## Skills installed

This repo has a `.opencode/` setup with adapted skills. See `.opencode/AGENTS.md` for what's available and how to invoke it.

## Anti-patterns

- Writing generic "AI-looking" UI (purple gradients, fake feature grids, three-column icon lists). See `.opencode/skills/frontend-design/SKILL.md`.
- Adding code without planning. See `.opencode/skills/superpowers/SKILL.md`.
- Shipping without review. See `.opencode/skills/code-review/SKILL.md`.
- Ignoring git history when changing code. See `.opencode/skills/code-review/SKILL.md` (history reviewer).
- Making decisions without logging them. See `.opencode/skills/claude-mem/SKILL.md`.