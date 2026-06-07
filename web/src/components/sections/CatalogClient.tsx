"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
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
import { formatPrice } from "@/lib/format";
import {
  decodeFilters,
  encodeFilters,
  hasActiveFilters,
  type FilterState,
} from "@/lib/filter-state";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { FilterSheet } from "@/components/filters/FilterSheet";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import { SortDropdown } from "@/components/filters/SortDropdown";
import type { Producto } from "@/lib/productos";

const PER_PAGE = 24;

interface CatalogClientProps {
  initialCategory?: string;
  availableCategories?: string[];
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}

interface ApiResponse {
  items: Producto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CatalogClient({
  initialCategory = "Todos",
  availableCategories,
  eyebrow = "Catálogo",
  title,
  description,
  id = "productos",
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
  /* Version counter para forzar re-fetch cuando filtros cambian */
  const [filterVersion, setFilterVersion] = useState(0);

  /* Filtros: ref para evitar stale closures, state para render */
  const filtrosRef = useRef<FilterState>({
    categoria: initialCategory,
    marcas: [],
    familias: [],
    ocasiones: [],
    generos: [],
    precioMin: null,
    precioMax: null,
    sort: undefined,
    q: "",
  });
  const [filtrosState, setFiltrosState] = useState<FilterState>(filtrosRef.current);

  /* Solo inicializar desde URL una vez al montar */
  const initRef = useRef(false);
  if (!initRef.current && searchParams) {
    initRef.current = true;
    const fromUrl = decodeFilters(searchParams);
    const inicial: FilterState = {
      ...fromUrl,
      categoria: fromUrl.categoria || initialCategory,
    };
    filtrosRef.current = inicial;
    setFiltrosState(inicial);
  }

  /* Sync con URL cuando cambia (back/forward) */
  useEffect(() => {
    const fromUrl = decodeFilters(searchParams);
    const next: FilterState = {
      ...fromUrl,
      categoria: fromUrl.categoria || initialCategory,
    };
    // Solo actualizar si realmente cambió
    if (JSON.stringify(next) !== JSON.stringify(filtrosRef.current)) {
      filtrosRef.current = next;
      setFiltrosState(next);
      setPage(1);
    }
  }, [searchParams, initialCategory]);

  /* Fetch productos: solo se dispara cuando cambian filtrosRef o page */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setApiError(null);

    const filtros = filtrosRef.current;
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
    if (filtros.sort) qs.set("sort", filtros.sort);

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
  }, [page, filterVersion]);

  /* pushState: actualiza URL + ref + state, resetea página */
  const pushState = useCallback(
    (next: FilterState) => {
      filtrosRef.current = next;
      setFiltrosState(next);
      setPage(1);
      setFilterVersion((v) => v + 1);
      const params = encodeFilters(next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  /* Search debounced */
  const [searchInput, setSearchInput] = useState(filtrosRef.current.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentQ = filtrosRef.current.q;
    if (searchInput === currentQ) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushState({ ...filtrosRef.current, q: searchInput });
    }, 300);
  }, [searchInput, pushState]);

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
      sort: undefined,
    });
    setSearchInput("");
  }, [pushState, initialCategory]);

  /* Remove single filter */
  const removeFilter = useCallback(
    (
      field: "categoria" | "marca" | "familia" | "ocasion" | "genero" | "precio" | "q",
      value?: string
    ) => {
      const current = filtrosRef.current;
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
    [pushState]
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
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5" id={id}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <div className="h-6 w-32 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-4 w-80 animate-pulse rounded bg-zinc-800/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="card-surface overflow-hidden animate-pulse">
                <div className="aspect-square bg-zinc-800/50" />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded bg-zinc-800/50 w-3/4" />
                  <div className="h-4 rounded bg-zinc-800/50 w-1/2" />
                  <div className="h-5 rounded bg-zinc-800/50 w-1/4 mt-3" />
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
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5" id={id}>
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-red-400">Error cargando productos: {apiError}</p>
          <button onClick={() => setPage(1)} className="mt-4 px-4 py-2 bg-zinc-800 rounded-lg">Reintentar</button>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5" id={id}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center md:mb-16">
          {eyebrow && <EyebrowBadge>{eyebrow}</EyebrowBadge>}
          <h2 className="text-3xl font-semibold tracking-tighter text-white md:text-5xl">{title}</h2>
          {description && <p className="max-w-[56ch] text-zinc-400">{description}</p>}
        </div>

        {/* Main layout */}
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <div className="hidden w-72 shrink-0 lg:block xl:w-80">
            <FilterPanel
              state={filtrosState}
              productos={productos}
              precioMin={0}
              precioMax={500000}
              categorias={availableCategories ?? ["Todos"]}
              marcas={[]}
              familias={[]}
              ocasiones={[]}
              generos={[]}
              onChange={pushState}
              onClear={clearAll}
            />
          </div>

          {/* Grid + Pagination */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort */}
            <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  placeholder="Buscar fragancias..."
                  value={searchInput}
                  onChange={onSearchChange}
                  className="card-surface w-full pl-11 pr-10 py-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-zinc-600"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" aria-label="Limpiar">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <SortDropdown value={filtrosState.sort || "default"} onChange={(sort) => pushState({ ...filtrosState, sort })} />
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="card-surface inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-white md:hidden"
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
              <p className="text-zinc-500" aria-live="polite">
                <span className="font-mono text-white">{total.toLocaleString("es-CR")}</span> {total === 1 ? "fragancia" : "fragancias"}
              </p>
              {loading && <span className="text-zinc-600 animate-pulse">Cargando...</span>}
            </div>

            {/* Grid */}
            {productos.length === 0 && !loading ? (
              <div className="flex flex-col items-center gap-3 py-24">
                <Sparkle size={40} className="text-zinc-700" weight="thin" aria-hidden="true" />
                <p className="text-zinc-500">No se encontraron fragancias.</p>
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
                  className="cursor-pointer rounded-xl p-2 text-zinc-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Anterior">
                  <CaretLeft size={20} weight="bold" />
                </button>
                {visiblePages.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-zinc-600">...</span>
                  ) : (
                    <button key={p} type="button" onClick={() => setPage(p as number)}
                      className={`h-9 min-w-[2.5rem] rounded-xl px-3 text-sm font-medium transition-all ${page === p ? "gold-gradient-bg text-black" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                      aria-current={page === p ? "page" : undefined}>
                      {p}
                    </button>
                  )
                )}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="cursor-pointer rounded-xl p-2 text-zinc-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Siguiente">
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
        state={filtrosState}
        productos={productos}
        precioMin={0}
        precioMax={500000}
        categorias={availableCategories ?? ["Todos"]}
        marcas={[]}
        familias={[]}
        ocasiones={[]}
        generos={[]}
        onChange={pushState}
        onClear={clearAll}
      />
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
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-700">
            <Sparkle size={48} weight="thin" aria-hidden="true" />
          </div>
        )}
        {producto.categorias?.[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#c8a84e] backdrop-blur-sm">
            {producto.categorias[0]}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-white/90 transition-colors group-hover:text-white">{producto.nombre}</h3>
        <p className="mt-1 text-xs text-zinc-500">{producto.marca || "Sin marca"}</p>
        <p className="mt-3 text-lg font-bold bg-gradient-to-r from-[#c8a84e] to-[#e8c97e] bg-clip-text text-transparent">{formatPrice(producto.precio)}</p>
        {producto.tamano && <p className="mt-1 text-xs text-zinc-500">{producto.tamano}</p>}
      </div>
    </a>
  );
}
