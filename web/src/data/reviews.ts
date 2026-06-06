export interface Review {
  id: string;
  productoId: number;
  autor: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  fecha: string;
  /** Verificado: compró el producto en Perfumes El Pocho */
  verificado: boolean;
}

/**
 * Reviews placeholder. Estructura lista para integrar con backend
 * cuando el equipo quiera habilitar reviews reales.
 */
export const REVIEWS: Review[] = [];

export function getReviewsByProducto(productoId: number): Review[] {
  return REVIEWS.filter((r) => r.productoId === productoId);
}

export function getAverageRating(productoId: number): {
  average: number;
  count: number;
} {
  const reviews = getReviewsByProducto(productoId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
