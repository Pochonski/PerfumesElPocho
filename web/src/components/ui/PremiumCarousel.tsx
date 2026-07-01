"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

interface PremiumCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  
  desktopVisible?: number;
  tabletVisible?: number;
  mobileVisible?: number;
  
  gap?: number;
  
  autoplay?: number;
  
  className?: string;
  
  ariaLabel?: string;
  
  loading?: boolean;
  
  skeletonCount?: number;
  
  renderSkeleton?: (i: number) => ReactNode;
}

export default function PremiumCarousel<T>({
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

  const maxIndex = Math.max(0, items.length - 1);

  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((c) => (c >= maxIndex ? 0 : c + 1));
  }, [items.length, maxIndex]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((c) => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-carousel-item]");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const offset = currentIndex * (cardWidth + gap);
    track.scrollTo({ left: offset, behavior: "smooth" });
  }, [currentIndex, gap]);

  
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

  
  useEffect(() => {
    if (!autoplay || isHover || isDragging || items.length <= 1) return;
    autoplayTimer.current = setInterval(next, autoplay);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [autoplay, isHover, isDragging, items.length, next]);

  
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

  
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  
  const getFlexClass = () => {
    const base = `flex-[0_0_calc((100%-${gap * (mobileVisible - 1)}px)/${mobileVisible})]`;
    const sm = `sm:flex-[0_0_calc((100%-${gap}px)/2)]`;
    const md = `md:flex-[0_0_calc((100%-${gap * 2}px)/3)]`;
    const lg = `lg:flex-[0_0_calc((100%-${gap * (desktopVisible - 1)}px)/${desktopVisible})]`;
    return `${base} ${sm} ${md} ${lg}`;
  };

  
  if (loading) {
    const skeletonFlex = getFlexClass();
    return (
      <div
        className={`flex gap-5 overflow-hidden ${className}`}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={`sk-${i}`}
            className={`min-w-0 shrink-0 snap-start ${skeletonFlex}`}
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
      {}
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
            className={`min-w-0 shrink-0 snap-start px-2 ${getFlexClass()}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${items.length}`}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs">
        <span className="font-mono text-muted-foreground">
          <span className="text-foreground">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="mx-1 text-muted">/</span>
          <span>{String(items.length).padStart(2, "0")}</span>
        </span>
      </div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="card-surface animate-pulse overflow-hidden">
      <div className="aspect-square bg-foreground/[0.04]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-foreground/[0.06]" />
        <div className="h-3 w-1/2 rounded bg-foreground/[0.04]" />
      </div>
    </div>
  );
}