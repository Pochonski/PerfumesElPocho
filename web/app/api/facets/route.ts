import { NextResponse } from "next/server";
import { getProductos, getPrecioRange } from "@/lib/productos";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const productos = getProductos();

  const categorias = new Set<string>();
  const marcas = new Set<string>();
  const familias = new Set<string>();
  const ocasiones = new Set<string>();
  const generos = new Set<string>();

  for (const p of productos) {
    for (const c of p.categorias) categorias.add(c);
    if (p.marca) marcas.add(p.marca);
    for (const f of p.familias_olfativas) familias.add(f);
    for (const o of p.ocasiones) ocasiones.add(o);
    for (const g of p.generos) generos.add(g);
  }

  return NextResponse.json(
    {
      categorias: Array.from(categorias).sort((a, b) => a.localeCompare(b, "es")),
      marcas: Array.from(marcas).sort((a, b) => a.localeCompare(b, "es")),
      familias: Array.from(familias).sort((a, b) => a.localeCompare(b, "es")),
      ocasiones: Array.from(ocasiones).sort((a, b) => a.localeCompare(b, "es")),
      generos: Array.from(generos).sort((a, b) => a.localeCompare(b, "es")),
      precioRange: getPrecioRange(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
