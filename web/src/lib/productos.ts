import fs from "fs";
import path from "path";

export interface Producto {
  id: number;
  url: string;
  nombre: string;
  precio: number;
  precio_texto: string;
  descripcion: string;
  resumen: string;
  categorias: string[];
  atributos: Record<string, string>;
  imagenes: string[];
  marca: string;
  concentracion: string;
  tamano: string;
  genero: string;
  ocasion: string;
  familia_olfativa: string;
  /** Normalizado: array de familias canónicas */
  familias_olfativas: string[];
  /** Normalizado: array de ocasiones canónicas */
  ocasiones: string[];
  /** Normalizado: array de géneros canónicos derivados */
  generos: string[];
}

let cached: Producto[] | null = null;

export function getProductos(): Producto[] {
  if (cached) return cached;
  const jsonPath = path.join(
    process.cwd(),
    "src",
    "data",
    "productos.json"
  );
  if (!fs.existsSync(jsonPath)) return [];
  const data: Producto[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  for (const p of data) {
    if (!Array.isArray(p.imagenes)) p.imagenes = [];
    if (!Array.isArray(p.familias_olfativas)) p.familias_olfativas = [];
    if (!Array.isArray(p.ocasiones)) p.ocasiones = [];
    if (!Array.isArray(p.generos)) p.generos = [];

    // Derivar familias_olfativas desde familia_olfativa (string comma-separated)
    if (p.familias_olfativas.length === 0 && p.familia_olfativa) {
      p.familias_olfativas = p.familia_olfativa
        .split(",")
        .map((f: string) => f.trim())
        .filter(Boolean);
    }

    // Derivar ocasiones desde ocasion (string comma-separated)
    if (p.ocasiones.length === 0 && p.ocasion) {
      p.ocasiones = p.ocasion
        .split(",")
        .map((o: string) => o.trim())
        .filter(Boolean);
    }

    // Derivar generos desde genero (string comma-separated)
    if (p.generos.length === 0 && p.genero) {
      p.generos = p.genero
        .split(",")
        .map((g: string) => g.trim())
        .filter(Boolean);
    }

    // Generar resumen desde descripcion si está vacío
    if (!p.resumen && p.descripcion) {
      p.resumen = p.descripcion.slice(0, 150).trim() + (p.descripcion.length > 150 ? "…" : "");
    }
  }
  cached = data;
  return data;
}

export function getProductoById(id: number): Producto | undefined {
  return getProductos().find((p) => p.id === id);
}

export function getCategorias(): string[] {
  const cats = new Set<string>();
  for (const p of getProductos()) {
    for (const c of p.categorias) {
      cats.add(c);
    }
  }
  return Array.from(cats).sort();
}

export function getMarcas(): string[] {
  const marcas = new Set<string>();
  for (const p of getProductos()) {
    if (p.marca) marcas.add(p.marca);
  }
  return Array.from(marcas).sort();
}

export function getConcentraciones(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    if (p.concentracion) set.add(p.concentracion);
  }
  return Array.from(set).sort();
}

export function getTamanos(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    if (p.tamano) set.add(p.tamano);
  }
  return Array.from(set).sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
}

export function getFamiliasOlfativas(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    for (const f of p.familias_olfativas) set.add(f);
  }
  return Array.from(set).sort();
}

export function getOcasiones(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    for (const o of p.ocasiones) set.add(o);
  }
  return Array.from(set).sort();
}

export function getGeneros(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    for (const g of p.generos) set.add(g);
  }
  return Array.from(set).sort();
}

export function getPrecioRange(): { min: number; max: number } {
  const productos = getProductos();
  if (productos.length === 0) return { min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const p of productos) {
    if (p.precio < min) min = p.precio;
    if (p.precio > max) max = p.precio;
  }
  return { min, max };
}

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

export function findCategoriaBySlug(slug: string): string | null {
  return getCategorias().find((c) => slugify(c) === slug) ?? null;
}

export function findMarcaBySlug(slug: string): string | null {
  return getMarcas().find((m) => slugify(m) === slug) ?? null;
}

export function getProductosByCategoria(categoria: string): Producto[] {
  return getProductos().filter((p) => p.categorias.includes(categoria));
}

export function getProductosByMarca(marca: string): Producto[] {
  return getProductos().filter((p) => p.marca === marca);
}
