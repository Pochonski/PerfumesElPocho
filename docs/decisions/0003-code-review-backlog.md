# 0003 — Code review backlog (deferred from 0002)

**Date:** 2026-06-30
**Status:** accepted
**Context:** During the 0002 code-review-fixes pass, several items were intentionally deferred. They were either out of scope (would expand the blast radius), required a Python toolchain (scraper/), or needed their own focused pass.

## Deferred items

### Refactor `SearchBar.tsx` (403 → ~150 lines)
The component mixes controlled input, debounce, AbortController, hydration-safe placeholder, mounted flag, Lenis coordination, keyboard navigation, click-outside, and the dropdown renderer. Splitting it into smaller hooks (useDebounced, useOutsideClick, useShortcut) and sub-components (SearchBarInput, SearchBarDropdown) will improve readability and testability.

### Refactor `CatalogClient.tsx` (568 → ~250 lines)
The component does URL state, scroll restoration, debounced search, fetch orchestration, filter chips, pagination math, skeleton rendering. Extract `<CatalogGrid>`, `<CatalogPagination>`, the URL-state hook (`useFilterUrlState`), and the scroll-preservation hook.

### Tests
Zero test files exist. Add Vitest + React Testing Library coverage for:
- `lib/format.ts` — `formatPrice` no-decimals guard, `formatPriceCompact` ranges
- `lib/productos.ts` — `getFacetCounts` skip-self convention, normalization paths
- `lib/filter-state.ts` — `encodeFilters`/`decodeFilters` round-trip, edge cases
- API routes — Zod schema validation, rate-limit behavior

### Real telemetry
Replace `lib/logger.ts` (currently `console.warn` with prefix) with Sentry or PostHog. Today's logger is the minimum — fine for local dev but not for production observability.

### Fisher-Yates in `FeaturedProductsCarousel.tsx`
The `sort(() => 0.5 - Math.random())` was replaced with a proper Fisher-Yates (`shuffle` helper). Bias was invisible at 4k items but worth a comment explaining why we shuffle at all (defensive, since catalog already includes a "Destacadas" filter upstream).

### `SmoothScrollProvider` SSR/CSR divergence
`isSafari` is evaluated at module load — frozen at first module evaluation. SSR sees `false`, client may see different value. Move the check inside the component body so both bundles evaluate identically.

### `precioMin`/`precioMax` encoding consistency
`filter-state.ts:53` uses `~` as multi-value separator. `/api/productos` (line 117) uses `,`. Pick one and apply it in both layers; otherwise a user pasting `?m=Adidas,Nike` (API convention) doesn't decode — `decodeList` keeps it as one literal `Adidas,Nike` and nothing matches.

### Split `lib/productos.ts` (287 → 4 files)
Currently 6 concerns in one file: domain type, fs-backed data loading, list helpers, facet logic, text utilities (re-exported), re-exports. Split into:
- `lib/products/types.ts`
- `lib/products/index.ts` (server loader)
- `lib/products/facets.ts`
- Reuse `lib/utils.ts` for `normalizeText`/`slugify`

### Python scraper comments
The Python files in `scraper/` still have ~70 `#` comments. The repo rule "no comments in code" applies, but stripping them safely requires a Python-aware tokenizer (to distinguish docstrings from comments). Out of scope for the 0002 web/ sweep; needs `scraper/AGENTS.md` (which doesn't exist yet) and a separate pass.

## Verification of 0002 (for reference)
- `npx tsc --noEmit` → 0 errors
- `npx next build` → 620 static pages generated successfully
- No `console.log` / `console.error` in production code
- Hardcoded `50664779672` only in `lib/site.ts`
- No `#c8a84e` outside `globals.css` (where it defines the gold gradient)

## Related decisions
- `0001-opencode-skills-setup.md` — workflow tooling
- `0002-code-review-fixes.md` — the 5-phase remediation pass that produced this backlog