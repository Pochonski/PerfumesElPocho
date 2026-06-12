"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Sparkle,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import { formatPrice, formatCount } from "@/lib/format";
import {
  decodeFilters,
  encodeFilters,
  hasActiveFilters,
  type FilterState,
} from "@/lib/filter-state";
import { FilterPanel, FilterPanelBody } from "@/components/filters/FilterPanel";
import { FilterSheet } from "@/components/filters/FilterSheet";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { EMPTY_FACET_COUNTS, type FacetCounts } from "@/lib/facet-counts";
import type { Producto } from "@/lib/productos";

const PER_PAGE = 24;

interface Facets {
  categorias: string[];
  marcas: string[];
  familias: string[];
  ocasiones: string[];
  generos: string[];
  precioRange: { min: number; max: number };
}

const DEFAULT_FACETS: Facets = {
  categorias: [],
  marcas: [],
  familias: [],
  ocasiones: [],
  generos: [],
  precioRange: { min: 0, max: 500000 },
};

interface CatalogClientProps {
  initialCategory?: string;
  availableCategories?: string[];
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  /** Oculta el input de búsqueda interno. Usar cuando ya hay un SearchBar global
   *  (p.ej. en /search, donde la Navbar ya provee búsqueda). */
  hideSearch?: boolean;
}

interface ApiResponse {
  items: Producto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  facetCounts?: FacetCounts;
}

export default function CatalogClient({
  initialCategory = "Todos",
  availableCategories,
  eyebrow = "Catálogo",
  title,
  description,
  id = "productos",
  hideSearch = false,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* Estado base: se inicializa desde URL al montar */
  const [page, setPage] = useState(1);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  /* Facets cargados una sola vez desde /api/facets para alimentar Marca/Familia/Ocasión/Género */
  const [facets, setFacets] = useState<Facets>(DEFAULT_FACETS);
  /* Counts por valor de cada facet, devueltos por /api/productos en cada response.
      Permiten mostrar "Adidas (234)" en el panel con el número real sobre el universo
      filtrado (no sobre los 24 productos de la página actual). */
  const [facetCounts, setFacetCounts] = useState<FacetCounts>(EMPTY_FACET_COUNTS);

  /* filtrosState derivado directamente de searchParams (URL = única fuente de verdad).
     Cualquier cambio en la URL (deep-link, click en filtro, back/forward) re-deriva
     este valor, eliminando la race condition entre useLayoutEffect (sync URL→state)
     y useEffect (fetch con state) que existía en la versión anterior. */
  const filtrosState: FilterState = useMemo(() => {
    const fromUrl = decodeFilters(searchParams);
    return {
      ...fromUrl,
      categoria: fromUrl.categoria || initialCategory,
    };
  }, [searchParams, initialCategory]);

  /* Search input local. Inicializado desde window.location en client para evitar
     flash de input vacío en deep-links con ?q=... . El input es controlado y se
     sincroniza con filtrosState.q via el debounce effect más abajo. */
  const [searchInput, setSearchInput] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") || "";
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Ref para preservar scroll position across filter changes. router.replace con
     scroll:false no funciona cuando solo cambia el query string (limitación de
     Next 15.5.19), así que guardamos window.scrollY antes del replace y lo
     restauramos en useLayoutEffect después del re-render. */
  const pendingScrollY = useRef<number | null>(null);

  /* Cargar facets (marcas, familias, ocasiones, géneros, categorías, precioRange) una sola vez */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/facets")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Error ${r.status}`))))
      .then((data: Facets) => {
        if (!cancelled) setFacets(data);
      })
      .catch(() => {
        /* Silenciar: mantenemos DEFAULT_FACETS, los filtros se renderizan vacíos */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Restaurar scroll si quedó pendiente de un pushState. Sin array de deps para
     que corra después de CADA commit; el ref se limpia al primer hit así que
     en el 99% de los renders es un no-op (costo: una comparación). Corre
     síncronamente antes del paint, así que el usuario nunca ve el scroll-to-top
     que router.replace causa al cambiar query params. */
  useLayoutEffect(() => {
    if (pendingScrollY.current !== null) {
      const y = pendingScrollY.current;
      pendingScrollY.current = null;
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    }
  });

  /* Fetch productos: se dispara cuando cambian searchParams (URL) o page.
     filtrosState se deriva de searchParams vía useMemo, así que con searchParams
     en deps cubrimos cualquier cambio de filtros sin duplicar el source of truth. */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setApiError(null);

    const filtros = filtrosState;
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("perPage", String(PER_PAGE));
    if (filtros.categoria && filtros.categoria !== "Todos") qs.set("categoria", filtros.categoria);
    if (filtros.q) qs.set("q", filtros.q);
    if (filtros.marcas.length > 0) qs.set("marcas", filtros.marcas.join(","));
    if (filtros.familias.length > 0) qs.set("familias", filtros.familias.join(","));
    if (filtros.ocasiones.length > 0) qs.set("ocasiones", filtros.ocasiones.join(","));
    if (filtros.generos.length > 0) qs.set("generos", filtros.generos.join(","));
    if (filtros.precioMin != null) qs.set("precioMin", String(filtros.precioMin));
    if (filtros.precioMax != null) qs.set("precioMax", String(filtros.precioMax));
    if (filtros.sort && filtros.sort !== "relevancia") qs.set("sort", filtros.sort);

    fetch(`/api/productos?${qs.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((data: ApiResponse) => {
        if (!cancelled) {
          setProductos(data.items || []);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          if (data.facetCounts) setFacetCounts(data.facetCounts);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setApiError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, page, filtrosState]);

  /* pushState: actualiza SOLO la URL. filtrosState se re-deriva via useMemo
     cuando searchParams cambia, y el fetch effect re-corre por searchParams en deps.
     Resetear `page` localmente para que volver a página 1 al cambiar filtros.
     Guardamos window.scrollY en pendingScrollY para que el useLayoutEffect de
     scroll restoration lo restaure después del re-render (router.replace con
     scroll:false no previene scroll-to-top en Next 15.5.19). */
  const pushState = useCallback(
    (next: FilterState) => {
      setPage(1);
      pendingScrollY.current = window.scrollY;
      const params = encodeFilters(next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  /* Search debounced: tipear en el input cambia searchInput, después de 300ms
     se pushea al state (y URL) si difiere del q actual. */
  useEffect(() => {
    const currentQ = filtrosState.q;
    if (searchInput === currentQ) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushState({ ...filtrosState, q: searchInput });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, filtrosState, pushState]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  /* Clear all */
  const clearAll = useCallback(() => {
    pushState({
      categoria: initialCategory,
      marcas: [],
      familias: [],
      ocasiones: [],
      generos: [],
      precioMin: null,
      precioMax: null,
      q: "",
      sort: "relevancia",
    });
    setSearchInput("");
  }, [pushState, initialCategory]);

  /* Remove single filter */
  const removeFilter = useCallback(
    (
      field: "categoria" | "marca" | "familia" | "ocasion" | "genero" | "precio" | "q",
      value?: string
    ) => {
      const current = filtrosState;
      if (field === "categoria") { pushState({ ...current, categoria: "Todos" }); return; }
      if (field === "q") { pushState({ ...current, q: "" }); setSearchInput(""); return; }
      if (field === "precio") { pushState({ ...current, precioMin: null, precioMax: null }); return; }
      if (!value) return;
      const keyMap: Partial<Record<typeof field, keyof FilterState>> = {
        marca: "marcas", familia: "familias", ocasion: "ocasiones", genero: "generos",
      };
      const stateKey = keyMap[field];
      if (stateKey) {
        pushState({ ...current, [stateKey]: (current[stateKey] as string[]).filter((v) => v !== value) });
      }
    },
    [pushState, filtrosState]
  );

  /* Mobile sheet */
  const [sheetOpen, setSheetOpen] = useState(false);

  /* Pagination */
  const visiblePages = useMemo(() => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, page]);

  /* Loading skeleton */
  if (loading && productos.length === 0) {
    return (
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-[color:var(--border-subtle)]" id={id}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <div className="h-6 w-32 animate-pulse rounded-full bg-[color:var(--skeleton-bg)]" />
            <div className="h-10 w-64 animate-pulse rounded-lg bg-[color:var(--skeleton-bg)]" />
            <div className="h-4 w-80 animate-pulse rounded bg-[color:var(--skeleton-bg)]" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="card-surface overflow-hidden animate-pulse">
                <div className="aspect-square bg-[color:var(--skeleton-bg)]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded bg-[color:var(--skeleton-bg)] w-3/4" />
                  <div className="h-4 rounded bg-[color:var(--skeleton-bg)] w-1/2" />
                  <div className="h-5 rounded bg-[color:var(--skeleton-bg)] w-1/4 mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (apiError && productos.length === 0) {
    return (
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-[color:var(--border-subtle)]" id={id}>
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-red-400">Error cargando productos: {apiError}</p>
          <button onClick={() => setPage(1)} className="mt-4 px-4 py-2 bg-[color:var(--hover-bg)] rounded-lg text-[color:var(--foreground)]">Reintentar</button>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-[color:var(--border-subtle)]" id={id}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center md:mb-16">
          {eyebrow && <EyebrowBadge>{eyebrow}</EyebrowBadge>}
          <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-5xl">{title}</h2>
          {description && <p className="max-w-[56ch] text-[color:var(--muted-foreground)]">{description}</p>}
        </div>

        {/* Main layout */}
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <div className="hidden w-72 shrink-0 lg:block xl:w-80">
            <FilterPanel
              state={filtrosState}
              precioMin={facets.precioRange.min}
              precioMax={facets.precioRange.max}
              categorias={facets.categorias}
              marcas={facets.marcas}
              familias={facets.familias}
              ocasiones={facets.ocasiones}
              generos={facets.generos}
              facetCounts={facetCounts}
              onChange={pushState}
              onClear={clearAll}
            />
          </div>

          {/* Grid + Pagination */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort */}
            <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:gap-4">
              {!hideSearch && (
                <div className="relative flex-1">
                  <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                  <input
                    type="search"
                    placeholder="Buscar fragancias..."
                    value={searchInput}
                    onChange={onSearchChange}
                    suppressHydrationWarning
                    className="card-surface w-full pl-11 pr-10 py-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-[color:var(--placeholder-fg)]"
                  />
                  {searchInput && (
                    <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]" aria-label="Limpiar">
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
              <div className={`flex items-center gap-3 ${hideSearch ? "ml-auto" : ""}`}>
                <SortDropdown value={filtrosState.sort || "default"} onChange={(sort) => pushState({ ...filtrosState, sort })} />
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="card-surface inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] md:hidden"
                >
                  <SlidersHorizontal size={18} />
                  Filtros
                  {hasActiveFilters(filtrosState, initialCategory) && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c8a84e] text-[10px] font-bold text-black">
                      {[
                        filtrosState.categoria !== initialCategory,
                        ...filtrosState.marcas,
                        ...filtrosState.familias,
                        ...filtrosState.ocasiones,
                        ...filtrosState.generos,
                        filtrosState.precioMin != null || filtrosState.precioMax != null,
                        !!filtrosState.q,
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <ActiveFilterChips state={filtrosState} initialCategory={initialCategory} onRemove={removeFilter} onClear={clearAll} />

            {/* Count */}
            <div className="mb-4 flex items-center justify-between text-xs">
              <p className="text-[color:var(--muted-foreground)]" aria-live="polite">
                {totalPages > 1 ? (
                  <>
                    Mostrando{" "}
                    <span className="font-mono text-[color:var(--foreground)]">
                      {formatCount((page - 1) * PER_PAGE + 1)}–{formatCount(Math.min(page * PER_PAGE, total))}
                    </span>{" "}
                    de{" "}
                    <span className="font-mono text-[color:var(--foreground)]">{formatCount(total)}</span>{" "}
                    {total === 1 ? "fragancia" : "fragancias"}
                  </>
                ) : (
                  <>
                    <span className="font-mono text-[color:var(--foreground)]">{formatCount(total)}</span>{" "}
                    {total === 1 ? "fragancia" : "fragancias"}
                  </>
                )}
              </p>
              {loading && <span className="text-[color:var(--muted)] animate-pulse">Cargando...</span>}
            </div>

            {/* Grid */}
            {productos.length === 0 && !loading ? (
              <div className="flex flex-col items-center gap-3 py-24">
                <Sparkle size={40} className="text-[color:var(--muted)]" weight="thin" aria-hidden="true" />
                <p className="text-[color:var(--muted-foreground)]">No se encontraron fragancias.</p>
                <button type="button" onClick={clearAll} className="cursor-pointer text-sm text-[#c8a84e] transition-colors hover:underline">Limpiar filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {productos.map((p, i) => (
                  <AnimatedItem key={p.id} index={i % PER_PAGE}>
                    <ProductCard producto={p} />
                  </AnimatedItem>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Paginación">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="cursor-pointer rounded-xl p-2 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Anterior">
                  <CaretLeft size={20} weight="bold" />
                </button>
                {visiblePages.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-[color:var(--muted)]">...</span>
                  ) : (
                    <button key={p} type="button" onClick={() => setPage(p as number)}
                      className={`h-9 min-w-[2.5rem] rounded-xl px-3 text-sm font-medium transition-all ${page === p ? "gold-gradient-bg text-black" : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--hover-bg)] hover:text-[color:var(--foreground)]"}`}
                      aria-current={page === p ? "page" : undefined}>
                      {p}
                    </button>
                  )
                )}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="cursor-pointer rounded-xl p-2 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Siguiente">
                  <CaretRight size={20} weight="bold" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros"
      >
        <FilterPanelBody
          state={filtrosState}
          precioMin={facets.precioRange.min}
          precioMax={facets.precioRange.max}
          categorias={facets.categorias}
          marcas={facets.marcas}
          familias={facets.familias}
          ocasiones={facets.ocasiones}
          generos={facets.generos}
          facetCounts={facetCounts}
          onChange={pushState}
          onClear={clearAll}
        />
      </FilterSheet>
    </AnimatedSection>
  );
}

function ProductCard({ producto }: { producto: Producto }) {
  const imgUrl = producto.imagenes?.[0] || null;

  return (
    <a href={`/producto/${producto.id}`} className="card-surface card-surface-hover group block overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-[var(--image-bg)]">
        {imgUrl ? (
          <Image src={imgUrl} alt={producto.nombre} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
            <Sparkle size={48} weight="thin" aria-hidden="true" />
          </div>
        )}
        {producto.categorias?.[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-[color:var(--price-pill-bg)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#c8a84e] backdrop-blur-sm">
            {producto.categorias[0]}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-[color:var(--subtle-foreground)] transition-colors group-hover:text-[color:var(--foreground)]">{producto.nombre}</h3>
        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{producto.marca || "Sin marca"}</p>
        <p className="mt-3 text-lg font-bold gold-gradient">{formatPrice(producto.precio)}</p>
        {producto.tamano && <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{producto.tamano}</p>}
      </div>
    </a>
  );
}
