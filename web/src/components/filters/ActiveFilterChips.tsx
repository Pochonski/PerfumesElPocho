"use client";

import { X } from "@phosphor-icons/react";
import { formatPrice } from "@/lib/format";
import type { FilterState } from "@/lib/filter-state";

interface ActiveFilterChipsProps {
  state: FilterState;
  onRemove: (
    field:
      | "categoria"
      | "marca"
      | "familia"
      | "ocasion"
      | "genero"
      | "precio"
      | "q",
    value?: string
  ) => void;
  onClearAll: () => void;
  precioMin: number;
  precioMax: number;
}

export function ActiveFilterChips({
  state,
  onRemove,
  onClearAll,
  precioMin,
  precioMax,
}: ActiveFilterChipsProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (state.categoria !== "Todos") {
    chips.push({
      key: `c-${state.categoria}`,
      label: state.categoria,
      onRemove: () => onRemove("categoria"),
    });
  }
  if (state.q) {
    chips.push({
      key: `q`,
      label: `“${state.q}”`,
      onRemove: () => onRemove("q"),
    });
  }
  for (const m of state.marcas) {
    chips.push({
      key: `m-${m}`,
      label: m,
      onRemove: () => onRemove("marca", m),
    });
  }
  for (const f of state.familias) {
    chips.push({
      key: `f-${f}`,
      label: f,
      onRemove: () => onRemove("familia", f),
    });
  }
  for (const o of state.ocasiones) {
    chips.push({
      key: `o-${o}`,
      label: o,
      onRemove: () => onRemove("ocasion", o),
    });
  }
  for (const g of state.generos) {
    chips.push({
      key: `g-${g}`,
      label: g,
      onRemove: () => onRemove("genero", g),
    });
  }
  if (state.precioMin != null || state.precioMax != null) {
    const lo = state.precioMin ?? precioMin;
    const hi = state.precioMax ?? precioMax;
    chips.push({
      key: "precio",
      label: `${formatPrice(lo)} – ${formatPrice(hi)}`,
      onRemove: () => onRemove("precio"),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 py-1 pl-3 pr-2 text-xs text-[color:var(--accent)] transition-colors hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent)]/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]"
          aria-label={`Quitar filtro ${c.label}`}
        >
          <span className="max-w-[200px] truncate">{c.label}</span>
          <X
            size={12}
            weight="bold"
            className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="cursor-pointer text-xs font-medium text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--accent)] hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
}
