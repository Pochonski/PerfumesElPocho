"use client";

import { useState, useMemo } from "react";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import type { Producto } from "@/lib/productos";

export default function ProductGrid({ productos }: { productos: Producto[] }) {
  const [selectedCat, setSelectedCat] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  const categorias = useMemo(() => {
    const cats = new Set<string>();
    for (const p of productos) {
      for (const c of p.categorias) cats.add(c);
    }
    return ["Todos", ...Array.from(cats).sort()];
  }, [productos]);

  const filtered = useMemo(() => {
    return productos.filter((p) => {
      const matchCat =
        selectedCat === "Todos" || p.categorias.includes(selectedCat);
      const matchSearch =
        !search ||
        p.nombre.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [productos, selectedCat, search]);

  const formatPrice = (price: number) =>
    `₡${price.toLocaleString("es-CR")}`;

  return (
    <AnimatedSection id="productos" className="px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Catálogo</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tighter text-white md:text-5xl">
            Nuestra Colección
          </h2>
          <p className="max-w-[48ch] text-zinc-400">
            Explora nuestra selección de fragancias originales, árabes y de
            diseñador.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Buscar perfume..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="card-surface w-full rounded-2xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-[#c8a84e]/40 sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  selectedCat === cat
                    ? "bg-[#c8a84e]/20 text-[#c8a84e] border border-[#c8a84e]/30"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <AnimatedItem key={p.id} index={i}>
              <a
                href={`/producto/${p.id}`}
                className="card-surface card-surface-hover group block overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  {p.imagenes[0] ? (
                    <img
                      src={p.imagenes[0].local}
                      alt={p.nombre}
                      className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-700">
                      Sin imagen
                    </div>
                  )}
                  {/* Category badge */}
                  {p.categorias[0] && (
                    <span className="absolute left-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#c8a84e] backdrop-blur-sm">
                      {p.categorias[0]}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="line-clamp-2 text-sm font-semibold text-zinc-200 group-hover:text-white">
                    {p.nombre}
                  </h3>
                  {p.marca && (
                    <p className="mt-1 text-xs text-zinc-500">{p.marca}</p>
                  )}
                  <p className="mt-3 text-lg font-bold gold-gradient">
                    {formatPrice(p.precio)}
                  </p>
                </div>
              </a>
            </AnimatedItem>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-zinc-600">
            No se encontraron productos.
          </p>
        )}
      </div>
    </AnimatedSection>
  );
}
