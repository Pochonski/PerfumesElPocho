# 0005 — Secondary category navigation bar

## Context

The home `/` page was a long vertical scroll with sections stacked top-to-bottom: Hero, ShippingBanner, HowItWorks, CategoryShowcase (six large category cards), CatalogSection (full catalog), FAQ, FinalCTA, Footer. Reaching a specific category required scrolling past the Hero and several other sections, then either tapping a card or scrolling further to the full catalog and using the in-page category filter. That made category-level browsing slower than it needed to be, especially for repeat visitors who already knew which shelf they wanted.

## Decision

Add a **persistent secondary navigation bar stacked directly under the main `Navbar`**, listing top-level categories as pill tabs. The bar is mounted in the root layout, so it is visible on every page, not just the home.

Tabs (in render order):

1. **Inicio** → `/`
2. **Perfumes de Mujer** → `/categoria/perfumes-de-mujer`
3. **Perfumes de Hombre** → `/categoria/perfumes-de-hombre`
4. **Perfumes Árabes/Nicho** → `/categoria/perfumes-arabes-nicho`
5. **Estuches** → `/categoria/estuches`
6. **Body Sprays** → `/categoria/body-sprays`

Tabs whose `categoryName` returns zero products from the catalog are hidden at request time (server-side), so adding the bar did not require scraping those categories first. The `Inicio` tab is always visible.

### Architecture

Three layers, separated by the React Server / Client boundary:

1. `web/src/data/category-tabs.ts` — static tab config (label, href, icon, `categoryName`, `match(pathname)` predicate). Pure data, no React.
2. `web/src/lib/category-tabs.ts` — `getVisibleCategoryTabs()` server helper that filters out empty categories using `getProductosByCategoria`. Uses the existing cached JSON read; no extra I/O per request.
3. `web/src/components/ui/CategoryTabsList.tsx` — **server** component that calls the helper and renders the client component below.
4. `web/src/components/ui/CategoryTabs.tsx` — `"use client"` renderer that takes `tabs: CategoryTab[]` and uses `usePathname()` for active state.

### Layout refactor

The main `Navbar` previously wrapped itself in `<header className="fixed ...">`. To mount a second row inside the same floating header without nesting `<header>` elements, we:

- Removed the `<header>` wrapper from `web/src/components/ui/Navbar.tsx`. The scroll-based `glass-surface` toggle now applies to a `<div>` inside the navbar.
- The `<header>` wrapper now lives in `web/app/layout.tsx`, wrapping `<Navbar />` and `<CategoryTabsList />`. Both render as siblings inside the same fixed top region and scroll together.
- Added a `--header-h` CSS variable (`globals.css`) holding the combined height of the fixed header at both breakpoints (mobile / `≥768px`), and applied it to `<div id="main-content" className="pt-[var(--header-h)]">`. Existing per-page `pt-*` classes were removed since the layout now handles the offset uniformly.

## Consequences

**Positive**

- Tabs are reachable from every page, not just home.
- Empty-category tabs are hidden automatically — no front-end and back-end drift.
- Active state is correct on deep links (e.g. `/categoria/perfumes-de-mujer`) via `usePathname()`.
- Mobile horizontal scrolling is supported via `overflow-x-auto` + `scroll-smooth`; fade-edge arrow buttons (`lg:flex`) hint at scrollability on desktop.
- The `CategoryShowcase` section on the home page (`web/src/components/sections/CategoryShowcase.tsx`) was deleted because its six-card grid became redundant with the new bar.
- Filters still work — the bars are navigation shortcuts; the existing `CatalogClient` filters, faceting, sort, and pagination are unchanged.

**Negative / things to revisit**

- The top-level navbar still renders its own `Productos / Categorías / Contacto` links, which now overlap conceptually with the new bar. Could be trimmed later.
- The category bar reuses the existing `/categoria/[slug]` route for all tabs. Slugs that are not yet in `productos.json` (Árabes/Nicho, Estuches, Body Sprays) are filtered out today but the bar re-orders to the left once they ship — the `match` predicate must stay in sync with the slug.
- The `--header-h` value is hand-tuned (168 / 124 px). If the navbar or tab pill sizes change, this needs to be updated and visual regressions are possible.
- Mobile order: navbar row → search row → tabs row. The mobile search row pushed below the navbar still works but takes vertical space; consider folding the search into the mobile drawer later.

## Files

- New: `web/src/data/category-tabs.ts`, `web/src/lib/category-tabs.ts`, `web/src/components/ui/CategoryTabs.tsx`, `web/src/components/ui/CategoryTabsList.tsx`
- Edited: `web/app/layout.tsx`, `web/app/globals.css`, `web/app/page.tsx`, `web/app/categoria/[slug]/page.tsx`, `web/app/marca/[slug]/page.tsx`, `web/app/guias/page.tsx`, `web/app/guias/[slug]/page.tsx`, `web/app/search/page.tsx`, `web/app/producto/[id]/page.tsx`, `web/src/components/ui/Navbar.tsx`
- Removed: `web/src/components/sections/CategoryShowcase.tsx`
