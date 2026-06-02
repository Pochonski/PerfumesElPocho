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
  // Asegurar que imagenes sea siempre string[]
  for (const p of data) {
    if (!Array.isArray(p.imagenes)) {
      p.imagenes = [];
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
