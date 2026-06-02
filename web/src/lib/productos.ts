import fs from "fs";
import path from "path";

export interface ProductoImagen {
  url: string;
  local: string;
}

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
  imagenes: ProductoImagen[];
  marca: string;
  concentracion: string;
  tamano: string;
  genero: string;
  ocasion: string;
  familia_olfativa: string;
}

let cached: Producto[] | null = null;

export function getProductos(): Producto[] {
  if (cached) return cached;
  const jsonPath = path.join(
    process.cwd(),
    "..",
    "scraper",
    "output",
    "productos.json"
  );
  if (!fs.existsSync(jsonPath)) return [];
  cached = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  return cached as Producto[];
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
