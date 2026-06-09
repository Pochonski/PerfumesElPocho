"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Producto } from "@/lib/productos";

export default function FeaturedProducts() {
  const [current, setCurrent] = useState(0);
  const [items, setItems] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  // Fetch featured products from API on mount
  useEffect(() => {
    fetch("/api/productos?page=1&perPage=48")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          // Mezclar aleatoriamente y tomar 12 con imagen
          const withImages = data.items.filter(
            (p: Producto) => p.imagenes && p.imagenes.length > 0
          );
          const shuffled = withImages.sort(() => 0.5 - Math.random()).slice(0, 12);
          setItems(shuffled);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const itemsPerPage = 4;
  const maxPage = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? maxPage - 1 : c - 1)), [maxPage]);
  const next = useCallback(() => setCurrent((c) => (c === maxPage - 1 ? 0 : c + 1)), [maxPage]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const gap = 20;
    const offset = current * (cardWidth + gap) * itemsPerPage;
    track.scrollTo({ left: offset, behavior: "smooth" });
  }, [current, itemsPerPage]);

  if (loading) {
    return (
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <EyebrowBadge>Los más buscados</EyebrowBadge>
            <h2 className="text-3xl font-semibold tracking-tighter text-white md:text-5xl">
              Fragancias Destacadas
            </h2>
          </div>
          <div className="flex gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 w-[calc(25%-15px)] animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (items.length === 0) return null;

  const formatPrice = (p: number | null | undefined) => {
    if (p == null || isNaN(p) || p <= 0) return "₡—";
    return `₡${p.toLocaleString("es-CR")}`;
  };

  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Los más buscados</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-5xl">
            Fragancias Destacadas
          </h2>
          <p className="max-w-[48ch] text-[color:var(--muted-foreground)]">
            Una selección de las fragancias más populares entre nuestros clientes.
          </p>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:snap-none"
          >
            <div className="flex gap-5">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.id}`}
                  data-card
                  className="card-surface card-surface-hover group block w-[80vw] shrink-0 overflow-hidden snap-start sm:w-[calc(50%-10px)] md:snap-normal lg:w-[calc(25%-15px)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-900/30">
                    {p.imagenes[0] && (
                      <Image
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-[#c8a84e] backdrop-blur-sm">
                      {formatPrice(p.precio)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-[color:var(--subtle-foreground)] transition-colors group-hover:text-[color:var(--foreground)]">
                      {p.nombre}
                    </h3>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{p.marca || "Sin marca"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={prev}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:border-white/20"
            aria-label="Anterior"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:border-white/20"
            aria-label="Siguiente"
          >
            <CaretRight size={20} weight="bold" />
          </button>

          <div className="mt-6 hidden justify-center gap-2 md:flex">
            {Array.from({ length: maxPage }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-[#c8a84e]"
                    : "w-2 bg-zinc-700 hover:bg-zinc-500"
                }`}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
