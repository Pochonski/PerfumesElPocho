"use client";

import PremiumCarousel from "@/components/ui/PremiumCarousel";
import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import { formatPrice } from "@/lib/format";
import type { Producto } from "@/lib/productos";

export default function FeaturedProductsCarousel({ items }: { items: Producto[] }) {
  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-border-subtle">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Los más buscados</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Fragancias Destacadas
          </h2>
          <p className="max-w-[48ch] text-muted-foreground">
            Una selección de las fragancias más populares entre nuestros clientes.
          </p>
        </div>

        <PremiumCarousel
          items={items}
          ariaLabel="Fragancias destacadas"
          desktopVisible={4}
          tabletVisible={2}
          mobileVisible={1}
          gap={20}
          loading={false}
          skeletonCount={4}
          keyExtractor={(p) => p.id}
          renderItem={(p) => (
            <Link
              href={`/producto/${p.id}`}
              data-card
              className="card-surface card-surface-hover group block overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-image-bg">
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
                <span className="absolute right-3 top-3 rounded-full bg-price-pill-bg px-3 py-1 text-sm font-bold text-accent backdrop-blur-sm">
                  {formatPrice(p.precio)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-subtle-foreground transition-colors group-hover:text-foreground">
                  {p.nombre}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.marca || "Sin marca"}</p>
              </div>
            </Link>
          )}
        />

        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No hay fragancias destacadas disponibles.
          </p>
        )}
      </div>
    </AnimatedSection>
  );
}
