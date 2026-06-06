"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

interface PremiumCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  /** Cuántos items mostrar a la vez en desktop. Default: 3 */
  desktopVisible?: number;
  tabletVisible?: number;
  mobileVisible?: number;
  /** Gap entre items en px. Default: 20 */
  gap?: number;
  /** Autoplay en ms. 0 para desactivar. Default: 5000 */
  autoplay?: number;
  /** Class para el contenedor raíz */
  className?: string;
  /** Accesibilidad: aria-label del carousel */
  ariaLabel?: string;
  /** Loading state */
  loading?: boolean;
  /** Cantidad de skeletons cuando loading=true */
  skeletonCount?: number;
  /** Skeleton renderer */
  renderSkeleton?: (i: number) => ReactNode;
}

export function PremiumCarousel<T>({
  items,
  renderItem,
  keyExtractor,
  desktopVisible = 3,
  tabletVisible = 2,
  mobileVisible = 1,
  gap = 20,
  autoplay = 0,
  className = "",
  ariaLabel = "Carrusel",
  loading = false,
  skeletonCount = 6,
  renderSkeleton,
}: PremiumCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const scrollStart = useRef<number>(0);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calcular cuántos items hay visibles actualmente (para X/Y y snapping)
  const maxIndex = Math.max(0, items.length - 1);

  // Avanza al siguiente item (loop infinito)
  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((c) => (c >= maxIndex ? 0 : c + 1));
  }, [items.length, maxIndex]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((c) => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  // Scroll programático al current index
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-carousel-item]");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const offset = currentIndex * (cardWidth + gap);
    track.scrollTo({ left: offset, behavior: "smooth" });
  }, [currentIndex, gap]);

  // Detectar índice activo por scroll (incluye drag)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = track.querySelector<HTMLElement>("[data-carousel-item]");
        if (!card) return;
        const cardWidth = card.offsetWidth + gap;
        const idx = Math.round(track.scrollLeft / cardWidth);
        setCurrentIndex((prev) => (prev === idx ? prev : Math.min(idx, maxIndex)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
    };
  }, [gap, maxIndex]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || isHover || isDragging || items.length <= 1) return;
    autoplayTimer.current = setInterval(next, autoplay);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [autoplay, isHover, isDragging, items.length, next]);

  // Pausar autoplay si el tab no está visible
  useEffect(() => {
    if (!autoplay) return;
    const onVisibility = () => {
      if (document.hidden && autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
        autoplayTimer.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [autoplay]);

  // Drag (pointer events unificados)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    dragStartX.current = e.clientX;
    scrollStart.current = track.scrollLeft;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - dragStartX.current;
    track.scrollLeft = scrollStart.current - dx;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragStartX.current = null;
    setIsDragging(false);
  };

  // Keyboard
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  // Skeleton state
  if (loading) {
    return (
      <div
        className={`flex gap-5 overflow-hidden ${className}`}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={`sk-${i}`}
            style={{
              flex: `0 0 calc((100% - ${gap * (desktopVisible - 1)}px) / ${desktopVisible})`,
            }}
            className="min-w-0 shrink-0"
          >
            {renderSkeleton ? renderSkeleton(i) : <DefaultSkeleton />}
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Track */}
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`-mx-2 flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-2 pb-4 outline-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } [&::-webkit-scrollbar]:hidden [scrollbar-width:none]`}
        style={{ scrollPaddingLeft: "8px" }}
      >
        {items.map((item, i) => (
          <div
            key={keyExtractor(item, i)}
            data-carousel-item
            className="min-w-0 shrink-0 snap-start px-2"
            style={{
              flex: `0 0 calc((100% - ${gap * (desktopVisible - 1)}px) / ${desktopVisible})`,
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${items.length}`}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {/* X / Y indicator */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs">
        <span className="font-mono text-[color:var(--muted-foreground)]">
          <span className="text-[color:var(--foreground)]">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="mx-1 text-[color:var(--muted)]">/</span>
          <span>{String(items.length).padStart(2, "0")}</span>
        </span>
      </div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="card-surface animate-pulse overflow-hidden">
      <div className="aspect-square bg-[color:var(--foreground)]/[0.04]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-[color:var(--foreground)]/[0.06]" />
        <div className="h-3 w-1/2 rounded bg-[color:var(--foreground)]/[0.04]" />
      </div>
    </div>
  );
}
