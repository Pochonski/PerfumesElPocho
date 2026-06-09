/**
 * Tipos y constantes para facet counts. Este archivo es client-safe (no usa fs)
 * y puede importarse desde componentes de cliente.
 */

export interface FacetCounts {
  marcas: Record<string, number>;
  familias: Record<string, number>;
  ocasiones: Record<string, number>;
  generos: Record<string, number>;
}

export const EMPTY_FACET_COUNTS: FacetCounts = {
  marcas: {},
  familias: {},
  ocasiones: {},
  generos: {},
};
