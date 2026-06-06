"use client";

import { useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  /** Estado inicial del collapse */
  defaultOpen?: boolean;
  /** Cantidad de items seleccionados */
  count?: number;
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
  count = 0,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[color:var(--border-subtle)] py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]/30"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-[color:var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
              {count}
            </span>
          )}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-[color:var(--muted)] transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
