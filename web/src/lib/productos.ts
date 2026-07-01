import fs from "fs";
import path from "path";
import type { FacetCounts } from "./facet-counts";
import { normalizeText, slugify } from "./utils";

export { normalizeText, slugify } from "./utils";

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
  familias_olfativas: string[];
  ocasiones: string[];
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

    if (p.familias_olfativas.length === 0 && p.familia_olfativa) {
      p.familias_olfativas = p.familia_olfativa
        .split(",")
        .map((f: string) => f.trim())
        .filter(Boolean);
    }

    if (p.ocasiones.length === 0 && p.ocasion) {
      p.ocasiones = p.ocasion
        .split(",")
        .map((o: string) => o.trim())
        .filter(Boolean);
    }

    if (p.generos.length === 0 && p.genero) {
      p.generos = p.genero
        .split(",")
        .map((g: string) => g.trim())
        .filter(Boolean);
    }

    if (!p.resumen && p.descripcion) {
      p.resumen = p.descripcion.slice(0, 150).trim() + (p.descripcion.length > 150 ? "…" : "");
    }

    if (!p.descripcion && (p.nombre || p.marca || p.concentracion)) {
      const parts: string[] = [];
      if (p.marca) parts.push(p.marca);
      if (p.concentracion) parts.push(p.concentracion);
      if (p.tamano) parts.push(p.tamano);
      if (p.familia_olfativa) parts.push(`Familia olfativa: ${p.familia_olfativa}`);
      p.descripcion = parts.length > 0
        ? `${p.nombre}. ${parts.join(". ")}.`
        : p.nombre;
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
  return Array.from(cats).sort((a, b) => a.localeCompare(b, "es"));
}

export function getMarcas(): string[] {
  const marcas = new Set<string>();
  for (const p of getProductos()) {
    if (p.marca) marcas.add(p.marca);
  }
  return Array.from(marcas).sort((a, b) => a.localeCompare(b, "es"));
}

export function getConcentraciones(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    if (p.concentracion) set.add(p.concentracion);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
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
    return a.localeCompare(b, "es");
  });
}

export function getFamiliasOlfativas(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    for (const f of p.familias_olfativas) set.add(f);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

export function getOcasiones(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    for (const o of p.ocasiones) set.add(o);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

export function getGeneros(): string[] {
  const set = new Set<string>();
  for (const p of getProductos()) {
    for (const g of p.generos) set.add(g);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
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

export function getFacetCounts(
  productos: Producto[],
  active: {
    marcas: string[];
    familias: string[];
    ocasiones: string[];
    generos: string[];
  }
): FacetCounts {
  const counts: FacetCounts = {
    marcas: {},
    familias: {},
    ocasiones: {},
    generos: {},
  };

  function matchAllExcept(
    p: Producto,
    skip: "marca" | "familia" | "ocasion" | "genero"
  ): boolean {
    if (skip !== "marca" && active.marcas.length > 0 && !active.marcas.includes(p.marca)) {
      return false;
    }
    if (
      skip !== "familia" &&
      active.familias.length > 0 &&
      !p.familias_olfativas.some((f) => active.familias.includes(f))
    ) {
      return false;
    }
    if (
      skip !== "ocasion" &&
      active.ocasiones.length > 0 &&
      !p.ocasiones.some((o) => active.ocasiones.includes(o))
    ) {
      return false;
    }
    if (
      skip !== "genero" &&
      active.generos.length > 0 &&
      !p.generos.some((g) => active.generos.includes(g))
    ) {
      return false;
    }
    return true;
  }

  for (const p of productos) {
    if (matchAllExcept(p, "marca") && p.marca) {
      counts.marcas[p.marca] = (counts.marcas[p.marca] || 0) + 1;
    }
    if (matchAllExcept(p, "familia")) {
      for (const f of p.familias_olfativas) {
        counts.familias[f] = (counts.familias[f] || 0) + 1;
      }
    }
    if (matchAllExcept(p, "ocasion")) {
      for (const o of p.ocasiones) {
        counts.ocasiones[o] = (counts.ocasiones[o] || 0) + 1;
      }
    }
    if (matchAllExcept(p, "genero")) {
      for (const g of p.generos) {
        counts.generos[g] = (counts.generos[g] || 0) + 1;
      }
    }
  }

  return counts;
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
