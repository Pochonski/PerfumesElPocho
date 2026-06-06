"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_FILTER_STATE,
  decodeFilters,
  encodeFilters,
  hasActiveFilters as hasActive,
  type FilterState,
  type SortKey,
} from "@/lib/filter-state";

export function useFilterState(initial?: Partial<FilterState>) {
  const [state, setState] = useState<FilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    ...initial,
  }));

  const setCategoria = useCallback((c: string) => {
    setState((s) => ({ ...s, categoria: c }));
  }, []);

  const toggleFacet = useCallback(
    (field: keyof FilterState, value: string) => {
      setState((s) => {
        const current = s[field];
        if (!Array.isArray(current)) return s;
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...s, [field]: next };
      });
    },
    []
  );

  const setFacetList = useCallback(
    (field: keyof FilterState, values: string[]) => {
      setState((s) => ({ ...s, [field]: values }));
    },
    []
  );

  const setPriceRange = useCallback(
    (min: number | null, max: number | null) => {
      setState((s) => ({ ...s, precioMin: min, precioMax: max }));
    },
    []
  );

  const setSort = useCallback((sort: SortKey) => {
    setState((s) => ({ ...s, sort }));
  }, []);

  const setQuery = useCallback((q: string) => {
    setState((s) => ({ ...s, q }));
  }, []);

  const clearAll = useCallback(() => {
    setState({ ...DEFAULT_FILTER_STATE, ...initial });
  }, [initial]);

  const removeFilter = useCallback(
    (
      field:
        | "categoria"
        | "marca"
        | "familia"
        | "ocasion"
        | "genero"
        | "precio"
        | "q",
      value?: string
    ) => {
      setState((s) => {
        if (field === "categoria") return { ...s, categoria: "Todos" };
        if (field === "precio") return { ...s, precioMin: null, precioMax: null };
        if (field === "q") return { ...s, q: "" };
        const keyMap: Partial<Record<typeof field, keyof FilterState>> = {
          marca: "marcas",
          familia: "familias",
          ocasion: "ocasiones",
          genero: "generos",
        };
        const key = keyMap[field];
        if (!key) return s;
        const current = s[key];
        if (Array.isArray(current) && value != null) {
          return { ...s, [key]: current.filter((v) => v !== value) };
        }
        return s;
      });
    },
    []
  );

  const isActive = useMemo(() => hasActive(state), [state]);

  return {
    state,
    setCategoria,
    toggleFacet,
    setFacetList,
    setPriceRange,
    setSort,
    setQuery,
    clearAll,
    removeFilter,
    isActive,
    toSearchParams: () => encodeFilters(state),
    fromSearchParams: (p: URLSearchParams) => setState(decodeFilters(p)),
  };
}
