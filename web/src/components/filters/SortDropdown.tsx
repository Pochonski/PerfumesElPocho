"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { SORT_OPTIONS, type SortKey } from "@/lib/filter-state";

interface SortDropdownProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-emphasis bg-card-bg/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        <span className="text-muted">Ordenar:</span>
        <span>{current.label}</span>
        <CaretDown
          size={12}
          weight="bold"
          className={`text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Ordenar por"
          className="card-surface absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl p-1"
        >
          {SORT_OPTIONS.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-foreground/85 hover:bg-foreground/5"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isActive && <Check size={14} weight="bold" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
