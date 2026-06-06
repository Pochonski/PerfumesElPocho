"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { FilterSection } from "./FilterSection";
import { FacetCheckbox } from "./FacetCheckbox";
import { PriceRange } from "./PriceRange";
import type { FilterState } from "@/lib/filter-state";
import { formatPrice } from "@/lib/format";
import { normalizeText, type Producto } from "@/lib/productos";

interface FilterPanelProps {
  state: FilterState;
  productos: Producto[];
  precioMin: number;
  precioMax: number;
  categorias: string[];
  marcas: string[];
  familias: string[];
  ocasiones: string[];
  generos: string[];
  onChange: (next: FilterState) => void;
  onClear: () => void;
}

export function FilterPanel({
  state,
  productos,
  precioMin,
  precioMax,
  categorias,
  marcas,
  familias,
  ocasiones,
  generos,
  onChange,
  onClear,
}: FilterPanelProps) {
  const [marcaSearch, setMarcaSearch] = useState("");

  /** Cuenta cuántos productos matchean por valor de un facet (considerando los otros filtros activos) */
  const countByValue = useMemo(() => {
    return function countBy(
      field: "marca" | "familia" | "ocasion" | "genero",
      value: string
    ): number {
      return productos.filter((p) => {
        if (state.categoria !== "Todos" && !p.categorias.includes(state.categoria))
          return false;
        if (state.marcas.length > 0 && field !== "marca" && !state.marcas.includes(p.marca))
          return false;
        if (state.familias.length > 0 && field !== "familia" && !p.familias_olfativas.some((f) => state.familias.includes(f)))
          return false;
        if (state.ocasiones.length > 0 && field !== "ocasion" && !p.ocasiones.some((o) => state.ocasiones.includes(o)))
          return false;
        if (state.generos.length > 0 && field !== "genero" && !p.generos.some((g) => state.generos.includes(g)))
          return false;
        if (state.precioMin != null && p.precio < state.precioMin) return false;
        if (state.precioMax != null && p.precio > state.precioMax) return false;
        if (state.q) {
          const haystack = [p.nombre, p.marca, p.descripcion, p.familia_olfativa]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(state.q.toLowerCase().trim())) return false;
        }

        if (field === "marca") return p.marca === value;
        if (field === "familia") return p.familias_olfativas.includes(value);
        if (field === "ocasion") return p.ocasiones.includes(value);
        if (field === "genero") return p.generos.includes(value);
        return false;
      }).length;
    };
  }, [state, productos]);

  const toggle = (field: keyof FilterState, value: string) => {
    const current = state[field] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...state, [field]: next });
  };

  const marcasFiltradas = useMemo(() => {
    if (!marcaSearch.trim()) return marcas;
    const q = normalizeText(marcaSearch);
    return marcas.filter((m) => normalizeText(m).includes(q));
  }, [marcas, marcaSearch]);

  return (
    <aside
      className="card-surface sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-5"
      aria-label="Filtros"
      data-lenis-prevent
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[color:var(--foreground)]">Filtros</h2>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-xs font-medium text-[color:var(--accent)] transition-colors hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Limpiar todo
        </button>
      </div>

      {/* Categoría */}
      <FilterSection
        title="Categoría"
        count={state.categoria !== "Todos" ? 1 : 0}
        defaultOpen
      >
        <div className="flex flex-col gap-0.5">
          <FacetCheckbox
            label="Todos"
            checked={state.categoria === "Todos"}
            onChange={() => onChange({ ...state, categoria: "Todos" })}
          />
          {categorias.slice(0, 12).map((cat) => (
            <FacetCheckbox
              key={cat}
              label={cat}
              checked={state.categoria === cat}
              onChange={() => onChange({ ...state, categoria: cat })}
            />
          ))}
          {categorias.length > 12 && (
            <details className="group">
              <summary className="cursor-pointer list-none rounded-lg px-2 py-1.5 text-xs font-medium text-[color:var(--accent)] transition-colors hover:bg-[color:var(--foreground)]/5">
                Ver {categorias.length - 12} más
              </summary>
              <div className="mt-1 flex flex-col gap-0.5">
                {categorias.slice(12).map((cat) => (
                  <FacetCheckbox
                    key={cat}
                    label={cat}
                    checked={state.categoria === cat}
                    onChange={() => onChange({ ...state, categoria: cat })}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      </FilterSection>

      {/* Marca (con search) */}
      <FilterSection title="Marca" count={state.marcas.length}>
        <div className="relative mb-1.5">
          <MagnifyingGlass
            size={14}
            weight="bold"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={marcaSearch}
            onChange={(e) => setMarcaSearch(e.target.value)}
            placeholder="Buscar marca…"
            className="w-full rounded-lg border border-[color:var(--border-subtle)] bg-transparent py-1.5 pl-8 pr-7 text-xs text-[color:var(--foreground)] outline-none transition-colors placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]/40"
            aria-label="Buscar marca"
            data-lenis-prevent
          />
          {marcaSearch && (
            <button
              type="button"
              onClick={() => setMarcaSearch("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
              aria-label="Limpiar búsqueda de marca"
            >
              <X size={12} weight="bold" />
            </button>
          )}
        </div>
        <div
          className="max-h-48 touch-pan-y overflow-y-auto pr-1"
          data-lenis-prevent
        >
          {marcasFiltradas.length === 0 ? (
            <p className="px-2 py-2 text-xs text-[color:var(--muted)]">
              Sin resultados
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {marcasFiltradas.map((m) => (
                <FacetCheckbox
                  key={m}
                  label={m}
                  count={countByValue("marca", m)}
                  checked={state.marcas.includes(m)}
                  onChange={() => toggle("marcas", m)}
                />
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Precio */}
      <FilterSection
        title="Precio"
        count={state.precioMin != null || state.precioMax != null ? 1 : 0}
      >
        <PriceRange
          min={precioMin}
          max={precioMax}
          valueMin={state.precioMin ?? precioMin}
          valueMax={state.precioMax ?? precioMax}
          onChange={(lo, hi) =>
            onChange({
              ...state,
              precioMin: lo === precioMin ? null : lo,
              precioMax: hi === precioMax ? null : hi,
            })
          }
        />
        {(state.precioMin != null || state.precioMax != null) && (
          <button
            type="button"
            onClick={() =>
              onChange({ ...state, precioMin: null, precioMax: null })
            }
            className="mt-2 cursor-pointer text-xs font-medium text-[color:var(--accent)] transition-colors hover:underline"
          >
            Restablecer
          </button>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: "< ₡10K", min: null, max: 10000 },
            { label: "₡10K-30K", min: 10000, max: 30000 },
            { label: "₡30K-60K", min: 30000, max: 60000 },
            { label: "₡60K-100K", min: 60000, max: 100000 },
            { label: "> ₡100K", min: 100000, max: null },
          ].map((p) => {
            const isActive = state.precioMin === p.min && state.precioMax === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    precioMin: p.min,
                    precioMax: p.max,
                  })
                }
                className={`cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[10px] tabular-nums transition-colors ${
                  isActive
                    ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                    : "border-[color:var(--border-subtle)] text-[color:var(--muted-foreground)] hover:border-[color:var(--accent)]/40 hover:text-[color:var(--foreground)]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-[color:var(--muted)]">
          Rango: {formatPrice(precioMin)} – {formatPrice(precioMax)}
        </p>
      </FilterSection>

      {/* Familia olfativa */}
      <FilterSection title="Familia olfativa" count={state.familias.length}>
        <div className="flex flex-col gap-0.5">
          {familias.map((f) => (
            <FacetCheckbox
              key={f}
              label={f}
              count={countByValue("familia", f)}
              checked={state.familias.includes(f)}
              onChange={() => toggle("familias", f)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Ocasión */}
      <FilterSection title="Ocasión" count={state.ocasiones.length}>
        <div className="flex flex-col gap-0.5">
          {ocasiones.map((o) => (
            <FacetCheckbox
              key={o}
              label={o}
              count={countByValue("ocasion", o)}
              checked={state.ocasiones.includes(o)}
              onChange={() => toggle("ocasiones", o)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Género */}
      <FilterSection title="Género" count={state.generos.length}>
        <div className="flex flex-col gap-0.5">
          {generos.map((g) => (
            <FacetCheckbox
              key={g}
              label={g}
              count={countByValue("genero", g)}
              checked={state.generos.includes(g)}
              onChange={() => toggle("generos", g)}
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
