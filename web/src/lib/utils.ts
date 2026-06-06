/**
 * Utility functions that don't depend on Node.js modules (fs, path).
 * Safe to import in client components.
 */

/** Normalizar texto para búsqueda: lowercase + sin acentos */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Slugify seguro para URL: lowercase, sin acentos, con guiones */
export function slugify(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}