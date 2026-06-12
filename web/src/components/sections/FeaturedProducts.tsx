"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  useEffect(() => {
    fetch("/api/productos?page=1&perPage=48")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
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

  // Aplicar transform translateX (no scroll container, evita conflicto con Lenis)
  useEffect(() => {
    if (!trackRef.current) return;
    // Calcular el porcentaje de desplazamiento
    // current=0 -> 0%, current=1 -> -25%, current=2 -> -50%, etc.
    const translatePct = -current * 100;
    trackRef.current.style.transform = `translateX(${translatePct}%)`;
  }, [current, items.length]);

  if (loading) {
    return (
      <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-[color:var(--border-subtle)]">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <EyebrowBadge>Los más buscados</EyebrowBadge>
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-5xl">
              Fragancias Destacadas
            </h2>
          </div>
          <div className="flex gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 w-[calc(25%-15px)] animate-pulse rounded-2xl bg-[color:var(--skeleton-bg)]" />
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
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-[color:var(--border-subtle)]">
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

        <div className="relative overflow-hidden">
          {/* Viewport con overflow:hidden (no scroll nativo, no choca con Lenis) */}
          <div className="overflow-hidden">
            {/* Track con transform translateX animado */}
            <div
              ref={trackRef}
              className="flex gap-5 transition-transform duration-500 ease-out"
              style={{ willChange: "transform" }}
            >
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.id}`}
                  data-card
                  className="card-surface card-surface-hover group block w-[calc(100%-2rem)] shrink-0 overflow-hidden sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[var(--image-bg)]">
                    {p.imagenes[0] && (
                      <Image
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-[color:var(--price-pill-bg)] px-3 py-1 text-sm font-bold text-[#c8a84e] backdrop-blur-sm">
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
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--card-bg)]/80 border border-[color:var(--border-emphasis)] text-[color:var(--muted-foreground)] backdrop-blur-sm transition-all hover:text-[color:var(--foreground)] hover:border-[color:var(--accent)]/40"
            aria-label="Anterior"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--card-bg)]/80 border border-[color:var(--border-emphasis)] text-[color:var(--muted-foreground)] backdrop-blur-sm transition-all hover:text-[color:var(--foreground)] hover:border-[color:var(--accent)]/40"
            aria-label="Siguiente"
          >
            <CaretRight size={20} weight="bold" />
          </button>

          <div className="mt-6 hidden justify-center gap-2 md:flex">
            {Array.from({ length: maxPage }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Página ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-[#c8a84e]"
                    : "w-2 bg-[color:var(--border-emphasis)] hover:bg-[color:var(--muted-foreground)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
