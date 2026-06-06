"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useDeferredValue,
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
import { normalizeText } from "@/lib/utils";
import {
  decodeFilters,
  encodeFilters,
  hasActiveFilters,
  type FilterState,
  type SortKey,
} from "@/lib/filter-state";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { FilterSheet } from "@/components/filters/FilterSheet";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import { SortDropdown } from "@/components/filters/SortDropdown";
import type { Producto } from "@/lib/productos";

const PER_PAGE = 24;

interface CatalogClientProps {
  productos: Producto[];
  /** Categoría preseleccionada (para páginas /categoria/[slug]) */
  initialCategory?: string;
  /** Categorías disponibles. Si no se pasa, se calculan */
  availableCategories?: string[];
  /** Eyebrow del header */
  eyebrow?: string;
  /** Título del header */
  title: string;
  /** Descripción del header */
  description?: string;
  /** ID opcional de la sección */
  id?: string;
}

export default function CatalogClient({
  productos,
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

  /* === Estado de filtros (sincronizado con URL) === */
  const [state, setState] = useState<FilterState>(() => {
    const fromUrl = decodeFilters(searchParams);
    return { ...fromUrl, categoria: fromUrl.categoria || initialCategory };
  });

  // Si cambia el searchParams externo (back/forward), sincronizar
  useEffect(() => {
    const fromUrl = decodeFilters(searchParams);
    setState((s) => {
      const next: FilterState = {
        ...s,
        ...fromUrl,
        categoria: fromUrl.categoria || initialCategory,
      };
      return JSON.stringify(next) === JSON.stringify(s) ? s : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const pushState = useCallback(
    (next: FilterState) => {
      const params = encodeFilters(next);
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
      setState(next);
    },
    [pathname, router]
  );

  /* === Search debounced === */
  const [searchInput, setSearchInput] = useState(state.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchInput === state.q) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushState({ ...state, q: searchInput });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  /* === Pagination === */
  const [page, setPage] = useState(1);
  // Reset page cuando cambia cualquier filtro
  useEffect(() => {
    setPage(1);
  }, [state]);

  /* === Facets disponibles === */
  const facets = useMemo(() => {
    const cats = availableCategories ?? Array.from(
      new Set(productos.flatMap((p) => p.categorias))
    ).sort();

    const marcas = Array.from(
      new Set(productos.map((p) => p.marca).filter(Boolean))
    ).sort();

    const familias = Array.from(
      new Set(productos.flatMap((p) => p.familias_olfativas))
    ).sort();

    const ocasiones = Array.from(
      new Set(productos.flatMap((p) => p.ocasiones))
    ).sort();

    const generos = Array.from(
      new Set(productos.flatMap((p) => p.generos))
    ).sort();

    let precioMin = Infinity;
    let precioMax = -Infinity;
    for (const p of productos) {
      if (p.precio < precioMin) precioMin = p.precio;
      if (p.precio > precioMax) precioMax = p.precio;
    }
    if (!isFinite(precioMin)) precioMin = 0;
    if (!isFinite(precioMax)) precioMax = 0;

    return {
      categorias: cats,
      marcas,
      familias,
      ocasiones,
      generos,
      precioMin,
      precioMax,
    };
  }, [productos, availableCategories]);

  /* === Filtrado === */
  const deferredState = useDeferredValue(state);

  const filtered = useMemo(() => {
    const q = normalizeText(state.q);
    let out = productos;

    if (state.categoria !== "Todos") {
      out = out.filter((p) => p.categorias.includes(state.categoria));
    }
    if (state.marcas.length > 0) {
      out = out.filter((p) => state.marcas.includes(p.marca));
    }
    if (state.familias.length > 0) {
      out = out.filter((p) =>
        p.familias_olfativas.some((f) => state.familias.includes(f))
      );
    }
    if (state.ocasiones.length > 0) {
      out = out.filter((p) =>
        p.ocasiones.some((o) => state.ocasiones.includes(o))
      );
    }
    if (state.generos.length > 0) {
      out = out.filter((p) =>
        p.generos.some((g) => state.generos.includes(g))
      );
    }
    if (state.precioMin != null) {
      out = out.filter((p) => p.precio >= state.precioMin!);
    }
    if (state.precioMax != null) {
      out = out.filter((p) => p.precio <= state.precioMax!);
    }
    if (q) {
      out = out.filter((p) => {
        const haystack = normalizeText([
          p.nombre,
          p.marca,
          p.descripcion,
          p.resumen,
          p.familia_olfativa,
          p.concentracion,
        ]
          .filter(Boolean)
          .join(" "));
        return haystack.includes(q);
      });
    }

    // Sort
    if (state.sort === "precio-asc") {
      out = [...out].sort((a, b) => a.precio - b.precio);
    } else if (state.sort === "precio-desc") {
      out = [...out].sort((a, b) => b.precio - a.precio);
    } else if (state.sort === "nombre-asc") {
      out = [...out].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return out;
  }, [productos, state, deferredState]);

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const items = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  const visiblePages = useMemo(() => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, page]);

  const clearAll = useCallback(() => {
    pushState({
      ...state,
      categoria: initialCategory,
      marcas: [],
      familias: [],
      ocasiones: [],
      generos: [],
      precioMin: null,
      precioMax: null,
      q: "",
    });
    setSearchInput("");
  }, [pushState, state, initialCategory]);

  const removeFilter = useCallback(
    (
      field:
        | "categoria"
        | "marca"
        | "familia"
        | "ocasion"
        | "genero"
        | "precio"
        | "q",
      value?: string
    ) => {
      if (field === "categoria") {
        pushState({ ...state, categoria: "Todos" });
        return;
      }
      if (field === "q") {
        pushState({ ...state, q: "" });
        setSearchInput("");
        return;
      }
      if (field === "precio") {
        pushState({ ...state, precioMin: null, precioMax: null });
        return;
      }
      if (!value) return;
      const keyMap: Partial<Record<typeof field, keyof FilterState>> = {
        marca: "marcas",
        familia: "familias",
        ocasion: "ocasiones",
        genero: "generos",
      };
      const key = keyMap[field];
      if (!key) return;
      const current = state[key] as string[];
      pushState({ ...state, [key]: current.filter((v) => v !== value) });
    },
    [pushState, state]
  );

  const onSortChange = (sort: SortKey) => pushState({ ...state, sort });

  const isFiltering = hasActiveFilters(state);

  /* === Mobile sheet state === */
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <AnimatedSection id={id} className="px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
          <EyebrowBadge>{eyebrow}</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tighter text-[color:var(--foreground)] md:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-[48ch] text-[color:var(--muted-foreground)]">
              {description}
            </p>
          )}
        </div>

        {/* Search + sort bar */}
        <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:gap-4">
          <label
            htmlFor="catalog-search"
            className="card-surface relative flex flex-1 items-center gap-2 rounded-2xl px-4 py-3 transition-all focus-within:border-[color:var(--accent)]/40 focus-within:ring-1 focus-within:ring-[color:var(--accent)]/20"
          >
            <span className="sr-only">Buscar perfume</span>
            <MagnifyingGlass
              size={18}
              className="shrink-0 text-[color:var(--muted)]"
              weight="bold"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              placeholder="Buscar por nombre, marca o descripción…"
              aria-label="Buscar perfume"
              value={searchInput}
              onChange={onSearchChange}
              className="w-full bg-transparent text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  pushState({ ...state, q: "" });
                }}
                className="cursor-pointer rounded p-1 text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="card-surface inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:border-[color:var(--accent)]/40 md:hidden"
            >
              <SlidersHorizontal size={16} weight="bold" />
              Filtros
              {isFiltering && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-bold text-black">
                  ●
                </span>
              )}
            </button>
            <SortDropdown value={state.sort} onChange={onSortChange} />
          </div>
        </div>

        {/* Active filter chips */}
        {isFiltering && (
          <div className="mb-5">
            <ActiveFilterChips
              state={state}
              onRemove={removeFilter}
              onClearAll={clearAll}
              precioMin={facets.precioMin}
              precioMax={facets.precioMax}
            />
          </div>
        )}

        {/* Main layout: Sidebar + Grid */}
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <div className="hidden w-72 shrink-0 lg:block xl:w-80">
            <FilterPanel
              state={state}
              productos={productos}
              precioMin={facets.precioMin}
              precioMax={facets.precioMax}
              categorias={facets.categorias}
              marcas={facets.marcas}
              familias={facets.familias}
              ocasiones={facets.ocasiones}
              generos={facets.generos}
              onChange={pushState}
              onClear={clearAll}
            />
          </div>

          {/* Grid + Pagination */}
          <div className="flex-1 min-w-0">
            {/* Count */}
            <div className="mb-4 flex items-center justify-between text-xs">
              <p className="text-[color:var(--muted-foreground)]" aria-live="polite">
                <span className="font-mono text-[color:var(--foreground)]">
                  {total.toLocaleString("es-CR")}
                </span>{" "}
                {total === 1 ? "fragancia" : "fragancias"}
              </p>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-24">
                <Sparkle
                  size={40}
                  className="text-[color:var(--muted)]"
                  weight="thin"
                  aria-hidden="true"
                />
                <p className="text-[color:var(--muted-foreground)]">
                  No se encontraron fragancias.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer text-sm text-[color:var(--accent)] transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <AnimatedItem key={p.id} index={i % PER_PAGE}>
                    <ProductCard producto={p} />
                  </AnimatedItem>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-center gap-1"
                aria-label="Paginación de productos"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="cursor-pointer rounded-xl p-2 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Página anterior"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>

                {visiblePages.map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dots-${i}`}
                      className="px-2 text-sm text-[color:var(--muted)]"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={page === p ? "page" : undefined}
                      aria-label={`Ir a página ${p}`}
                      className={`cursor-pointer min-w-[36px] rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
                        page === p
                          ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                          : "border-transparent text-[color:var(--muted-foreground)] hover:bg-[color:var(--foreground)]/5 hover:text-[color:var(--foreground)]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="cursor-pointer rounded-xl p-2 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Página siguiente"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros"
        footer={
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="gold-gradient-bg w-full cursor-pointer rounded-2xl py-3 text-sm font-semibold text-black transition-all hover:brightness-110"
          >
            Ver {total.toLocaleString("es-CR")}{" "}
            {total === 1 ? "fragancia" : "fragancias"}
          </button>
        }
      >
        <FilterPanel
          state={state}
          productos={productos}
          precioMin={facets.precioMin}
          precioMax={facets.precioMax}
          categorias={facets.categorias}
          marcas={facets.marcas}
          familias={facets.familias}
          ocasiones={facets.ocasiones}
          generos={facets.generos}
          onChange={pushState}
          onClear={clearAll}
        />
      </FilterSheet>
    </AnimatedSection>
  );
}

/* ─── Product Card ─── */
function ProductCard({ producto }: { producto: Producto }) {
  const imgUrl = producto.imagenes[0] || null;

  return (
    <a
      href={`/producto/${producto.id}`}
      className="card-surface card-surface-hover group block overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-[color:var(--image-bg)]">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
            <Sparkle size={48} weight="thin" aria-hidden="true" />
          </div>
        )}

        {producto.categorias[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[color:var(--accent)] backdrop-blur-sm">
            {producto.categorias[0]}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-[color:var(--foreground)]/90 transition-colors group-hover:text-[color:var(--foreground)]">
          {producto.nombre}
        </h3>
        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
          {producto.marca || "Sin marca"}
        </p>
        <p className="mt-3 text-lg font-bold gold-gradient">
          {formatPrice(producto.precio)}
        </p>
        {producto.tamano && (
          <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
            {producto.tamano}
          </p>
        )}
      </div>
    </a>
  );
}
