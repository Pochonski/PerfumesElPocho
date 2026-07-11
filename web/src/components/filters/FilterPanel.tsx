"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { FilterSection } from "./FilterSection";
import { FacetCheckbox } from "./FacetCheckbox";
import { PriceRange } from "./PriceRange";
import type { FilterState } from "@/lib/filter-state";
import { formatPrice } from "@/lib/format";
import { normalizeText } from "@/lib/utils";
import type { FacetCounts } from "@/lib/facet-counts";

interface FilterPanelBodyProps {
  state: FilterState;
  precioMin: number;
  precioMax: number;
  categorias: string[];
  marcas: string[];
  familias: string[];
  ocasiones: string[];
  generos: string[];
  
  facetCounts: FacetCounts;
  onChange: (next: FilterState) => void;
}

interface FilterPanelProps extends FilterPanelBodyProps {
  onClear: () => void;
}


export function FilterPanelBody({
  state,
  precioMin,
  precioMax,
  categorias,
  marcas,
  familias,
  ocasiones,
  generos,
  facetCounts,
  onChange,
}: FilterPanelBodyProps) {
  const [marcaSearch, setMarcaSearch] = useState("");

  
  const countBy = (field: keyof FacetCounts, value: string): number => {
    return facetCounts[field]?.[value] ?? 0;
  };

  const toggle = (field: keyof FilterState, value: string) => {
    const current = state[field] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...state, [field]: next });
  };

  
  const marcasVisibles = useMemo(() => {
    const base = !marcaSearch.trim()
      ? marcas
      : marcas.filter((m) => normalizeText(m).includes(normalizeText(marcaSearch)));
    return base.filter((m) => (facetCounts.marcas[m] ?? 0) > 0);
  }, [marcas, marcaSearch, facetCounts.marcas]);

  const familiasVisibles = useMemo(
    () => familias.filter((f) => (facetCounts.familias[f] ?? 0) > 0),
    [familias, facetCounts.familias]
  );
  const ocasionesVisibles = useMemo(
    () => ocasiones.filter((o) => (facetCounts.ocasiones[o] ?? 0) > 0),
    [ocasiones, facetCounts.ocasiones]
  );
  const generosVisibles = useMemo(
    () => generos.filter((g) => (facetCounts.generos[g] ?? 0) > 0),
    [generos, facetCounts.generos]
  );

  return (
    <>
      {}
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
              <summary className="cursor-pointer list-none rounded-lg px-2 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-foreground/5">
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

      {}
      <FilterSection title="Marca" count={state.marcas.length}>
        <div className="relative mb-1.5">
          <MagnifyingGlass
            size={14}
            weight="bold"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={marcaSearch}
            onChange={(e) => setMarcaSearch(e.target.value)}
            placeholder="Buscar marca…"
            className="w-full rounded-lg border border-border-subtle bg-transparent py-1.5 pl-8 pr-7 text-xs text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent/40"
            aria-label="Buscar marca"
            data-lenis-prevent
          />
          {marcaSearch && (
            <button
              type="button"
              onClick={() => setMarcaSearch("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition-colors hover:text-foreground"
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
          {marcasVisibles.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted">
              Sin resultados
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {marcasVisibles.map((m) => (
                <FacetCheckbox
                  key={m}
                  label={m}
                  count={countBy("marcas", m)}
                  checked={state.marcas.includes(m)}
                  onChange={() => toggle("marcas", m)}
                />
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {}
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
            className="mt-2 cursor-pointer text-xs font-medium text-accent transition-colors hover:underline"
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
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-border-subtle text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-muted">
          Rango: {formatPrice(precioMin)} – {formatPrice(precioMax)}
        </p>
      </FilterSection>

      {}
      <FilterSection title="Familia olfativa" count={state.familias.length}>
        <div className="flex flex-col gap-0.5">
          {familiasVisibles.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted">
              Sin resultados
            </p>
          ) : (
            familiasVisibles.map((f) => (
              <FacetCheckbox
                key={f}
                label={f}
                count={countBy("familias", f)}
                checked={state.familias.includes(f)}
                onChange={() => toggle("familias", f)}
              />
            ))
          )}
        </div>
      </FilterSection>

      {}
      <FilterSection title="Ocasión" count={state.ocasiones.length}>
        <div className="flex flex-col gap-0.5">
          {ocasionesVisibles.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted">
              Sin resultados
            </p>
          ) : (
            ocasionesVisibles.map((o) => (
              <FacetCheckbox
                key={o}
                label={o}
                count={countBy("ocasiones", o)}
                checked={state.ocasiones.includes(o)}
                onChange={() => toggle("ocasiones", o)}
              />
            ))
          )}
        </div>
      </FilterSection>

      {}
      <FilterSection title="Género" count={state.generos.length}>
        <div className="flex flex-col gap-0.5">
          {generosVisibles.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted">
              Sin resultados
            </p>
          ) : (
            generosVisibles.map((g) => (
              <FacetCheckbox
                key={g}
                label={g}
                count={countBy("generos", g)}
                checked={state.generos.includes(g)}
                onChange={() => toggle("generos", g)}
              />
            ))
          )}
        </div>
      </FilterSection>
    </>
  );
}


export function FilterPanel({
  state,
  precioMin,
  precioMax,
  categorias,
  marcas,
  familias,
  ocasiones,
  generos,
  facetCounts,
  onChange,
  onClear,
}: FilterPanelProps) {
  return (
    <aside
      className="card-surface sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-5"
      aria-label="Filtros"
      data-lenis-prevent
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-xs font-medium text-accent transition-colors hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Limpiar todo
        </button>
      </div>

      <FilterPanelBody
        state={state}
        precioMin={precioMin}
        precioMax={precioMax}
        categorias={categorias}
        marcas={marcas}
        familias={familias}
        ocasiones={ocasiones}
        generos={generos}
        facetCounts={facetCounts}
        onChange={onChange}
      />
    </aside>
  );
}
