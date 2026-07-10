# 0007 — Production Readiness Overhaul

**Date:** 2026-07-10

**Context:** Comprehensive review of the project identified blockers and major issues across data layer, pages/routes, components, and accessibility. Three-phase overhaul was executed.

## Phase 1 — Blockers (7 items)

### Navigation: Category tab "Árabes/Nicho" not appearing
- **Problem:** `categoryName: "Árabe"` (singular) vs data `"Árabes"` (plural) → tab silently invisible
- **Fix:** Changed to `categoryName: "Árabes"`
- **File:** `web/src/data/category-tabs.ts`

### Global error boundary missing
- **Problem:** No `global-error.tsx` → layout crash = white screen
- **Fix:** Created `web/app/global-error.tsx` with recovery UI + WhatsApp fallback

### Pages missing revalidation
- **Problem:** `/producto/[id]`, `/categoria/[slug]`, `/marca/[slug]`, `/guias/[slug]` had no `revalidate` → stale data until redeploy
- **Fix:** Added `export const revalidate = 3600` to all 4 pages

### Dark mode FOUC mitigation
- **Problem:** `ThemeProvider` initial state hardcoded `"dark"` while blocking script in layout sets `data-theme` correctly
- **Fix:** `getInitialTheme()` reads `data-theme` attribute, effect syncs on theme divergence

### Scroll restoration race condition
- **Problem:** Two effects (useLayoutEffect + useEffect) competed for scroll control after filter changes
- **Fix:** Removed duplicate useEffect, kept single useLayoutEffect

### Safari hydration mismatch
- **Problem:** UA sniffing at module level in SmoothScrollProvider caused SSR/CSR mismatch
- **Fix:** Moved Safari detection into useState + useEffect inside the component

### Unstable searchParams deps
- **Problem:** `useSearchParams()` reference instability caused re-fetch loops in CatalogClient
- **Fix:** Memoized via `useMemo(() => new URLSearchParams(raw.toString()), [raw])` + `.toString()` key

## Phase 2 — SEO & UX (5 items)

### Sitemap incomplete
- **Problem:** Only homepage + products in sitemap; missing categories, brands, guides
- **Fix:** Added all 6 category routes, 169 brand routes, 4 guide routes

### Missing OG image
- **Problem:** No open graph image → no preview on social/media shares
- **Fix:** Created 1200×630 OG image (`og-image.png` + source SVG), added to metadata + twitter card

### SSG limited coverage
- **Problem:** Only 500/2,984 product pages and 100/169 brand pages pre-built
- **Fix:** generateStaticParams now emits all products and all brands (3,172 total pages)

### Product-centric 404
- **Problem:** 404 page said "Esta fragancia no existe" for all routes (brands, categories, guides, random paths)
- **Fix:** Changed to "Esta página no existe" with generic copy

### Silent facets fetch failure
- **Problem:** Failed `/api/facets` fetch was silently ignored
- **Fix:** Added `console.error` with context

## Phase 3 — Accessibility & Performance (5 items)

### Navbar mobile: no focus trap, no overlay, iOS scroll lock broken
- **Problem:** Mobile menu had no overlay backdrop, no focus trap, body.scroll not locked on iOS
- **Fix:** Added backdrop, focus trap with Tab/Escape handling, lockBodyScroll utility, aria attributes

### FilterSection collapsed items focusable
- **Problem:** Children of collapsed accordion remained keyboard-focusable
- **Fix:** Added `inert` prop when collapsed

### iOS scroll lock broken
- **Problem:** `overflow:hidden` doesn't prevent scroll on iOS Safari
- **Fix:** Created `scroll-lock.ts` utility using `position: fixed` + scrollY tracking, applied to FilterSheet and Lightbox

### PriceRange listener churn
- **Problem:** Event listeners re-attached on every pixel drag due to state in deps
- **Fix:** Used refs (localMinRef, localMaxRef, onChangeRef) to avoid stale closures and unnecessary effect cleanup

### Emoji image fallback
- **Problem:** 🕯️ emoji used as image placeholder with inconsistent cross-platform rendering
- **Fix:** Changed to Sparkle icon matching ProductCard pattern, with `aria-hidden="true"`

## Phase 4 — Data Layer (2 items)

### Zod validation + try/catch at data boundary
- **Problem:** `JSON.parse` returned `any`, unsafe `as Producto[]` cast, no error handling for corrupt JSON
- **Fix:** Created `web/src/lib/productos-schema.ts` with Zod schema using `.catch()` fallbacks for all fields. `getProductos()` wraps parse in try/catch, logs errors via logger, returns empty array on failure.

### Dead field removal
- **Problem:** `precio_texto` field (~180KB in JSON) was never consumed by the UI
- **Fix:** Removed from `Producto` interface. Zod schema still accepts it (optional) to not break JSON parsing, but it's stripped from the runtime type.

## Rate Limiter

**Not changed.** In-memory Map rate limiter is ineffective across Vercel serverless instances. Fixing this requires provisioning Vercel KV or Upstash Redis — infrastructure change outside this scope. Documented in security review (0004).

## Results

| Metric | Before | After |
|---|---|---|
| SSG pages | 504 | 3,172 |
| Sitemap URLs | ~2,985 | ~3,165 |
| Build time | ~15s | ~20s |
| Bundle (shared) | 102 kB | 102 kB |
| TS errors | 0 | 0 |
| TypeScript strictness | `any` cast on JSON.parse | Zod-validated |
