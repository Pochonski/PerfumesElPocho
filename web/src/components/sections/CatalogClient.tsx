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
import { useLenis } from "lenis/react";
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
  const lenis = useLenis();

  
  const [page, setPage] = useState(1);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [facets, setFacets] = useState<Facets>(DEFAULT_FACETS);
  
  const [facetCounts, setFacetCounts] = useState<FacetCounts>(EMPTY_FACET_COUNTS);

  
  const filtrosState: FilterState = useMemo(() => {
    const fromUrl = decodeFilters(searchParams);
    return {
      ...fromUrl,
      categoria: fromUrl.categoria || initialCategory,
    };
  }, [searchParams, initialCategory]);

  
  const [searchInput, setSearchInput] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") || "";
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const pendingScrollY = useRef<number | null>(null);

  
  useEffect(() => {
    let cancelled = false;
    fetch("/api/facets")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Error ${r.status}`))))
      .then((data: Facets) => {
        if (!cancelled) setFacets(data);
      })
      .catch(() => {
        
      });
    return () => {
      cancelled = true;
    };
  }, []);

  
  useLayoutEffect(() => {
    if (pendingScrollY.current !== null) {
      const y = pendingScrollY.current;
      if (lenis) {
        lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
    }
  }, [searchParams, lenis]);

  useEffect(() => {
    if (pendingScrollY.current !== null) {
      const y = pendingScrollY.current;
      pendingScrollY.current = null;
      setTimeout(() => {
        if (lenis) {
          lenis.scrollTo(y, { immediate: true });
        } else {
          window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
        }
      }, 0);
    }
  }, [searchParams]);

  
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

  
  const [sheetOpen, setSheetOpen] = useState(false);

  
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

  
  if (loading && productos.length === 0) {
    return (
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-border-subtle" id={id}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <div className="h-6 w-32 animate-pulse rounded-full bg-skeleton-bg" />
            <div className="h-10 w-64 animate-pulse rounded-lg bg-skeleton-bg" />
            <div className="h-4 w-80 animate-pulse rounded bg-skeleton-bg" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="card-surface overflow-hidden animate-pulse">
                <div className="aspect-square bg-skeleton-bg" />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded bg-skeleton-bg w-3/4" />
                  <div className="h-4 rounded bg-skeleton-bg w-1/2" />
                  <div className="h-5 rounded bg-skeleton-bg w-1/4 mt-3" />
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
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-border-subtle" id={id}>
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-red-400">Error cargando productos: {apiError}</p>
          <button onClick={() => setPage(1)} className="mt-4 px-4 py-2 bg-hover-bg rounded-lg text-foreground">Reintentar</button>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-border-subtle" id={id}>
      <div className="mx-auto max-w-7xl">
        {}
        <div className="mb-12 flex flex-col items-center gap-3 text-center md:mb-16">
          {eyebrow && <EyebrowBadge>{eyebrow}</EyebrowBadge>}
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h2>
          {description && <p className="max-w-[56ch] text-muted-foreground">{description}</p>}
        </div>

        {}
        <div className="flex gap-6 lg:gap-8">
          {}
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

          {}
          <div className="flex-1 min-w-0">
            {}
            <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:gap-4">
              {!hideSearch && (
                <div className="relative flex-1">
                  <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Buscar fragancias..."
                    value={searchInput}
                    onChange={onSearchChange}
                    suppressHydrationWarning
                    className="card-surface w-full pl-11 pr-10 py-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-placeholder-fg"
                  />
                  {searchInput && (
                    <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Limpiar">
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
                  className="card-surface inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <SlidersHorizontal size={18} />
                  Filtros
                  {hasActiveFilters(filtrosState) && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black">
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

            <ActiveFilterChips
              state={filtrosState}
              precioMin={facets.precioRange.min}
              precioMax={facets.precioRange.max}
              onRemove={removeFilter}
              onClearAll={clearAll}
            />

            {}
            <div className="mb-4 flex items-center justify-between text-xs">
              <p className="text-muted-foreground" aria-live="polite">
                {totalPages > 1 ? (
                  <>
                    Mostrando{" "}
                    <span className="font-mono text-foreground">
                      {formatCount((page - 1) * PER_PAGE + 1)}–{formatCount(Math.min(page * PER_PAGE, total))}
                    </span>{" "}
                    de{" "}
                    <span className="font-mono text-foreground">{formatCount(total)}</span>{" "}
                    {total === 1 ? "fragancia" : "fragancias"}
                  </>
                ) : (
                  <>
                    <span className="font-mono text-foreground">{formatCount(total)}</span>{" "}
                    {total === 1 ? "fragancia" : "fragancias"}
                  </>
                )}
              </p>
              {loading && <span className="text-muted animate-pulse">Cargando...</span>}
            </div>

            {}
            {productos.length === 0 && !loading ? (
              <div className="flex flex-col items-center gap-3 py-24">
                <Sparkle size={40} className="text-muted" weight="thin" aria-hidden="true" />
                <p className="text-muted-foreground">No se encontraron fragancias.</p>
                <button type="button" onClick={clearAll} className="cursor-pointer text-sm text-accent transition-colors hover:underline">Limpiar filtros</button>
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

            {}
            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Paginación">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="cursor-pointer rounded-xl p-2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30" aria-label="Anterior">
                  <CaretLeft size={20} weight="bold" />
                </button>
                {visiblePages.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-muted">...</span>
                  ) : (
                    <button key={p} type="button" onClick={() => setPage(p as number)}
                      className={`h-9 min-w-[2.5rem] rounded-xl px-3 text-sm font-medium transition-all ${page === p ? "gold-gradient-bg text-black" : "text-muted-foreground hover:bg-hover-bg hover:text-foreground"}`}
                      aria-current={page === p ? "page" : undefined}>
                      {p}
                    </button>
                  )
                )}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="cursor-pointer rounded-xl p-2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30" aria-label="Siguiente">
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
      <div className="relative aspect-square overflow-hidden bg-image-bg">
        {imgUrl ? (
          <Image src={imgUrl} alt={producto.nombre} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Sparkle size={48} weight="thin" aria-hidden="true" />
          </div>
        )}
        {producto.categorias?.[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-price-pill-bg px-2.5 py-1 text-[10px] uppercase tracking-wider text-accent backdrop-blur-sm">
            {producto.categorias[0]}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-subtle-foreground transition-colors group-hover:text-foreground">{producto.nombre}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{producto.marca || "Sin marca"}</p>
        <p className="mt-3 text-lg font-bold gold-gradient">{formatPrice(producto.precio)}</p>
        {producto.tamano && <p className="mt-1 text-xs text-muted-foreground">{producto.tamano}</p>}
      </div>
    </a>
  );
}
