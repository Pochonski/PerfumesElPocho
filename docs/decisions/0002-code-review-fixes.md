# 0002 — Code review fixes (5-agent parallel pass)

**Date:** 2026-06-30
**Status:** accepted
**Context:** A 5-agent parallel code review (bugs, rules, history, structure, quality) audited the whole `web/` codebase. It surfaced ~50 findings: 4 real BLOCKERS hidden by `typescript.ignoreBuildErrors: true`, ~15 MAJOR duplicated across reporters, and ~25 MAJOR/discussion + MINOR/NIT items. The user explicitly asked to fix everything.

## Decisions

### D1 — Arreglar todos los errores que aparezcan al quitar `ignoreBuildErrors`
`web/next.config.ts` declared `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. The first masked real type errors (4 BLOQUEANTES already known). Removing the flags will surface additional errors; **all of them must be fixed in this pass** rather than ignored.

### D2 — Arreglar el call site de `hasActiveFilters`
`CatalogClient.tsx:430` called `hasActiveFilters(state, initialCategory)` with 2 args while the signature accepts 1. Decision: **fix the call site**, keep the function signature simple. The badge-count already computes `categoria !== initialCategory` separately, so the 2nd argument adds no value.

### D3 — Comentarios: barrido TOTAL, cero excepciones
AGENTS.md explicitly forbids comments in code. ~20 files violate it. After surveying, **no comment in the codebase documents a non-obvious decision that the code itself can't reveal**. (Candidates considered: scroll-restoration rationale in `CatalogClient.tsx`, `getFacetCounts` convention in `productos.ts`, rate-limit Vercel Map caveat. All three are either removable or already self-evident from function names + git log.) Decision: remove every `//`, `/** */`, and `{/* */` from `web/src/` and `web/app/`.

### D4 — Adoptar `PremiumCarousel` en `FeaturedProducts`; borrar `StarRating.tsx` y `data/reviews.ts`
- `web/src/components/ui/PremiumCarousel.tsx` (254 lines) exists as a generic carousel primitive, is fully implemented, has zero importers. It is the right primitive to back `FeaturedProducts`.
- `web/src/components/ui/StarRating.tsx` and `web/src/data/reviews.ts` are dead — zero importers, not wired into anything. Delete.
- After: `FeaturedProducts` stops reinventing carousel math with manual `translateX`.

### D5 — `@theme` Tailwind v4 completo + migración completa
`web/app/globals.css:3-7` only exposes font tokens. The 25 design tokens (`--background`, `--foreground`, `--accent`, `--card-bg`, `--border-subtle`, ...) live in `:root` / `[data-theme="light"]` selectors but **aren't in `@theme`**, so Tailwind doesn't generate utilities like `bg-accent` or `text-foreground`. The codebase compensates with `text-[color:var(--accent)]` arbitrary values across hundreds of call sites.

Decision: add the full `--color-*` block to `@theme` (Tailwind v4 understands `var()` references) and migrate **every** `[color:var(--*)]` and hex-`#c8a84e` to its Tailwind utility class. Same migration covers `BorderColor` and `bg-` etc.

## What gets changed
- ~30 files edited or deleted
- 4 files created (`lib/rate-limit.ts`, `lib/site.ts`, `lib/logger.ts`, `data/constants.ts`)
- ~25 color tokens added to `@theme`
- Dozens of Tailwind arbitrary values migrated
- ~20 files stripped of comments
- `next.config.ts` loses 2 build flags

## What stays out (backlog)
- Refactor `SearchBar.tsx` (403 lines) and `CatalogClient.tsx` (568 lines) into smaller components/hooks. High risk vs value.
- Tests (Vitest + RTL) for `lib/format.ts`, `lib/productos.ts`, `lib/filter-state.ts`. Real tech debt; needs its own pass.
- Real telemetry (Sentry / PostHog) — current `logger.ts` is the minimum.
- Fisher-Yates shuffle in `FeaturedProducts.tsx`. Bias invisible at 4k items.
- `SmoothScrollProvider` isSafari module-load SSR/CSR divergence.
- `precioMin` / `precioMax` encoding consistency (`~` vs `,` between `filter-state.ts` and `/api/productos`).
- Split `lib/productos.ts` (287 lines, 6 concerns) into `lib/products/{types,index,facets}.ts`.

## Verification
Each phase ends with `npx tsc --noEmit` + `npm run build` clean. Manual smoke test of home, `/search`, `/producto/123`, `/categoria/[slug]` in both themes after Phase 5.

## Commit plan
1. `chore(docs): add 0002-code-review-fixes decision` — this file
2. `chore(build): remove ignoreBuildErrors and fix all type errors`
3. `fix(catalog): align ActiveFilterChips props and hasActiveFilters arity`
4. `fix(product): remove params double-cast + NaN guard`
5. `refactor(lib): dedupe normalizeText, formatPrice, rate-limit, whatsapp config, logger`
6. `refactor(api): facets route delegates to lib helpers`
7. `chore(structure): remove dead code and centralize site config`
8. `feat(tailwind): expose --color-* tokens in @theme`
9. `refactor(ui): migrate color arbitrary values to Tailwind v4 utilities`
10. `style(repo): remove all comments per AGENTS.md`

Plus a final `chore(docs): add 0003-code-review-backlog` after Phase 5 for the deferred items.
