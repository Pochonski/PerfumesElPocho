"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Producto } from "@/lib/productos";

interface FeaturedProductsProps {
  productos: Producto[];
}

export default function FeaturedProducts({ productos }: FeaturedProductsProps) {
  const [current, setCurrent] = useState(0);

  // Seleccionamos 12 productos variados como "destacados"
  // Criterio: diversidad de categorías, marcas conocidas, buenas imágenes
  const featured = productos
    .filter((p) => p.imagenes.length > 0) // que tengan imagen
    .sort(() => 0.5 - Math.random()) // aleatorio controlado
    .slice(0, 12);

  const visible = 4;
  const maxPage = Math.ceil(featured.length / visible);

  const prev = () => setCurrent((c) => (c === 0 ? maxPage - 1 : c - 1));
  const next = () => setCurrent((c) => (c === maxPage - 1 ? 0 : c + 1));

  if (featured.length === 0) return null;

  const formatPrice = (p: number) => `₡${p.toLocaleString("es-CR")}`;

  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Los más buscados</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tighter text-white md:text-5xl">
            Fragancias Destacadas
          </h2>
          <p className="max-w-[48ch] text-zinc-400">
            Una selección de las fragancias más populares entre nuestros clientes.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards */}
          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{
                transform: `translateX(-${current * (100 / visible)}%)`,
              }}
            >
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.id}`}
                  className="card-surface card-surface-hover group block min-w-[calc(25%-15px)] shrink-0 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-zinc-900/30">
                    {p.imagenes[0] && (
                      <Image
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        fill
                        sizes="25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                    {/* Price tag */}
                    <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-[#c8a84e] backdrop-blur-sm">
                      {formatPrice(p.precio)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-200 group-hover:text-white">
                      {p.nombre}
                    </h3>
                    {p.marca && (
                      <p className="mt-1 text-xs text-zinc-500">{p.marca}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:border-white/20"
            aria-label="Anterior"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            onClick={next}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:border-white/20"
            aria-label="Siguiente"
          >
            <CaretRight size={20} weight="bold" />
          </button>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
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
