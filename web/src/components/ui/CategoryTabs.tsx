"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { CategoryTab } from "@/data/category-tabs";

interface CategoryTabsProps {
  tabs: CategoryTab[];
}

export default function CategoryTabs({ tabs }: CategoryTabsProps) {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [tabs]);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (tabs.length === 0) return null;

  return (
    <div className="relative border-t border-border-subtle bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav
        aria-label="Categorías"
        className="relative mx-auto max-w-[1400px] px-6 md:px-8"
      >
        <button
          type="button"
          onClick={() => scrollBy(-200)}
          aria-label="Desplazar categorías a la izquierda"
          className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden h-full items-center justify-center bg-gradient-to-r from-background via-background/90 to-transparent pl-1 pr-3 text-muted-foreground transition-opacity hover:text-foreground lg:flex ${
            canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(200)}
          aria-label="Desplazar categorías a la derecha"
          className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 hidden h-full items-center justify-center bg-gradient-to-l from-background via-background/90 to-transparent pl-3 pr-1 text-muted-foreground transition-opacity hover:text-foreground lg:flex ${
            canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <CaretRight size={18} weight="bold" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex items-stretch gap-1 overflow-x-auto scroll-smooth py-2 md:gap-2 md:py-3"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:px-4 md:py-2 md:text-sm ${
                  isActive
                    ? "gold-gradient-bg text-black"
                    : "text-muted-foreground hover:bg-hover-bg hover:text-foreground"
                }`}
              >
                <Icon
                  size={16}
                  weight={isActive ? "fill" : "duotone"}
                  className="shrink-0"
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
