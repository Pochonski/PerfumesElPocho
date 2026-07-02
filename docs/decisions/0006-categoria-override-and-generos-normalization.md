# 0006 — Categoria override and generos normalization

## Context

Two related correctness bugs surfaced together on the category page `/categoria/perfumes-de-mujer`:

1. The page rendered 2,848 products (the full catalog) instead of the 1,262 in the mujer category. Men products appeared next to women products even though the URL slug was correct.
2. The "Género" filter sidebar showed inflated counts: Mujer 2,848, Hombre 2,749, Unisex 2,749, Niños 71 — totals way above the actual dataset distribution because they were triple-counting each product.

The user reported it as "salen perfumes de hombre en /categoria/perfumes-de-mujer".

## Root causes

### 1. Categoria override lost initialCategory

`web/src/components/sections/CatalogClient.tsx:108` derived the active `categoria` filter like this:

```ts
const filtrosState = useMemo(() => {
  const fromUrl = decodeFilters(searchParams);
  return { ...fromUrl, categoria: fromUrl.categoria || initialCategory };
}, [searchParams, initialCategory]);
```

`decodeFilters()` in `web/src/lib/filter-state.ts:82` returns `categoria: "Todos"` when no `?c=` param is present. `"Todos" || initialCategory` evaluates to `"Todos"` because `"Todos"` is truthy, so `initialCategory` was silently dropped on the initial render. The home `/` page worked because there `initialCategory` defaults to `"Todos"`, but every `/categoria/[slug]` page lost its slug-locked category the moment a user landed without query params.

The result: the URL said "mujer" but the API request said `categoria=Todos` and returned every product.

### 2. generos[] was a triple-counted array

`web/src/lib/productos.ts:110-115` used to backfill `generos[]` from `genero.split(",")`:

```ts
if (p.generos.length === 0 && p.genero) {
  p.generos = p.genero.split(",").map(g => g.trim()).filter(Boolean);
}
```

The scraper writes `genero: "Mujer, Hombre, Unisex"` literally on almost every product (the source attribute is the run-time concatenation of all gender columns from the supplier's catalog). Splitting that string produced `generos = ["Mujer", "Hombre", "Unisex"]` per product, so every filter the user could pick counted each product thrice. Compounding the issue, `getFacetCounts()` then re-counted `generos` per product, inflating the sidebar numbers.

## Decisions

### Categoria resolution rule

`CatalogClient.tsx` now resolves the active `categoria` with this precedence:

1. If `initialCategory` is provided and not `"Todos"`, and the URL `?c=` is either missing or equals `"Todos"`, use `initialCategory`.
2. Otherwise, if the URL has an explicit non-`"Todos"` value, use that.
3. Otherwise, fall back to `initialCategory ?? "Todos"`.

This means on `/categoria/[slug]` the slug always wins. The category tab bar at the top is the canonical way to switch; the "Categoría" sidebar checkbox keeps working on the home page (where `initialCategory` is `"Todos"`) but no longer lets a user "clear" the slug on a category page by clicking Todos (which produced the bug). If we ever need that back, add an explicit `lockCategoria` prop to `CatalogSection`.

### generos[] now mirrors categorias gender

`normalizeGeneros(p)` runs alongside `normalizeCategorias(p)` in `getProductos()`. It calls the same `resolveGenderCategoria(p)` and maps the result to the short form used by the filter UI:

```
Perfumes de mujer   → ["Mujer"]
Perfumes de hombre  → ["Hombre"]
Perfumes unisex     → ["Unisex"]
```

Each product now has at most one entry in `generos[]`. Facet counts become accurate, the gender filter on the API and the facet helper in `lib/productos.ts:256` (which uses `p.generos.some(g => active.generos.includes(g))`) keeps working because the equality check still resolves per token.

The legacy backfill from `genero.split(",")` was removed — it was the source of the triple-count.

## Consequences

**Positive**

- `/categoria/perfumes-de-mujer` now shows 1,262 mujer products, no men.
- Sidebar "Género" counts accurately reflect each subset (e.g., inside the mujer filter, Mujer ≈ 1,262, Hombre 0, Unisex 0).
- Title on category pages reads "Perfumes de mujer | Perfumes El Pocho" (was "Perfumes Perfumes de mujer").
- The legacy `genero.split(",")` free-for-all is gone; `generos[]` is now a single-token view of the same gender resolved for `categorias[]`.

**Negative / open questions**

- If a future feature relies on `producto.generos` being a list of multiple values for cross-gender cross-sell, we lose that signal here. Today nothing depends on it.
- The "Limpiar todo" button on a category page still resets filtros, but `categoria` is re-resolved to `initialCategory` on the next render, so the list visibly snaps back. That is intentional given the slug-locked rule.
- The category page's `<title>` and `<meta description>` deduplication is a separate cosmetic fix that travels with this commit because both files were being touched.

## Files

- Edited: `web/src/components/sections/CatalogClient.tsx`, `web/src/lib/productos.ts`, `web/app/categoria/[slug]/page.tsx`
