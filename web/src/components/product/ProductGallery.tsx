"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/ui/Lightbox";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface ProductGalleryProps {
  imagenes: string[];
  nombre: string;
}

export default function ProductGallery({ imagenes, nombre }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const validImages = imagenes.filter(Boolean);
  const hasImages = validImages.length > 0;
  const hasMultiple = validImages.length > 1;
  const mainSrc = validImages[active] ?? null;

  const goPrev = useCallback(() => {
    setActive((i) => (i === 0 ? validImages.length - 1 : i - 1));
  }, [validImages.length]);

  const goNext = useCallback(() => {
    setActive((i) => (i === validImages.length - 1 ? 0 : i + 1));
  }, [validImages.length]);

  const onThumbsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  if (!hasImages) {
    return (
      <div className="card-surface relative aspect-square overflow-hidden bg-zinc-900/30">
        <div className="flex h-full items-center justify-center text-6xl">🕯️</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div className="relative">
          <div
            className="card-surface relative aspect-square overflow-hidden bg-zinc-900/30"
          >
            {mainSrc ? (
              <Image
                src={mainSrc}
                alt={nombre}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain p-8 ${hasImages ? "cursor-zoom-in" : ""}`}
                priority
                onClick={() => hasImages && setLightboxOpen(true)}
              />
            ) : null}

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
              </>
            )}
          </div>

          {hasMultiple && (
            <p
              className="mt-2 text-center text-xs text-zinc-500"
              aria-live="polite"
            >
              Imagen {active + 1} de {validImages.length}
            </p>
          )}
        </div>

        {/* Thumbnails strip */}
        {hasMultiple && (
          <div
            className="grid grid-cols-4 gap-3"
            role="tablist"
            aria-label="Galería de imágenes"
            onKeyDown={onThumbsKeyDown}
          >
            {validImages.map((img, i) => {
              const isActive = i === active;
              return (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ver imagen ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`card-surface relative aspect-square overflow-hidden p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84e] ${
                    isActive
                      ? "ring-2 ring-[#c8a84e] border-[#c8a84e]/40"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${nombre} vista ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 25vw, 12vw"
                    className="object-contain"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={mainSrc ?? ""}
        alt={nombre}
      />
    </>
  );
}
