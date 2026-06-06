"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Funnel,
} from "@phosphor-icons/react";
import { normalizeText, type Producto } from "@/lib/productos";

const PER_PAGE = 24;

interface ProductGridProps {
  productos: Producto[];
}

export default function ProductGrid({ productos }: ProductGridProps) {
  const [selectedCat, setSelectedCat] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const categorias = useMemo(() => {
    const cats = new Set<string>();
    for (const p of productos) {
      for (const c of p.categorias) cats.add(c);
    }
    return ["Todos", ...Array.from(cats).sort()];
  }, [productos]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  const handleCategory = useCallback(
    (cat: string) => {
      setSelectedCat(cat);
      setPage(1);
    },
    []
  );

  const { items, total, totalPages } = useMemo(() => {
    let filtered = productos;

    if (selectedCat !== "Todos") {
      filtered = filtered.filter((p) => p.categorias.includes(selectedCat));
    }

    if (debouncedSearch) {
      const q = normalizeText(debouncedSearch);
      filtered = filtered.filter((p) => normalizeText(p.nombre).includes(q));
    }

    const totalCount = filtered.length;
    const pages = Math.ceil(totalCount / PER_PAGE);
    const start = (page - 1) * PER_PAGE;

    return {
      items: filtered.slice(start, start + PER_PAGE),
      total: totalCount,
      totalPages: pages,
    };
  }, [productos, selectedCat, debouncedSearch, page]);

  const formatPrice = (price: number) =>
    `₡${price.toLocaleString("es-CR")}`;

  // Generar páginas visibles para paginación
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

  return (
    <AnimatedSection id="productos" className="px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Catálogo</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tighter text-white md:text-5xl">
            Nuestra Colección
          </h2>
          <p className="max-w-[48ch] text-zinc-400">
            {total.toLocaleString("es-CR")} fragancias originales, árabes y de
            diseñador.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="card-surface relative flex w-full items-center gap-2 rounded-2xl px-4 py-3 sm:max-w-sm">
              <MagnifyingGlass
                size={18}
                className="shrink-0 text-zinc-500"
                weight="bold"
              />
              <input
                type="search"
                placeholder="Buscar perfume..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
              />
            </div>

            {/* Results count */}
            <p className="text-xs text-zinc-600">
              Mostrando {items.length} de {total.toLocaleString("es-CR")}
            </p>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categorias.slice(0, 15).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedCat === cat
                    ? "bg-[#c8a84e]/20 text-[#c8a84e] border border-[#c8a84e]/30 shadow-[0_0_12px_rgba(200,168,78,0.1)]"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
            {categorias.length > 15 && (
              <button className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                +{categorias.length - 15} más
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => (
            <AnimatedItem
              key={p.id}
              index={i % PER_PAGE} // reiniciar animación por página
            >
              <ProductCard producto={p} formatPrice={formatPrice} />
            </AnimatedItem>
          ))}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-24">
            <Funnel size={40} className="text-zinc-700" weight="thin" />
            <p className="text-zinc-500">No se encontraron perfumes.</p>
            <button
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setSelectedCat("Todos");
              }}
              className="text-sm text-[#c8a84e] hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-30"
              aria-label="Página anterior"
            >
              <CaretLeft size={20} weight="bold" />
            </button>

            {visiblePages.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-zinc-600 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[36px] rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                    page === p
                      ? "bg-[#c8a84e]/15 text-[#c8a84e] border border-[#c8a84e]/30"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

/* ─── Product Card ─── */
function ProductCard({
  producto,
  formatPrice,
}: {
  producto: Producto;
  formatPrice: (p: number) => string;
}) {
  const imgUrl = producto.imagenes[0] || null;

  return (
    <a
      href={`/producto/${producto.id}`}
      className="card-surface card-surface-hover group block overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-900/50">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-700">
            <span className="text-4xl">🕯️</span>
          </div>
        )}

        {/* Category badge */}
        {producto.categorias[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#c8a84e] backdrop-blur-sm">
            {producto.categorias[0]}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-200 group-hover:text-white">
          {producto.nombre}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">{producto.marca || "Sin marca"}</p>
        <p className="mt-3 text-lg font-bold gold-gradient">
          {formatPrice(producto.precio)}
        </p>
      </div>
    </a>
  );
}
