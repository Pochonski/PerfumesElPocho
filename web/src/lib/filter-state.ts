/**
 * Estado de filtros compartidos entre panel desktop, sheet mobile, y grid.
 * Codifica/decodifica a URL search params (compartible, back button funciona).
 */

export type SortKey =
  | "relevancia"
  | "precio-asc"
  | "precio-desc"
  | "nombre-asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre-asc", label: "Nombre A–Z" },
];

export interface FilterState {
  categoria: string;
  marcas: string[];
  familias: string[];
  ocasiones: string[];
  generos: string[];
  precioMin: number | null;
  precioMax: number | null;
  sort: SortKey;
  q: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  categoria: "Todos",
  marcas: [],
  familias: [],
  ocasiones: [],
  generos: [],
  precioMin: null,
  precioMax: null,
  sort: "relevancia",
  q: "",
};

const VALID_SORTS = new Set<SortKey>([
  "relevancia",
  "precio-asc",
  "precio-desc",
  "nombre-asc",
]);

/** Codifica un array de facets en un string CSV */
function encodeList(values: string[]): string | null {
  if (values.length === 0) return null;
  return values.join("~");
}

/** Decodifica CSV → array. Si falla, array vacío. */
function decodeList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("~")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Codifica FilterState → URLSearchParams */
export function encodeFilters(state: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (state.categoria && state.categoria !== "Todos") {
    p.set("c", state.categoria);
  }
  const m = encodeList(state.marcas);
  if (m) p.set("m", m);
  const f = encodeList(state.familias);
  if (f) p.set("f", f);
  const o = encodeList(state.ocasiones);
  if (o) p.set("o", o);
  const g = encodeList(state.generos);
  if (g) p.set("g", g);
  if (state.precioMin != null) p.set("pmin", String(state.precioMin));
  if (state.precioMax != null) p.set("pmax", String(state.precioMax));
  if (state.sort && state.sort !== "relevancia") p.set("s", state.sort);
  if (state.q) p.set("q", state.q);
  return p;
}

/** Decodifica URLSearchParams → FilterState */
export function decodeFilters(params: URLSearchParams | ReadonlyURLSearchParams): FilterState {
  const get = (k: string) => params.get(k);
  const sort = get("s") as SortKey | null;
  return {
    categoria: get("c") || "Todos",
    marcas: decodeList(get("m")),
    familias: decodeList(get("f")),
    ocasiones: decodeList(get("o")),
    generos: decodeList(get("g")),
    precioMin: get("pmin") ? Number(get("pmin")) : null,
    precioMax: get("pmax") ? Number(get("pmax")) : null,
    sort: sort && VALID_SORTS.has(sort) ? sort : "relevancia",
    q: get("q") || "",
  };
}

/** Tipo para ReadonlyURLSearchParams de Next.js (compatible con URLSearchParams) */
type ReadonlyURLSearchParams = {
  get(key: string): string | null;
  has(key: string): boolean;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  forEach(
    callbackfn: (value: string, key: string, parent: ReadonlyURLSearchParams) => void,
    thisArg?: unknown
  ): void;
  toString(): string;
};

/** Cuenta cuántos filtros activos hay (excluye categoria="Todos", sort, q) */
export function countActiveFilters(state: FilterState): number {
  let n = 0;
  if (state.categoria && state.categoria !== "Todos") n++;
  n += state.marcas.length;
  n += state.familias.length;
  n += state.ocasiones.length;
  n += state.generos.length;
  if (state.precioMin != null || state.precioMax != null) n++;
  if (state.q) n++;
  return n;
}

/** Verifica si hay filtros distintos a los defaults */
export function hasActiveFilters(state: FilterState): boolean {
  return countActiveFilters(state) > 0;
}

/** Limpia todos los filtros a defaults */
export function clearFilters(): FilterState {
  return { ...DEFAULT_FILTER_STATE };
}
